<template src="./AlarmDial.html"></template>
<style src="./AlarmDial.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { SpinnerActions } from "../../classes/SpinnerActions";
import { DialType } from "../../store/SpinnerSelection";
import InnerDial, { redDialMaxValue } from "../../components/InnerDial/InnerDial.vue";
import { DialID } from "@/store/SpinnerSelection";
import { AlarmDialState, SpinnerResultState, PatientState, SpinnerSelectionState } from "@/store";
import { PressureCmH2O } from "@/classes/AlarmDials/PressureCmH2O";
import { ExpMinVol } from "@/classes/AlarmDials/ExpMinVol";
import { FTotal } from "@/classes/AlarmDials/FTotal";
import { VT } from "@/classes/AlarmDials/VT";
import { Apnea } from "@/classes/AlarmDials/Apnea";
import { Oxygen } from "@/classes/AlarmDials/Oxygen";
import { RetDialObject, PatientData } from "@/classes/AlarmDials/Utilities/CommonDialClasses";
import OffOrangeImage from "@/img/Alarm/OffNotTransparent.png";
import OffNotOrangeImage from "@/img/Alarm/OffTransparent.png";
import { PatientAgeCategory } from "@screenbuilder/components";

export default defineComponent({
  /**
   * This class will look at
   * (a) It primarly looks at alarm dials. There are mainly two dials present. A top dial and bottom dial
   * (b) We also have a "bar control" present
   */
  name: "AlarmDial",
  components: { InnerDial },
  computed: {
    patientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
    /** gets the current count for the html interface */
    currentAlarmCount(): number {
      return SpinnerResultState.currentAlarmCount(this.dialType, this.currentMode, this.patientType);
    },
    isOn(): boolean {
      // this function is a flag used by above functions so that we know if we
      // should use the edit value or create a new value
      return SpinnerSelectionState.isControlActive(this.dialType as DialID);
    },
    // TODO remove this when the innerDial is used
    currentPercentCount(): number {
      return ((this.currentAlarmCount - 0) / (this.retDialObject.currentMax - 0)) * redDialMaxValue;
    },
    dashGap(): number {
      return 2 * Math.PI * this.radius;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    peepCount(): number {
      return SpinnerResultState.currentCount(DialType.Peep);
    },
  },
  watch: {
    isAnyDialOn(value: boolean) {
      if (!value) {
        this.setStoreMinMaxValues();
        this.recordPressureBottomDialValue();
      }
    },
    currentAlarmCount: {
      deep: true,
      handler: function (newVal: number) {
        this.valueShownInDial = newVal;
        if (this.keyExpMinVolTop === this.whichDialPressed || this.keyExpMinVolBottom == this.whichDialPressed) {
          this.dialOnOrOffExpMinVol(newVal);
        }

        if (this.keyVtTop === this.whichDialPressed || this.keyVtBottom == this.whichDialPressed) {
          this.dialOnOrOffVt(newVal);
        }
      },
    },
  },
  data() {
    return {
      strokeValue: "red",
      keyAlarmPressCmH20Top: "pressureCMH2OHigh",
      keyAlarmPressCmH20Bottom: "pressureCMH2OLow",
      keyExpMinVolTop: "expMinVolumeHigh",
      keyExpMinVolBottom: "expMinVolumeLow",
      keyFTotalTop: "fTotalHigh",
      keyFTotalBottom: "fTotalLow",
      keyVtTop: "vtHigh",
      keyVtBottom: "vtLow",
      keyApneaTop: "apneaHigh",
      keyOxygenBottom: "oxygenLow",
      keyOxygenTop: "oxygenHigh",
      radius: 46,
      retDialObject: new RetDialObject(),
      patientData: new PatientData(),
      hideShowOffImage: false,
      offImage: OffOrangeImage,
      maxOff: 0,
      minOff: 0,
      showText: false,
      whichDialPressed: "",
      dialAlarmSVGTextOn: "dialAlarmSVGTextOn",
      dialAlarmSVGTextOff: "dialAlarmSVGTextOff",
      valueShownInDial: 0,
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
  },
  mounted() {
    this.patientData.currentPassedMode = this.currentMode;
    if (this.keyAlarmPressCmH20Top === this.dialType || this.keyAlarmPressCmH20Bottom === this.dialType) {
      let pressureDial = new PressureCmH2O();
      this.patientData.patientType = this.patientType;
      this.patientData.dialType = this.dialType;
      this.retDialObject = pressureDial.setUpMainJsonObject(this.patientData)!;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial = this.currentAlarmCount;
      this.setStoreMinMaxValues();
      this.showText = true;
    }
    if (this.keyExpMinVolTop === this.dialType || this.keyExpMinVolBottom === this.dialType) {
      let expMinVolDial = new ExpMinVol();
      this.patientData.patientType = this.patientType;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial =
        this.patientType === PatientAgeCategory.Neonate && this.currentAlarmCount < 1
          ? (this.valueShownInDial = Number(parseFloat(this.currentAlarmCount.toString()).toFixed(2)))
          : (this.valueShownInDial = this.currentAlarmCount);

      this.patientData.dialType = this.dialType;
      this.retDialObject = expMinVolDial.setUpMainJsonObject(this.patientData)!;
      this.maxOff = this.retDialObject.hardMax;
      this.minOff = this.retDialObject.hardMin;
      this.showText = true;
    }

    if (this.keyFTotalTop === this.dialType || this.keyFTotalBottom === this.dialType) {
      let pressureDial = new FTotal();
      this.patientData.patientType = this.patientType;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial = this.currentAlarmCount;
      this.setStoreMinMaxValues();
      this.patientData.dialType = this.dialType;
      this.retDialObject = pressureDial.setUpMainJsonObject(this.patientData)!;
      this.showText = true;
    }

    if (this.keyVtTop === this.dialType || this.keyVtBottom === this.dialType) {
      let vtDial = new VT();
      this.patientData.patientType = this.patientType;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial = this.currentAlarmCount;
      this.patientData.dialType = this.dialType;
      this.retDialObject = vtDial.setUpMainJsonObject(this.patientData)!;
      this.maxOff = this.retDialObject.hardMax;
      this.minOff = this.retDialObject.hardMin;
      this.showText = true;
    }

    if (this.keyApneaTop === this.dialType) {
      let apneDial = new Apnea();
      this.patientData.patientType = this.patientType;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial = this.currentAlarmCount;
      this.patientData.dialType = this.dialType;
      this.retDialObject = apneDial.setUpMainJsonObject(this.patientData)!;
      this.maxOff = this.retDialObject.hardMax;
      this.minOff = this.retDialObject.hardMin;
      this.showText = true;
    }

    if (this.keyOxygenTop === this.dialType || this.keyOxygenBottom === this.dialType) {
      let pressureDial = new Oxygen();
      this.patientData.patientType = this.patientType;
      this.patientData.currentAlarmCount = this.currentAlarmCount;
      this.valueShownInDial = this.currentAlarmCount;
      this.setStoreMinMaxValues();
      this.patientData.dialType = this.dialType;
      this.retDialObject = pressureDial.setUpMainJsonObject(this.patientData)!;
      this.showText = true;
    }
  },
  methods: {
    recordPressureBottomDialValue() {
      if (this.keyAlarmPressCmH20Bottom === this.dialType) {
        AlarmDialState.CurrentBottomDialValue = this.currentAlarmCount;
      }
    },
    setStoreMinMaxValues() {
      switch (this.dialType) {
        case this.keyAlarmPressCmH20Top: {
          AlarmDialState.PressLowDialMax = this.valueShownInDial;
          break;
        }
        case this.keyAlarmPressCmH20Bottom: {
          AlarmDialState.PressHighDialMin = this.valueShownInDial;
          break;
        }
        case this.keyOxygenTop: {
          AlarmDialState.OxygenLowDialMax = this.valueShownInDial;
          break;
        }
        case this.keyOxygenBottom: {
          AlarmDialState.OxygenHighDialMin = this.valueShownInDial;
          break;
        }
        case this.keyFTotalTop: {
          AlarmDialState.FTotalLowDialMax = this.valueShownInDial;
          break;
        }
        case this.keyFTotalBottom: {
          AlarmDialState.FTotalHighDialMin = this.valueShownInDial;
          break;
        }
      }
    },
    checkIfNumberDecOrInt(value: number) {
      if (!Number.isInteger(value)) {
        value = Number(parseFloat(value.toString()).toFixed(1));
      }
      return value;
    },
    toggleDial(dialTypePassed: string) {
      this.whichDialPressed = this.dialType;
      if (this.keyAlarmPressCmH20Bottom === this.dialType || this.keyAlarmPressCmH20Top == this.dialType) {
        let pressureCls = new PressureCmH2O();
        this.patientData.currentAlarmCount = this.currentAlarmCount;
        pressureCls.setItemsCurrentCount(this.patientData, this.retDialObject);
        this.recordPressureBottomDialValue();
      }

      if (this.keyExpMinVolTop === this.dialType || this.keyExpMinVolBottom == this.dialType) {
        let expMinVolCls = new ExpMinVol();
        this.patientData.currentAlarmCount = this.currentAlarmCount;
        expMinVolCls.setItemsCurrentCount(this.patientData, this.retDialObject);
      }

      if (this.keyFTotalTop === this.dialType || this.keyFTotalBottom == this.dialType) {
        let fTotalCls = new FTotal();
        this.patientData.currentAlarmCount = this.currentAlarmCount;
        fTotalCls.setItemsCurrentCount(this.patientData, this.retDialObject);
      }

      if (this.keyVtTop === this.dialType || this.keyVtBottom == this.dialType) {
        let VTCls = new VT();
        this.patientData.currentAlarmCount = this.valueShownInDial;
        VTCls.setItemsCurrentCount(this.patientData, this.retDialObject);
      }

      if (this.keyApneaTop === this.dialType) {
        let apneaCls = new Apnea();
        this.patientData.currentAlarmCount = this.currentAlarmCount;
        apneaCls.setItemsCurrentCount(this.patientData, this.retDialObject);
      }

      if (this.keyOxygenTop === this.dialType || this.keyOxygenBottom == this.dialType) {
        let oxygenCls = new Oxygen();
        this.patientData.currentAlarmCount = this.currentAlarmCount;
        oxygenCls.setItemsCurrentCount(this.patientData, this.retDialObject);
      }

      //now we turn off or start the spinner with the above object
      const type = this.dialType as DialID;
      if (this.isOn) {
        // turn off
        SpinnerSelectionState.deactivateAndSelect();
      } else if (!SpinnerSelectionState.anyActive) {
        // turn on
        let minMaxDial = this.setDialMinMaxValues(dialTypePassed);
        let spinActions = new SpinnerActions();
        spinActions.startSpinner(
          type,
          minMaxDial.max,
          minMaxDial.min,
          this.retDialObject.currentCount,
          this.retDialObject.intOrDec,
          "alarmDial",
          this.currentMode,
          this.patientType,
          false,
          this.retDialObject.range_and_increments
        );

        SpinnerSelectionState.setDialType({
          dialType: type,
          alarmOrDial: "alarm",
          spinnerActions: spinActions,
        });
      }
    },
    setDialMinMaxValues(dialTypePassed: string): { min: number; max: number } {
      let result: { min: number; max: number } = { min: 0, max: 0 };
      let min = this.patientType === PatientAgeCategory.Adult ? 5 : 0.0;
      let peepCountToUse = this.patientType === PatientAgeCategory.Adult ? this.peepCount : this.peepCount - 3;
      switch (dialTypePassed) {
        case this.keyAlarmPressCmH20Top: {
          result.min =
            AlarmDialState.PressHighDialMin >= this.retDialObject.hardMin
              ? AlarmDialState.PressHighDialMin
              : this.retDialObject.hardMin + peepCountToUse;
          result.max = this.retDialObject.currentMax;
          break;
        }
        case this.keyAlarmPressCmH20Bottom: {
          result.min = this.retDialObject.currentMin;
          result.max =
            AlarmDialState.PressLowDialMax >= this.retDialObject.hardMax
              ? this.retDialObject.hardMax
              : AlarmDialState.PressLowDialMax;
          break;
        }
        case this.keyFTotalTop: {
          result.min =
            AlarmDialState.FTotalHighDialMin >= this.retDialObject.hardMin
              ? AlarmDialState.FTotalHighDialMin
              : this.retDialObject.hardMin;
          result.max = this.retDialObject.currentMax;
          break;
        }
        case this.keyFTotalBottom: {
          result.min = this.retDialObject.currentMin;
          result.max =
            AlarmDialState.FTotalLowDialMax >= this.retDialObject.hardMax
              ? this.retDialObject.hardMax
              : AlarmDialState.FTotalLowDialMax;
          break;
          break;
        }
        case this.keyVtTop: {
          result.min =
            this.retDialObject.currentMin == min ? this.retDialObject.hardMin : this.retDialObject.currentMin;
          result.max = this.retDialObject.currentMax;
          break;
        }
        case this.keyExpMinVolTop: {
          result.min = this.retDialObject.currentMin == 0 ? this.retDialObject.hardMin : this.retDialObject.currentMin;
          result.max = this.retDialObject.currentMax;
          break;
        }
        case this.keyOxygenTop: {
          result.min =
            AlarmDialState.OxygenHighDialMin >= this.retDialObject.hardMin
              ? AlarmDialState.OxygenHighDialMin
              : this.retDialObject.hardMin;
          result.max = this.retDialObject.currentMax;
          break;
        }
        case this.keyOxygenBottom: {
          result.min = this.retDialObject.currentMin;
          result.max =
            AlarmDialState.OxygenLowDialMax >= this.retDialObject.hardMax
              ? this.retDialObject.hardMax
              : AlarmDialState.OxygenLowDialMax;
          break;
        }
        default:
          result.min = this.retDialObject.currentMin;
          result.max = this.retDialObject.currentMax;
      }
      return result;
    },
    dialOnOrOffExpMinVol(newVal: number) {
      if (
        (this.currentMode !== this.retDialObject.dialMode &&
          this.currentMode !== "" &&
          (this.patientType === PatientAgeCategory.Adult || this.patientType === PatientAgeCategory.Paediatric)) ||
        this.patientType === PatientAgeCategory.Neonate
      ) {
        if (this.dialType === this.keyExpMinVolTop) {
          if (newVal !== this.maxOff && this.isOn === true) {
            this.hideShowOffImage = false;
            this.showText = true;
          }

          if (newVal === this.maxOff && this.isOn === true) {
            this.hideShowOffImage = true;
            this.offImage = OffOrangeImage;
            this.showText = false;
          }

          if (newVal !== this.maxOff && this.isOn === false) {
            this.hideShowOffImage = false;
            this.showText = true;
          }

          if (newVal === this.maxOff && this.isOn === false) {
            this.hideShowOffImage = true;
            this.offImage = OffNotOrangeImage;
            this.showText = false;
          }
        }

        if (this.dialType === this.keyExpMinVolBottom) {
          if (newVal !== this.minOff && this.isOn === true) {
            this.hideShowOffImage = false;
            this.showText = true;
          }

          if (newVal === this.minOff && this.isOn === true) {
            this.hideShowOffImage = true;
            this.offImage = OffOrangeImage;
            this.showText = false;
          }

          if (newVal !== this.minOff && this.isOn === false) {
            this.hideShowOffImage = false;
            this.showText = true;
          }

          if (newVal === this.minOff && this.isOn === false) {
            this.hideShowOffImage = true;
            this.offImage = OffNotOrangeImage;
            this.showText = false;
          }
        }
      }
    },
    dialOnOrOffVt(newVal: number) {
      if (this.dialType === this.keyVtTop) {
        if (newVal !== this.maxOff && this.isOn === true) {
          this.hideShowOffImage = false;
          this.showText = true;
        }

        if (newVal === this.maxOff && this.isOn === true) {
          this.hideShowOffImage = true;
          this.offImage = OffOrangeImage;
          this.showText = false;
        }

        if (newVal !== this.maxOff && this.isOn === false) {
          this.hideShowOffImage = false;
          this.showText = true;
        }

        if (newVal === this.maxOff && this.isOn === false) {
          this.hideShowOffImage = true;
          this.offImage = OffNotOrangeImage;
          this.showText = false;
        }
      }

      if (this.dialType === this.keyVtBottom) {
        if (newVal !== this.minOff && this.isOn === true) {
          this.hideShowOffImage = false;
          this.showText = true;
        }

        if (newVal === this.minOff && this.isOn === true) {
          this.hideShowOffImage = true;
          this.offImage = OffOrangeImage;
          this.showText = false;
        }

        if (newVal !== this.minOff && this.isOn === false) {
          this.hideShowOffImage = false;
          this.showText = true;
        }

        if (newVal === this.minOff && this.isOn === false) {
          this.hideShowOffImage = true;
          this.offImage = OffNotOrangeImage;
          this.showText = false;
        }
      }
    },
  },
});
</script>
