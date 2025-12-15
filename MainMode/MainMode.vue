<template src="./MainMode.html"></template>
<style src="./MainMode.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import Dial from "../../components/Dial/Dial.vue";
import Gender from "@/components/Gender/Gender.vue";
import { StandBy } from "../../classes/Standby";
import {
  MainModeState,
  NavigationState,
  SpinnerResultState,
  SpinnerSelectionState,
  StandbyStoreState,
  VentilatorState,
} from "@/store";
import { PatientType } from "@/types/PatientTypes";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { standByCounterStatus } from "@/store/MainMode";

const { setInterval } = window;

export default defineComponent({
  name: "MainMode",
  el: "#tabs",
  components: {
    Dial,
    Gender,
  },
  computed: {
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    whatModeAreWeIn(): string {
      return MainModeState.whatModeAreWe;
    },
    areAnyWindowsOpen(): boolean {
      return NavigationState.areAnyWindowsOpen;
    },
    getCurrentPatient() {
      return MainModeState.currentPatientType;
    },
    getLastPatient() {
      return SpinnerResultState.lastPatientData.lastPatType;
    },
    isLastPatientOn() {
      return StandbyStoreState.isLastPatientOn;
    },
    inHiFlowMode(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
  },
  data() {
    return {
      activetab: 2,
      activeButtonBottom: 1,
      activeAdultPedType: 1,
      activeNeoNatal: 1,
      dialTypeHeight: "",
      dialTypeWeight: "",
      keysHeight: "height",
      keysWeight: "weight",
      mDialScreenType: "vent",
      screenType: "vent",
      standByCls: new StandBy(),
      standByTime: "",
      interValStop: 0,
      isStartVentCheck: false,
    };
  },
  created() {
    this.adultOrNeoDialType.forEach((ele) => {
      if (ele.dialType === this.keysHeight) {
        this.dialTypeHeight = ele.dialType;
      }
      if (ele.dialType === this.keysWeight) {
        this.dialTypeWeight = ele.dialType;
      }
    });
  },
  mounted() {
    if (MainModeState.standbyCounter == standByCounterStatus.started) {
      this.startStandbyTimer();
    }
    MainModeState.isStartVentButtonClicked = false;
    this.isStartVentCheck = MainModeState.isStartVentButtonClicked;
    this.activetab = this.isLastPatientOn ? 3 : 2;
  },
  unmounted() {
    this.stopStandByTimer();
  },
  methods: {
    startVent() {
      VentilatorState.startVentilation();
      MainModeState.setLastPatientType();
    },
    startStandbyTimer() {
      const isStandByStarted = StandbyStoreState.isStandByStarted;

      let sDate = new Date();
      if (isStandByStarted) {
        sDate = StandbyStoreState.startTime;
      } else {
        sDate = this.standByCls.setStartTime();
      }

      this.interValStop = setInterval(() => {
        this.standByTime = this.standByCls.getElapsedTime(sDate);
        StandbyStoreState.isStandByStarted = true;
        StandbyStoreState.startTime = sDate;
      }, 1000);
    },
    stopStandByTimer() {
      clearInterval(this.interValStop);
      this.interValStop = -1;
      StandbyStoreState.isStandByStarted = false;
      MainModeState.standbyCounter = standByCounterStatus.stopped;
    },
    hasPatient(): boolean {
      return false; //TODO check patient
    },
  },
  watch: {
    activetab(value: number) {
      switch (value) {
        case 1:
          this.screenType = "vent";
          MainModeState.createPatientType(PatientType.Neonatal, this.screenType, "main");
          break;
        case 2:
          this.screenType = "vent";
          MainModeState.createPatientType(PatientType.Male, this.screenType, "main");
          break;
        case 3:
          this.screenType = "lastpatient";
          MainModeState.createPatientType(SpinnerResultState.lastPatientData.lastPatType, this.screenType, "main");
          break;
      }
    },
  },
});
</script>
