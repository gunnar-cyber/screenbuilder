<template src="./Dial.html"></template>
<style src="./Dial.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { SpinnerActions } from "../../classes/SpinnerActions";
import { DialType } from "../../store/SpinnerSelection";
import InnerDial from "../../components/InnerDial/InnerDial.vue";
import { DialID } from "@/store/SpinnerSelection";
import { HamiltonIERatioOptions, HamiltonIERatio, HamiltonIERatioOptionStrings } from "@/classes/HamiltonIERatio";
import { PatientAgeCategory } from "@screenbuilder/components";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { IERatio } from "isimulate-screen-builder";
import { PatientType } from "@/types/PatientTypes";
import rateTi from "@/config/rateTi.json";
import { getOrangeDotMaxValueForPramp } from "@/helpers/orangeDot";
import { AlarmDialState, MainModeState, PatientState, SpinnerResultState, SpinnerSelectionState } from "@/store";

export default defineComponent({
  /**
   * This class will look at
   * (a) The type of Dial and type of Screen we are dealing with
   * (b) Based upon that we will set certain parameters eg like the height or width of the end object
   * (c) If you see "modesSide", "modes" or "controls". These are flags which indicate which
   *     screen we are dealing with eg "controls" means we are receving a dial from the controls screen
   */
  name: "Dial",
  components: { InnerDial },
  computed: {
    ti(): string {
      return MainModeState.TILabel;
    },
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
    currentPatientType() {
      return MainModeState.currentPatientType;
    },
    patientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
    currentCount(): number {
      if (MainModeState.isControlsModeOpen === true) {
        return SpinnerResultState.currentCountForNewMode(this.dialType);
      } else {
        return SpinnerResultState.currentCount(this.dialType);
      }
    },
    currentCountDisplay(): string {
      const isNeoCurrentCountOneDec =
        this.currentPatientType === PatientType.Neonatal &&
        (this.dialType === DialType.Psupport ||
          this.dialType === DialType.Peep ||
          this.dialType === DialType.Pinsp ||
          this.dialType === DialType.Pcontrol ||
          this.dialType === DialType.Vt);

      if (isNeoCurrentCountOneDec) return this.currentCount.toFixed(1);

      const isNeoAndHiFlowMode =
        this.dialType === DialType.HiFlowO2 && this.currentPatientType === PatientType.Neonatal;
      if (isNeoAndHiFlowMode && this.currentCount > 12) {
        return this.currentCount.toString();
      }

      if (isNeoAndHiFlowMode && this.currentCount < 12) {
        return this.currentCount.toFixed(1);
      }

      if (this.dialType === DialType.FlowTrigger || this.dialType === DialType.Weight) {
        return this.currentCount.toFixed(1);
      }

      if (this.dialType === DialType.Ti || this.dialType === DialType.TiMax) {
        return this.currentCount.toFixed(2);
      }

      if (
        this.dialType !== DialType.FlowTrigger &&
        this.dialType !== DialType.Ti &&
        this.dialType !== DialType.Weight &&
        this.dialType !== DialType.TiMax
      ) {
        return this.currentCount.toFixed(0);
      }

      return this.currentCount.toString();
    },
    isOn(): boolean {
      return SpinnerSelectionState.isControlActive(this.dialType as DialID);
    },
    anyActive(): boolean {
      return SpinnerSelectionState.active !== null;
    },
    inHiFlowMode(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
  },
  watch: {
    anyActive(value: boolean) {
      if (!value) {
        SpinnerSelectionState.deactivateAndSelect();
        if (this.weightDialOn || this.heightDialOn) {
          SpinnerResultState.setCount({
            value: this.getCurrentVTViaIBWOrWeight(),
            dialType: DialType.Vt,
            alarmOrDial: "dial",
          });
          SpinnerResultState.setCount({
            value: this.getCurrentRateViaIBWOrWeight(),
            dialType: DialType.Rate,
            alarmOrDial: "dial",
          });
          SpinnerResultState.setCount({
            value: this.getCurrentTIViaIBWOrWeight(),
            dialType: DialType.Ti,
            alarmOrDial: "dial",
          });
        }
      }
      this.weightDialOn = SpinnerSelectionState.isControlActive(DialType.Weight as DialID);
      this.heightDialOn = SpinnerSelectionState.isControlActive(DialType.Height as DialID);
    },
    currentCount: {
      handler: function (newVal): void {
        if (this.dialType === DialType.Height) {
          this.setIBWFromDial(newVal);
        } else if (this.dialType === DialType.MinVol) {
          this.recordMinVolValue(newVal);
        } else if (
          (this.currentMode === HamiltonModeType.PSIMV_PLUS ||
            this.currentMode === HamiltonModeType.SIMV_PLUS ||
            this.currentMode === HamiltonModeType.NIV_ST) &&
          (this.dialType === DialType.Rate || this.dialType === DialType.Ti)
        ) {
          let rate =
            this.dialType === DialType.Rate
              ? this.currentCount
              : this.screenType === "modes"
              ? SpinnerResultState.currentCountForNewMode(DialType.Rate)
              : SpinnerResultState.currentCount(DialType.Rate);

          let ti =
            this.dialType === DialType.Ti
              ? this.currentCount
              : this.screenType === "modes"
              ? SpinnerResultState.currentCountForNewMode(DialType.Ti)
              : SpinnerResultState.currentCount(DialType.Ti);

          let ratio = HamiltonIERatio.fromRatio(IERatio.fromTI(ti, rate));
          MainModeState.IELabel = HamiltonIERatio.formatRatioI(ratio.i) + ":" + HamiltonIERatio.formatRatioE(ratio.e);
          MainModeState.TELabel = IERatio.expirationTime(ratio, rate).toFixed(2);
        } else if (
          (this.currentMode === HamiltonModeType.SCMV_PLUS || this.currentMode === HamiltonModeType.PCV_PLUS) &&
          (this.dialType === DialType.Rate || this.dialType === DialType.Ie)
        ) {
          let rate =
            this.dialType === DialType.Rate
              ? this.currentCount
              : this.screenType === "modes"
              ? SpinnerResultState.currentCountForNewMode(DialType.Rate)
              : SpinnerResultState.currentCount(DialType.Rate);

          let ie =
            this.dialType === DialType.Ie
              ? this.currentCount
              : this.screenType === "modes"
              ? SpinnerResultState.currentCountForNewMode(DialType.Ie)
              : SpinnerResultState.currentCount(DialType.Ie);

          let ratioString = HamiltonIERatioOptionStrings[ie];
          let ratio = IERatio.fromString(ratioString);
          if (ratio !== null) {
            MainModeState.TELabel = IERatio.expirationTime(ratio, rate).toFixed(2);
            MainModeState.TILabel = IERatio.inspirationTime(ratio, rate).toFixed(2);
          } else {
            MainModeState.TELabel = "0.00";
            MainModeState.TILabel = "0.00";
          }
        }
      },
    },
    adultOrNeoDialType() {
      this.setUpDial();
    },
    inHiFlowMode() {
      this.setUpDial();
    },
  },
  data() {
    return {
      onDialBackgroundColor: "#FFA500",
      offDialBackgroundColor: "",
      dialTextColor: "black",
      minHard: "",
      maxHard: "",
      minMode: 0,
      maxMode: 0,
      dialText: "",
      intDec: "",
      rangeAndIncrements: [{ start: 0, end: 0, increment: 0 }],
      customWidth: 0,
      customHeight: 0,
      customPadding: 0,
      useModeMinMax: false,
      styleTextOn: "",
      styleTextOff: "",
      styleNumberTextOn: "",
      styleNumberTextOff: "",
      ieOptions: [] as Array<HamiltonIERatio>,
      dialLabel: "",
      dialLabelTextPad: false,
      dialSVGLabelTextWithPad: "dialSVGLabelTextWithPad",
      outerDialCircle: false,
      showOuterDialText: true,
      showMaxOrangeDial: false,
      showMinOrangeDial: false,
      weightDialOn: false,
      heightDialOn: false,
      rateTiJson: rateTi,
    };
  },
  props: {
    dialType: {
      type: String,
      required: true,
    },
    currentMode: {
      type: String,
      required: true,
    },
    screenType: String,
  },
  mounted() {
    this.checkForLastPatient();
    this.setUpDial();
  },
  methods: {
    checkForLastPatient() {
      if (this.screenType === "lastpatient") {
        SpinnerResultState.whichDialToUseViaLastPatient();
      }
    },
    setUpDial() {
      if (this.dialType === "none") return;

      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === this.dialType);
      if (dial === undefined) {
        console.error(`Dial of type '${this.dialType}' not found in config`);
        return;
      }

      if (
        dial.dialType !== DialType.Rate &&
        dial.dialType !== DialType.Ti &&
        dial.dialType !== DialType.Pramp &&
        dial.dialType !== DialType.Ie
      ) {
        this.useModeMinMax = false;
        // these are needed to hide the orange dots
        this.minMode = dial.min;
        this.maxMode = dial.max;
      }

      if (
        this.dialType === DialType.Ti ||
        this.dialType === DialType.FlowTrigger ||
        (this.dialType === DialType.TiMax && this.patientType === PatientAgeCategory.Adult)
      ) {
        this.minHard = dial.min.toFixed(1);
        this.maxHard = dial.max.toFixed(1);
      } else if (this.dialType === DialType.TiMax && this.patientType === PatientAgeCategory.Neonate) {
        this.minHard = dial.min.toFixed(2);
        this.maxHard = dial.max.toFixed(2);
      } else if (this.dialType === DialType.Rate) {
        this.setMinAndMaxForRateDial();
      } else {
        this.minHard = dial.min.toString();
        this.maxHard = dial.max.toString();
      }

      this.dialText = dial.dialText;
      this.dialLabel = this.screenType == "vent" && dial?.dialType === DialType.Weight ? "" : dial.dialLabel;
      this.intDec = dial.intDec;
      this.rangeAndIncrements = dial.range_and_increments!;

      this.setAllTemplateValues();

      if (this.dialType === DialType.Ie) {
        this.ieOptions = HamiltonIERatioOptions;
      }
    },
    setMinAndMaxForRateDial() {
      let normalMinAndMax =
        ((this.currentMode === HamiltonModeType.SCMV_PLUS ||
          this.currentMode === HamiltonModeType.PSIMV_PLUS ||
          this.currentMode === HamiltonModeType.PCV_PLUS ||
          this.currentMode === HamiltonModeType.NIV_ST ||
          this.currentMode === HamiltonModeType.SIMV_PLUS) &&
          this.patientType === PatientAgeCategory.Adult) ||
        ((this.currentMode === HamiltonModeType.SCMV_PLUS ||
          this.currentMode === HamiltonModeType.PSIMV_PLUS ||
          this.currentMode === HamiltonModeType.PCV_PLUS ||
          this.currentMode === HamiltonModeType.NIV_ST ||
          this.currentMode === HamiltonModeType.SIMV_PLUS) &&
          this.patientType === PatientAgeCategory.Neonate);
      if (
        (this.currentMode === HamiltonModeType.SPONT || this.currentMode === HamiltonModeType.NIV) &&
        this.patientType === PatientAgeCategory.Adult
      ) {
        this.minHard = "4";
        this.maxHard = "80";
      }
      if (
        (this.currentMode === HamiltonModeType.SPONT || this.currentMode === HamiltonModeType.NIV) &&
        this.patientType === PatientAgeCategory.Neonate
      ) {
        this.minHard = "10";
        this.maxHard = "80";
      }
      if (normalMinAndMax) {
        this.minHard = "1";
        this.maxHard = "80";
      }
    },
    setAllTemplateValues() {
      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === this.dialType);
      if (this.screenType == "modesSide") {
        this.customWidth = 135;
        this.customHeight = 75;
        this.customPadding = 12;
        this.offDialBackgroundColor = "transparent";
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOn";
        this.styleNumberTextOff = "dialSVGNumberTextOn";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "white";
        this.dialLabelTextPad = true;
        this.outerDialCircle = false;
        this.showOuterDialText = true;
      }

      if (this.screenType == "vent" && dial?.dialType === DialType.Weight) {
        this.customWidth = 385;
        this.customHeight = 80;
        this.customPadding = 0;
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOff";
        this.styleNumberTextOff = "dialSVGNumberTextOff";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "white";
        this.dialLabelTextPad = true;
        this.offDialBackgroundColor = "white";
        this.outerDialCircle = false;
        this.showOuterDialText = true;
      }

      if (this.screenType == "vent" && dial?.dialType === DialType.Height) {
        this.customWidth = 100;
        this.customHeight = 70;
        this.customPadding = 0;
        this.offDialBackgroundColor = "white";
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOff";
        this.styleNumberTextOff = "dialSVGNumberTextOff";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "white";
        this.dialLabelTextPad = true;
        this.outerDialCircle = false;
        this.showOuterDialText = true;
      }

      if (this.screenType == "lastpatient" && dial?.dialType === DialType.Height) {
        this.customWidth = 100;
        this.customHeight = 70;
        this.customPadding = 0;
        this.offDialBackgroundColor = "#1f5192";
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGNumberTextDisabledLabel";
        this.styleNumberTextOff = "dialSVGNumberTextDisabled";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "#1a325b";
        this.dialLabelTextPad = true;
        this.outerDialCircle = true;
        this.showOuterDialText = true;
      }

      if (this.inHiFlowMode && dial?.dialType === DialType.Height) {
        this.customWidth = 100;
        this.customHeight = 70;
        this.customPadding = 0;
        this.offDialBackgroundColor = "#1f5192";
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOffLastPatient";
        this.styleNumberTextOff = "dialSVGNumberTextOffLastPatient";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "#1a325b";
        this.dialLabelTextPad = true;
        this.outerDialCircle = true;
        this.showOuterDialText = true;
      }

      if (this.screenType == "lastpatient" && dial?.dialType === DialType.Weight) {
        this.customWidth = 385;
        this.customHeight = 80;
        this.customPadding = 0;
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOffLastPatient";
        this.styleNumberTextOff = "dialSVGNumberTextOffLastPatient";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "#1a325b";
        this.dialLabelTextPad = false;
        this.offDialBackgroundColor = "#1f5192";
        this.outerDialCircle = true;
        this.showOuterDialText = false;
      }

      if (this.inHiFlowMode && dial?.dialType === DialType.Weight) {
        this.customWidth = 385;
        this.customHeight = 80;
        this.customPadding = 0;
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGNumberTextDisabledLabel";
        this.styleNumberTextOff = "dialSVGNumberTextDisabled";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "#1a325b";
        this.offDialBackgroundColor = "#1f5192";
        this.dialLabelTextPad = true;
        this.outerDialCircle = true;
        this.showOuterDialText = false;
      }
      if (this.inHiFlowMode && dial?.dialType === DialType.Weight && this.screenType !== "lastpatient") {
        this.showOuterDialText = true;
      }

      if (this.screenType == "modes" || this.screenType == "control") {
        this.customWidth = 115;
        this.customHeight = 70;
        this.customPadding = 0;
        this.offDialBackgroundColor = "transparent";
        this.styleTextOn = "dialSVGTextOn";
        this.styleTextOff = "dialSVGTextOff";
        this.styleNumberTextOff = "dialSVGNumberTextOff";
        this.styleNumberTextOn = "dialSVGNumberTextOn";
        this.dialTextColor = "black";
        this.dialLabelTextPad = false;
        this.outerDialCircle = false;
        this.showOuterDialText = true;
      }

      if (this.screenType == "system") {
        this.customWidth = 110;
        this.customHeight = 75;
        this.customPadding = 0;
        this.offDialBackgroundColor = "transparent";
        this.dialLabelTextPad = false;
        this.outerDialCircle = false;
        this.showOuterDialText = true;
      }
    },
    setPeepOrangeDotLimit() {
      if (this.dialType !== DialType.Peep) return;

      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Peep)!;
      let max =
        this.screenType === "modes"
          ? SpinnerResultState.currentCountForNewMode(DialType.Plimit) - 5
          : SpinnerResultState.currentCount(DialType.Plimit) - 5;
      if (max > dial.max) max = dial.max;
      this.showMaxOrangeDial = max === dial.max ? false : true;

      this.maxMode = max;
      this.useModeMinMax = true;
      if (this.currentPatientType === PatientType.Neonatal) {
        this.minMode = 3;
        this.showMinOrangeDial = true;
      } else {
        this.minMode = 0;
        this.showMinOrangeDial = false;
      }
    },
    setRateOrangeDotMaxForPSIMVandSIMVandSpont() {
      if (
        !(
          this.dialType === DialType.Rate &&
          (this.currentMode === HamiltonModeType.PSIMV_PLUS ||
            this.currentMode === HamiltonModeType.SIMV_PLUS ||
            this.currentMode === HamiltonModeType.SPONT)
        )
      )
        return;
      let currentTi = 0;
      currentTi = this.getCurrentCountViaDialType(DialType.Ti);

      this.showMaxOrangeDial = false;
      this.showMinOrangeDial = false;
      this.useModeMinMax = false;
      this.maxMode = 0;
      this.minMode = 0;
      this.rateTiJson.forEach((ele) => {
        if (ele.ti === currentTi) {
          this.useModeMinMax = true;
          this.maxMode = ele.rate;
          this.showMaxOrangeDial = true;
        }
      });
      if (this.currentPatientType === PatientType.Male || this.currentPatientType === PatientType.Female) {
        this.useModeMinMax = true;
        switch (this.currentMode) {
          case HamiltonModeType.PSIMV_PLUS: {
            this.minMode = 5;
            this.showMinOrangeDial = true;
            break;
          }
          case HamiltonModeType.SIMV_PLUS: {
            this.minMode = 1;
            this.showMinOrangeDial = false;
            break;
          }
          case HamiltonModeType.SPONT: {
            this.minMode = 4;
            this.showMinOrangeDial = false;
            break;
          }
        }
      }

      if (this.currentPatientType === PatientType.Neonatal) {
        this.useModeMinMax = true;
        if (this.currentMode === HamiltonModeType.PSIMV_PLUS) {
          this.minMode = 5;
          this.showMinOrangeDial = true;
        }

        if (this.currentMode === HamiltonModeType.SIMV_PLUS) {
          this.minMode = 1;
          this.showMinOrangeDial = false;
        }

        if (this.currentMode === HamiltonModeType.SPONT) {
          this.minMode = 10;
          this.showMinOrangeDial = false;
        }
      }

      if (this.useModeMinMax && this.minMode !== 0 && this.maxMode === 0) {
        const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Rate)!;
        this.maxMode = dial.max;
      }

      if (this.minMode === 0 && this.maxMode === 0) {
        this.useModeMinMax = false;
      }
    },
    setRateOrangeDotMaxForPCVandSCMV() {
      if (
        !(
          this.dialType === DialType.Rate &&
          (this.currentMode === HamiltonModeType.PCV_PLUS || this.currentMode === HamiltonModeType.SCMV_PLUS)
        )
      )
        return;

      let teMin = 0.2;
      let tiMin = 0.1;
      this.showMaxOrangeDial = false;
      this.showMinOrangeDial = true;
      this.useModeMinMax = true;
      this.maxMode = 0;
      this.minMode = 0;
      let ratioCount = 0;
      if (this.screenType == "control") {
        ratioCount = SpinnerResultState.currentCount(DialType.Ie);
      } else {
        ratioCount = SpinnerResultState.currentCountForNewMode(DialType.Ie);
      }
      let ratio = HamiltonIERatioOptions[ratioCount];

      let IRatio = ratio.i;
      let ERatio = ratio.e;
      if (ratio.i > 1) {
        if (IRatio > 4) {
          IRatio = 4;
        }
      }

      if (ratio.e > 1) {
        if (ERatio > 9) {
          ERatio = 9;
        }
      }
      if (IRatio > 1) {
        this.maxMode = 60 / (teMin * (IRatio + 1));
      } else {
        this.maxMode = 60 / (tiMin * (ERatio + 1));
      }
      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Rate)!;
      if (this.currentPatientType === PatientType.Male || this.currentPatientType === PatientType.Female) {
        this.minMode = 4;
        this.showMinOrangeDial = true;
        this.useModeMinMax = true;
      }

      if (this.currentPatientType === PatientType.Neonatal) {
        this.minMode = 10;
        this.showMinOrangeDial = true;
        this.useModeMinMax = true;
      }

      if (!(this.maxMode >= dial.max) && !(this.maxMode <= this.minMode)) {
        this.showMaxOrangeDial = true;
      } else {
        this.maxMode = dial.max;
      }

      if (this.minMode === 0 && this.maxMode === 0) {
        this.useModeMinMax = false;
        this.showMinOrangeDial = false;
        this.showMaxOrangeDial = false;
      }
    },
    setPrampOrangeDotMaxForPSIMVAndSIMVAndPCVandSCMVandSpont() {
      if (
        !(
          this.dialType === DialType.Pramp &&
          (this.currentMode === HamiltonModeType.PSIMV_PLUS ||
            this.currentMode === HamiltonModeType.SIMV_PLUS ||
            this.currentMode === HamiltonModeType.PCV_PLUS ||
            this.currentMode === HamiltonModeType.SCMV_PLUS ||
            this.currentMode === HamiltonModeType.SPONT)
        )
      )
        return;
      let correctMode: HamiltonModeType;
      if (this.screenType === "modes") {
        correctMode = MainModeState.selectedModeInModesScreen;
      } else {
        correctMode = MainModeState.whatModeAreWe;
      }
      this.maxMode = getOrangeDotMaxValueForPramp(correctMode, this.screenType!);
      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Pramp)!;
      this.showMaxOrangeDial = this.maxMode >= dial.max ? false : true;
      this.useModeMinMax = this.maxMode >= dial.max ? false : true;
    },
    getCurrentCountViaDialType(dialType: string): number {
      return this.screenType === "modes"
        ? SpinnerResultState.currentCountForNewMode(dialType)
        : SpinnerResultState.currentCount(dialType);
    },
    setTIOrangeDotMaxForPSIMVandSIMVandSpont() {
      if (
        !(
          this.dialType === DialType.Ti &&
          (this.currentMode === HamiltonModeType.PSIMV_PLUS ||
            this.currentMode === HamiltonModeType.SIMV_PLUS ||
            this.currentMode === HamiltonModeType.SPONT)
        )
      )
        return;

      let currentRateCount = this.getCurrentCountViaDialType(DialType.Rate);
      if (currentRateCount !== 0) {
        let t = Number(((60 / currentRateCount / 0.1) * 0.1).toFixed(2));
        let teMin = 0;
        let tiMax = 0;
        if (currentRateCount > 60) {
          tiMax = Number((t - 0.203).toFixed(2));
        } else if (currentRateCount < 14) {
          tiMax = Number((t * 1.0028 - 0.8458).toFixed(1));
        } else {
          tiMax = Math.round((t * 0.8 - 0.025) / 0.05) * 0.05;
        }
        teMin = Number((t - tiMax).toFixed(2));
        this.maxMode = t - teMin;
        const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Ti)!;
        this.showMaxOrangeDial = this.maxMode >= dial.max ? false : true;
        this.useModeMinMax = this.maxMode >= dial.max ? false : true;
        this.maxMode = this.maxMode >= dial.max ? 0 : t - teMin;
        this.minMode = 0.1;
      } else {
        this.maxMode = 0;
        this.minMode = 0;
        this.useModeMinMax = false;
        this.showMaxOrangeDial = false;
      }
    },
    setIEOrangeDotMaxForPCVandSCMV() {
      if (
        !(
          this.dialType === DialType.Ie &&
          (this.currentMode === HamiltonModeType.PCV_PLUS || this.currentMode === HamiltonModeType.SCMV_PLUS)
        )
      )
        return;
      const maxERatioValue = 9;
      const minERatioValue = 0;
      const maxIRatioValue = 4;
      const minIRatioValue = 1;
      const iRatioEndMax = [
        { i: 3.9, max: 58 },
        { i: 3.8, max: 57 },
        { i: 3.7, max: 56 },
        { i: 3.6, max: 55 },
        { i: 3.5, max: 54 },
        { i: 3.4, max: 53 },
        { i: 3.3, max: 52 },
        { i: 3.2, max: 51 },
        { i: 3.1, max: 50 },
        { i: 3, max: 49 },
        { i: 2.9, max: 48 },
        { i: 2.8, max: 47 },
        { i: 2.7, max: 46 },
      ];
      const eRatioEndMax = [
        { e: 8, max: 1 },
        { e: 7, max: 2 },
        { e: 6, max: 3 },
      ];
      const tiMin = 0.1;
      const teMin = 0.2;
      this.minMode = 0;
      this.maxMode = 0;
      this.useModeMinMax = false;
      let currentRateCount = this.getCurrentCountViaDialType(DialType.Rate);
      if (
        (60 / currentRateCount - tiMin) / tiMin >= maxERatioValue ||
        (60 / currentRateCount - tiMin) / tiMin <= minERatioValue
      ) {
        this.showMaxOrangeDial = false;
      } else {
        let currentE = Number(((60 / currentRateCount - tiMin) / tiMin).toString().substring(0, 1));
        this.minMode = eRatioEndMax.find((ele) => ele.e === currentE)?.max!;
        this.showMinOrangeDial = true;
        this.useModeMinMax = true;
      }

      if (
        (60 / currentRateCount - teMin) / teMin >= maxIRatioValue ||
        (60 / currentRateCount - teMin) / teMin <= minIRatioValue
      ) {
        this.showMinOrangeDial = false;
      } else {
        let currentI = Number(((60 / currentRateCount - teMin) / teMin).toString().substring(0, 3));
        this.maxMode = iRatioEndMax.find((ele) => ele.i === currentI)?.max!;
        this.showMaxOrangeDial = true;
        this.useModeMinMax = true;
      }
    },
    setPlimitOrangeDotLimit() {
      if (this.dialType !== DialType.Plimit) return;
      // There is no PEEP in APRV mode, so we don't have a minimum limit for PLIMIT
      if (this.currentMode === HamiltonModeType.APRV) return;

      const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === DialType.Plimit)!;
      let min = 0;
      if (this.screenType === "modes") {
        min = SpinnerResultState.currentCountForNewMode(DialType.Peep) + 5;
      } else {
        if (AlarmDialState.CurrentBottomDialValue - 10 > SpinnerResultState.currentCount(DialType.Peep) + 5) {
          min = AlarmDialState.CurrentBottomDialValue - 10;
        } else {
          min = SpinnerResultState.currentCount(DialType.Peep) + 5;
        }
      }

      if (min < dial.min) min = dial.min;

      this.minMode = min;
      this.useModeMinMax = true;
      this.showMinOrangeDial = true;
    },
    /** Used when dial is selected / de selected */
    toggleDialEvent() {
      let currVal = this.currentCount;
      const type = this.dialType as DialID;

      if (this.isOn) {
        SpinnerSelectionState.deactivateAndSelect();

        if (this.dialType === DialType.Height || this.dialType === DialType.Weight) {
          SpinnerResultState.setCount({
            value: this.getCurrentVTViaIBWOrWeight(),
            dialType: DialType.Vt,
            alarmOrDial: "dial",
          });
          SpinnerResultState.setCount({
            value: this.getCurrentRateViaIBWOrWeight(),
            dialType: DialType.Rate,
            alarmOrDial: "dial",
          });
          SpinnerResultState.setCount({
            value: this.getCurrentTIViaIBWOrWeight(),
            dialType: DialType.Ti,
            alarmOrDial: "dial",
          });
        }
      } else if (!SpinnerSelectionState.anyActive) {
        // turn on
        const lowerMode = this.currentMode.toLowerCase();
        const dial = this.adultOrNeoDialType.find((dial) => dial.dialType === this.dialType)!;
        const dialMode = dial.modesAndRanges.find((el) => el.mode === lowerMode)!;

        if (dialMode !== undefined) {
          if (
            dial.dialType !== DialType.Rate &&
            dial.dialType !== DialType.Ti &&
            dial.dialType !== DialType.Pramp &&
            dial.dialType !== DialType.Ie
          ) {
            this.minMode = dialMode.modeMin;
            this.maxMode = dialMode.modeMax;
          }
        }

        this.setPeepOrangeDotLimit();
        this.setPlimitOrangeDotLimit();
        this.setRateOrangeDotMaxForPCVandSCMV();
        this.setPrampOrangeDotMaxForPSIMVAndSIMVAndPCVandSCMVandSpont();
        this.setTIOrangeDotMaxForPSIMVandSIMVandSpont();
        this.setIEOrangeDotMaxForPCVandSCMV();
        this.setRateOrangeDotMaxForPSIMVandSIMVandSpont();

        let spinActions = new SpinnerActions();
        spinActions.startSpinner(
          type,
          this.useModeMinMax ? this.maxMode : Number(this.maxHard),
          this.useModeMinMax ? this.minMode : Number(this.minHard),
          currVal,
          this.intDec,
          "commonDial",
          this.currentMode,
          this.patientType,
          this.screenType === "modes",
          this.rangeAndIncrements
        );

        SpinnerSelectionState.setDialType({
          dialType: type,
          alarmOrDial: "dial",
          spinnerActions: spinActions,
        });
      }
    },
    setIBWFromDial(height: number) {
      MainModeState.setIBW({ height: height });
    },
    recordMinVolValue(value: number) {
      MainModeState.setMinVolLabel({ currentMinVolValue: value });
    },
    getCurrentRateViaIBWOrWeight(): number {
      return SpinnerResultState.processRateDialIBWOrWeight();
    },
    getCurrentVTViaIBWOrWeight(): number {
      return SpinnerResultState.processVTDialIBWOrWeight();
    },
    getCurrentTIViaIBWOrWeight(): number {
      return SpinnerResultState.processTIDialIBWOrWeight();
    },
    modeHasDial(dialType: DialType): boolean {
      let result = SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === dialType);
      return result != undefined;
    },
  },
});
</script>
