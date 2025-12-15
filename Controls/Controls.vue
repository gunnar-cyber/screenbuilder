<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./Controls.css" scoped></style>
<template src="./Controls.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import Dial from "../../components/Dial/Dial.vue";
import { IERatio } from "isimulate-screen-builder";
import {
  MainModeState,
  NavigationState,
  PatientState,
  SpinnerResultState,
  SpinnerSelectionState,
  StandbyStoreState,
} from "@/store/index";
import greenTickOn from "../../img/Controls/greenTick.png";
import greenTickOff from "../../img/Controls/greenTickOff.png";
import { DialType } from "../../store/SpinnerSelection";
import Gender from "@/components/Gender/Gender.vue";
import VentTimer from "@/components/VentTimer/VentTimer.vue";
import { StandBy } from "../../classes/Standby";
import { ControlsMode } from "@/classes/Controls/ControlsMode";
import { HamiltonIERatio, HamiltonIERatioOptionStrings } from "@/classes/HamiltonIERatio";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { PatientType } from "@/types/PatientTypes";
import { PatientAgeCategory } from "@screenbuilder/components";

/**
 * This is used for both selecting a mode and modifying the controls of an active mode.
 * The UI is slightly different depending on which it is.
 */
export default defineComponent({
  name: "Controls",
  components: { Dial, Gender, VentTimer },
  props: {
    /** This will not be supplied if modifying controls for active mode */
    selectionMode: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      activeConfirm: 1,
      activeSetMode: 1,
      activeModeType: 1,
      activetab: 1,
      modeLabel: "(S)CMV+",
      padTop: 0,
      greenTickOn: greenTickOn,
      greenTickOff: greenTickOff,
      greenTickImageSigh: greenTickOff,
      greenTickBackUp: greenTickOff,
      greenTickAuto: greenTickOff,
      controls: [[{ dialType: "", miscData: false }]],
      controlsMore: [[{ dialType: "", miscData: false }]],
      controlsApnea: [[{ dialType: "", miscData: false, type: "" }]],
      psyncVisible: false,
      tiVisible: false,
      teVisible: false,
      ieVisible: false,
      sighVisible: false,
      standByCls: new StandBy(),
      clsMode: new ControlsMode(),
      apneaLabel: false,
      autoVisible: false,
      backupVisible: false,
      isAutoTicked: true,
      backUpMode: "",
      hideAutoControls: true,
      pinsp: "pinsp",
      pControl: "pControl",
      pControlPSIMVID: "pControlPSIMVID",
      minVolLabel: false,
      minVolLabelValue: 0,
      miscDataCls: "",
      dialTypeWeight: "",
      male: PatientType.Male,
      female: PatientType.Female,
      neonatal: PatientType.Neonatal,
    };
  },
  created() {
    this.modesType(this.currentMode);
    this.fillPositionArray();
    this.dialTypeWeight = this.adultOrNeoDialType.find(
      (ele: { dialType: string }) => ele.dialType === "weight"
    )!.dialType;
  },
  mounted() {
    this.setLabels();
  },
  computed: {
    psyncEnabled(): boolean {
      return MainModeState.psyncEnabled;
    },
    greenTickImagePsync(): string {
      return this.psyncEnabled ? this.greenTickOn : this.greenTickOff;
    },
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
    getPatientType() {
      return MainModeState.currentPatientType;
    },
    calculateMinVolValue(): string {
      return MainModeState.getMinVolValue;
    },
    mDialScreenType() {
      return this.isSelectingMode ? "modes" : "control";
    },
    isSelectingMode(): boolean {
      return this.selectionMode !== undefined;
    },
    ti(): string {
      return MainModeState.TILabel;
    },
    te(): string {
      return MainModeState.TELabel;
    },
    ie(): string {
      return MainModeState.IELabel;
    },
    currentMode(): HamiltonModeType {
      return this.selectionMode !== undefined ? (this.selectionMode as HamiltonModeType) : this.whatModeAreWeIn;
    },
    whatModeAreWeIn(): HamiltonModeType {
      return MainModeState.whatModeAreWe;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
    currentPatientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
  },
  watch: {
    activetab(value: number) {
      if (
        (this.currentMode === HamiltonModeType.PSIMV_PLUS ||
          this.currentMode === HamiltonModeType.SIMV_PLUS ||
          this.currentMode === HamiltonModeType.PCV_PLUS ||
          this.currentMode === HamiltonModeType.SCMV_PLUS ||
          this.currentMode === HamiltonModeType.SPONT ||
          this.currentMode === HamiltonModeType.NIV ||
          this.currentMode === HamiltonModeType.NIV_ST) &&
        value == 2
      ) {
        SpinnerResultState.doPrampCheck(this.mDialScreenType!);
      }
    },
  },
  methods: {
    // NOTE this is duplicated in Dial.vue currentCount watch
    // TODO check that this actually works, IE should start at 1:4.0 but is index 0
    setLabels() {
      if (
        this.currentMode === HamiltonModeType.PSIMV_PLUS ||
        this.currentMode === HamiltonModeType.SIMV_PLUS ||
        this.currentMode === HamiltonModeType.NIV_ST
      ) {
        let rate = this.isSelectingMode
          ? SpinnerResultState.currentCount(DialType.Rate)
          : SpinnerResultState.currentCountForNewMode(DialType.Rate);
        let ti = this.isSelectingMode
          ? SpinnerResultState.currentCount(DialType.Ti)
          : SpinnerResultState.currentCountForNewMode(DialType.Ti);

        let ratio = HamiltonIERatio.fromRatio(IERatio.fromTI(ti, rate));

        MainModeState.IELabel = ratio.toString();
        MainModeState.TELabel = IERatio.expirationTime(ratio, rate).toFixed(2);
      } else if (this.currentMode === HamiltonModeType.SCMV_PLUS || this.currentMode === HamiltonModeType.PCV_PLUS) {
        let rate = SpinnerResultState.currentCount(DialType.Rate);
        let ie = SpinnerResultState.currentCount(DialType.Ie);
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
    fillPositionArray() {
      if (this.modeLabel === "PCV+") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 50;
        this.psyncVisible = false;
        this.tiVisible = true;
        this.teVisible = true;
        this.ieVisible = false;
        this.miscDataCls = "controlsPadTopMiscData";
        //more tab
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
      }

      if (this.modeLabel === "(S)CMV+") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 50;
        this.psyncVisible = false;
        this.tiVisible = true;
        this.teVisible = true;
        this.ieVisible = false;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
      }

      if (this.modeLabel === "SIMV+") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = true;
        this.ieVisible = true;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
        //apnea
        this.controlsApnea = this.clsMode.GetApneaTabControls(this.modeLabel);
        this.greenTickBackUp = this.greenTickOn;
        this.greenTickAuto = this.greenTickOn;
        this.autoVisible = true;
        this.backupVisible = true;
        this.backUpMode = "SIMV+";
      }

      if (this.modeLabel === "PSIMV+") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 20;
        this.psyncVisible = true;
        this.tiVisible = false;
        this.teVisible = true;
        this.ieVisible = true;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
      }

      if (this.modeLabel === "SPONT") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = false;
        this.ieVisible = false;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
        //apnea
        this.controlsApnea = this.clsMode.GetApneaTabControls(this.modeLabel);
        this.greenTickBackUp = this.greenTickOn;
        this.greenTickAuto = this.greenTickOff;
        this.isAutoTicked = false;
        this.autoVisible = true;
        this.backupVisible = true;
        this.backUpMode = "SIMV+";
      }

      if (this.modeLabel === "ASV") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = false;
        this.ieVisible = false;
        this.minVolLabel = true;
        MainModeState.setMinVolLabel({ currentMinVolValue: SpinnerResultState.currentCount("minvol") });
        this.miscDataCls = "controlsPadTopMiscDataMinVol";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
      }

      if (this.modeLabel === "NIV") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = true;
        this.ieVisible = true;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOff;
        //apnea
        this.controlsApnea = this.clsMode.GetApneaTabControls(this.modeLabel);
        this.greenTickAuto = this.greenTickOn;
        this.isAutoTicked = true;
        this.greenTickBackUp = this.greenTickOn;
        this.autoVisible = true;
        this.backupVisible = true;
        this.backUpMode = "PCV+";
      }
      if (this.modeLabel === "NIV-ST") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = true;
        this.ieVisible = true;
        this.miscDataCls = "controlsPadTopMiscData";
        //more
        this.controlsMore = this.clsMode.GetMoreTabControls(this.modeLabel, this.getPatientType);
        this.sighVisible = true;
        this.greenTickImageSigh = this.greenTickOn;
      }
      if (this.modeLabel === "HiFlowO2") {
        this.controls = this.clsMode.GetBasicTabControls(this.modeLabel);
        this.padTop = 30;
        this.psyncVisible = false;
        this.tiVisible = false;
        this.teVisible = false;
        this.ieVisible = false;
        this.miscDataCls = "controlsPadTopMiscData";
        this.controlsMore = [];
        this.sighVisible = false;
      }
    },
    /** Only used for mode selection */
    cancel() {
      this.$emit("cancel");
    },
    /** Only used for mode selection */
    confirm() {
      this.$emit("confirm");
      MainModeState.isControlsModeOpen = false;
    },
    close() {
      if (this.isAnyDialOn) return;
      NavigationState.resetMainNavigationButtons();
    },
    modesType(modeType: string) {
      switch (modeType.toLowerCase()) {
        case "(s)cmv+": {
          this.modeLabel = "(S)CMV+";
          this.activeModeType = 1;
          break;
        }
        case "simv+": {
          this.modeLabel = "SIMV+";
          this.activeModeType = 2;
          break;
        }
        case "vs": {
          this.modeLabel = "VS";
          this.activeModeType = 3;
          break;
        }
        case "pcv+": {
          this.modeLabel = "PCV+";
          this.activeModeType = 4;
          break;
        }
        case "psimv+": {
          this.modeLabel = "PSIMV+";
          this.activeModeType = 5;
          break;
        }
        case "spont": {
          this.modeLabel = "SPONT";
          this.activeModeType = 6;
          break;
        }
        case "duoPap": {
          this.modeLabel = "DuoPAP";
          this.activeModeType = 7;
          break;
        }
        case "aprv": {
          this.modeLabel = "APRV";
          this.activeModeType = 8;
          break;
        }
        case "asv": {
          this.modeLabel = "ASV";
          this.activeModeType = 9;
          break;
        }
        case "intelAsv": {
          this.modeLabel = "Intellivent-ASV";
          this.activeModeType = 10;
          break;
        }
        case "niv": {
          this.modeLabel = "NIV";
          this.activeModeType = 11;
          break;
        }
        case "niv-st": {
          this.modeLabel = "NIV-ST";
          this.activeModeType = 12;
          break;
        }
        case "hiflowo2": {
          this.modeLabel = "HiFlowO2";
          this.activeModeType = 13;
          break;
        }
        case "cpr": {
          this.modeLabel = "CPR";
          this.activeModeType = 14;
          break;
        }
      }
    },
    toggleImage(imageType: string) {
      if (imageType === "psync") {
        let enabled = !this.psyncEnabled;
        MainModeState.setDialFromPsync({ value: enabled });
        SpinnerResultState.updateSettingsForPSync(enabled, this.isSelectingMode);
      }

      if (imageType === "sigh") {
        this.greenTickImageSigh = this.greenTickImageSigh === this.greenTickOn ? this.greenTickOff : this.greenTickOn;
      }

      if (imageType === "back") {
        this.greenTickBackUp = this.greenTickBackUp === this.greenTickOn ? this.greenTickOff : this.greenTickOn;
        this.hideAutoControls = this.greenTickBackUp === this.greenTickOn ? true : false;
      }

      if (imageType === "auto") {
        this.greenTickAuto = this.greenTickAuto === this.greenTickOn ? this.greenTickOff : this.greenTickOn;
        this.isAutoTicked = this.greenTickAuto === this.greenTickOff ? false : true;
      }
    },
    reset() {
      StandbyStoreState.isVentResetClicked = true;
    },
  },
});
</script>
