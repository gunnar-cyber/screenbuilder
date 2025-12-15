<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./Gender.css" scoped></style>
<template src="./Gender.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import genderVentM from "@/img/Monitoring/blueMale.png";
import genderVentF from "@/img/Monitoring/blueFemale.png";
import genderVentOffF from "@/img/Monitoring/blueWomanOff.png";
import genderVentOffM from "@/img/Monitoring/blueManOff.png";
import genderModeM from "@/img/Monitoring/GreenManOn.png";
import genderModeF from "@/img/Monitoring/GreenWomanOn.png";
import genderModeOffF from "@/img/Monitoring/GrayWomanOff.png";
import genderModeOffM from "@/img/Monitoring/GrayManOff.png";
import genderLastPatientOffM from "@/img/Monitoring/lastPatientOffM.png";
import genderLastPatientOffF from "@/img/Monitoring/lastPatientOffF.png";
import Dial from "../../components/Dial/Dial.vue";
import { PatientType } from "@/types/PatientTypes";
import { MainModeState, SpinnerResultState, SpinnerSelectionState } from "@/store";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
/**
 *
 * This component is used to create the gender of the patient
 */
export default defineComponent({
  name: "Gender",
  components: {
    Dial,
  },
  computed: {
    inHiFlowMode(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
    getGender(): PatientType {
      return this.getGenderByScreenType();
    },
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    whatModeAreWeIn(): string {
      return MainModeState.whatModeAreWe;
    },
    getCurrentIBW(): string {
      let result = MainModeState.getIBW;
      if (result % 1 != 0 && result >= 129) {
        return result.toFixed(1);
      } else {
        return result.toString();
      }
    },
    lastPatientIBW() {
      return SpinnerResultState.lastPatientData.LastPatIBW;
    },
  },
  props: {
    screenTypeP: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      genderImgMale: genderVentM,
      genderImgFemale: genderVentF,
      activeGenderBtnM: "",
      activeGenderBtnF: "",
      dialTypeHeight: "",
      keysHeight: "height",
      genderImgFloatL: -1,
      genderImgFloatR: -1,
      genderTopMainDiv: -1,
      genderHeightButtonFormat: -1,
      genderCommonWeightPadding: -1,
      currentIBW: "",
    };
  },
  mounted() {},
  created() {
    this.adultOrNeoDialType.forEach((ele) => {
      if (ele.dialType === this.keysHeight) {
        this.dialTypeHeight = ele.dialType;
      }
    });
    if (this.startVentEnabled) {
      this.setGender(this.getGender);
    } else {
      this.setGender(this.getGender);
    }

    this.setStyles();
  },

  methods: {
    getGenderByScreenType() {
      if (this.screenTypeP === "lastpatient") {
        return SpinnerResultState.lastPatientData.lastPatType === PatientType.Male
          ? PatientType.Male
          : SpinnerResultState.lastPatientData.lastPatType === PatientType.Female
          ? PatientType.Female
          : PatientType.Neonatal;
      } else {
        return MainModeState.currentPatientType === PatientType.Male
          ? PatientType.Male
          : MainModeState.currentPatientType === PatientType.Female
          ? PatientType.Female
          : PatientType.Neonatal;
      }
    },
    setGender(whichButton: number) {
      if (whichButton === 0 && this.screenTypeP == "vent" && !this.inHiFlowMode) {
        MainModeState.createPatientType(PatientType.Male, this.screenTypeP, "gender");
        this.genderImgFemale = genderVentOffF;
        this.genderImgMale = genderVentM;
        this.activeGenderBtnM = "genderNonImageButton active";
        this.activeGenderBtnF = "genderNonImageButton";
      }
      if (whichButton === 1 && this.screenTypeP == "vent" && !this.inHiFlowMode) {
        MainModeState.createPatientType(PatientType.Female, this.screenTypeP, "gender");
        this.genderImgFemale = genderVentF;
        this.genderImgMale = genderVentOffM;
        this.activeGenderBtnM = "genderNonImageButton";
        this.activeGenderBtnF = "genderNonImageButton active";
      }

      if (whichButton === 0 && this.screenTypeP == "vent" && this.inHiFlowMode) {
        MainModeState.createPatientType(PatientType.Male, this.screenTypeP, "gender");
        this.genderImgFemale = genderLastPatientOffF;
        this.genderImgMale = genderLastPatientOffM;
        this.activeGenderBtnM = "genderNonImageButtonLast";
        this.activeGenderBtnF = "genderNonImageButtonLast";
      }
      if (whichButton === 1 && this.screenTypeP == "vent" && this.inHiFlowMode) {
        MainModeState.createPatientType(PatientType.Female, this.screenTypeP, "gender");
        this.genderImgFemale = genderLastPatientOffF;
        this.genderImgMale = genderLastPatientOffM;
        this.activeGenderBtnM = "genderNonImageButtonLast";
        this.activeGenderBtnF = "genderNonImageButtonLast";
      }

      if (whichButton === 0 && this.screenTypeP == "lastpatient") {
        this.genderImgFemale = genderLastPatientOffF;
        this.genderImgMale = genderVentM;
        this.activeGenderBtnM = "genderNonImageButton active";
        this.activeGenderBtnF = "genderNonImageButtonLast";
      }
      if (whichButton === 1 && this.screenTypeP == "lastpatient") {
        this.genderImgFemale = genderVentF;
        this.genderImgMale = genderLastPatientOffM;
        this.activeGenderBtnM = "genderNonImageButtonLast";
        this.activeGenderBtnF = "genderNonImageButton active";
      }

      if (whichButton === 0 && this.screenTypeP == "control") {
        MainModeState.createPatientType(PatientType.Male, this.screenTypeP, "gender");
        this.genderImgFemale = genderModeOffF;
        this.genderImgMale = genderModeM;
        this.activeGenderBtnM = "genderNonImageButton active";
        this.activeGenderBtnF = "genderNonImageButtonLast";
      }
      if (whichButton === 1 && this.screenTypeP == "control") {
        MainModeState.createPatientType(PatientType.Female, this.screenTypeP, "gender");
        this.genderImgFemale = genderModeF;
        this.genderImgMale = genderModeOffM;
        this.activeGenderBtnM = "genderNonImageButtonLast";
        this.activeGenderBtnF = "genderNonImageButton active";
      }

      MainModeState.setIBW({ height: SpinnerResultState.currentCount("height") });
    },
    setStyles() {
      if (this.screenTypeP === "control") {
        this.genderImgFloatL = 1;
        this.genderImgFloatR = 1;
        this.genderTopMainDiv = 1;
        this.genderHeightButtonFormat = 1;
        this.genderCommonWeightPadding = 1;
      }

      if (this.screenTypeP === "vent" || this.screenTypeP === "lastpatient") {
        this.genderImgFloatL = 2;
        this.genderImgFloatR = 2;
        this.genderTopMainDiv = 2;
        this.genderHeightButtonFormat = 2;
        this.genderCommonWeightPadding = 2;
      }
    },
  },
  watch: {
    inHiFlowMode() {
      this.setGender(this.getGender);
    },
  },
});
</script>
