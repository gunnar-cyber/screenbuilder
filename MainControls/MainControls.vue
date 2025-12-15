<style src="./MainControls.css" scoped></style>
<template src="./MainControls.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import Dial from "../../components/Dial/Dial.vue";
import navButtons from "../../config/navButtons.json";
import { AlarmState, MainModeState, NavigationState, SpinnerSelectionState } from "@/store";

export default defineComponent({
  name: "ModesSideMenuVue",
  components: {
    Dial,
  },
  computed: {
    currentPatientType() {
      return MainModeState.currentPatientType;
    },
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
    isAlarmBtnPressed(): boolean {
      return NavigationState.alarmButton;
    },
    isControlBtnPressed(): boolean {
      return NavigationState.controlButton;
    },
    whatModeAreWeIn(): string {
      return MainModeState.whatModeAreWe;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    psyncDialType(): string {
      return MainModeState.psyncDialType;
    },
  },
  watch: {
    whatModeAreWeIn: {
      deep: true,
      handler: function (newVal) {
        this.modeType = newVal;
        this.setUpDials();
      },
    },
    adultOrNeoDialType() {
      this.setUpDials();
    },
    psyncDialType() {
      this.setUpDials();
    },
  },
  data() {
    return {
      modeDialTypeOx: "",
      modeDialTypeMin: "",
      modeDialTypePeep: "",
      modeDialScreenType: "modesSide",
      keysOxy: "oxygen",
      keysMin: "min",
      keysPeep: "peep",
      onOffColor: "#232522",
      alarm: navButtons.alarm,
      control: navButtons.control,
      modeType: "",
      dials: [
        {
          type: "",
          title: "",
        },
        {
          type: "",
          title: "",
        },
        {
          type: "",
          title: "",
        },
      ],
    };
  },
  props: {},
  created() {
    this.modeType = this.whatModeAreWeIn;
    this.setUpDials();
  },
  methods: {
    showNavigation(typeOfScreen: string, isNavSet: boolean) {
      NavigationState.resetMainNavigationButtons();
      NavigationState.setNavButton({
        value: isNavSet === false,
        buttonType: typeOfScreen,
      });
      AlarmState.setWhichTabToLoad(1);
    },
    setUpDials() {
      this.dials[1].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "peep")?.dialType!;
      this.dials[1].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "peep")?.dialLabel!;
      this.dials[2].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "oxygen")?.dialType!;
      this.dials[2].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "oxygen")?.dialLabel!;

      switch (this.modeType.toLowerCase()) {
        case "(s)cmv+":
        case "simv+": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "vt")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "vt")?.dialLabel!;
          break;
        }
        case "pcv+": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "pControl")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "pControl")?.dialLabel!;
          break;
        }
        case "psimv+": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === this.psyncDialType)?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === this.psyncDialType)?.dialLabel!;
          break;
        }
        case "spont": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "pSupport")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "pSupport")?.dialLabel!;
          break;
        }
        case "niv": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "pSupport")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "pSupport")?.dialLabel!;
          break;
        }
        case "asv": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "minvol")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "minvol")?.dialLabel!;
          break;
        }
        case "hiflowo2": {
          this.dials[0].type = "none";
          this.dials[0].title = "none";
          this.dials[1].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "hiFlowO2")?.dialType!;
          this.dials[1].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "hiFlowO2")?.dialLabel!;
          break;
        }
        case "niv-st": {
          this.dials[0].type = this.adultOrNeoDialType.find((ele) => ele.dialType === "pinsp")?.dialType!;
          this.dials[0].title = this.adultOrNeoDialType.find((ele) => ele.dialType === "pinsp")?.dialLabel!;
          break;
        }
      }
    },
  },
});
</script>
