<template src="./MainMonitoringParameters.html"></template>
<style src="./MainMonitoringParameters.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { PatientAgeCategory } from "@screenbuilder/components";
import {
  AlarmState,
  DeviceState,
  MainModeState,
  NavigationState,
  PatientState,
  SpinnerResultState,
  SpinnerSelectionState,
  VentilatorState,
} from "../../store/index";
import colours from "../../config/alarmColours.json";
import navButtons from "../../config/navButtons.json";
import { AlarmType } from "@/store/Alarms";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { DialType } from "@/store/SpinnerSelection";

export default defineComponent({
  name: "MainMonitoringParameters",
  components: {},
  computed: {
    inHiFlowMode(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
    isNivMode(): boolean {
      return this.whatModeAreWeIn === HamiltonModeType.NIV_ST || this.whatModeAreWeIn === HamiltonModeType.NIV;
    },
    patientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
    whatModeAreWeIn(): HamiltonModeType {
      return MainModeState.whatModeAreWe;
    },
    currentAlarmCountexpMinVolumeHigh(): number {
      return SpinnerResultState.currentAlarmCount("expMinVolumeHigh", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountexpMinVolumeLow(): number {
      return SpinnerResultState.currentAlarmCount("expMinVolumeLow", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountFTotalHigh(): number {
      return SpinnerResultState.currentAlarmCount("fTotalHigh", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountFTotalLow(): number {
      return SpinnerResultState.currentAlarmCount("fTotalLow", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountVtHigh(): number {
      return SpinnerResultState.currentAlarmCount("vtHigh", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountVtLow(): number {
      return SpinnerResultState.currentAlarmCount("vtLow", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountPressureCMH2OHigh(): number {
      return SpinnerResultState.currentAlarmCount("pressureCMH2OHigh", this.whatModeAreWeIn, this.patientType);
    },
    currentAlarmCountPressureCMH2OLow(): number {
      return SpinnerResultState.currentAlarmCount("pressureCMH2OLow", this.whatModeAreWeIn, this.patientType);
    },
    pPeakAlarmActive(): string {
      return AlarmState.getCurrentActiveAlarmColour("pressure");
    },
    expMinVolAlarmActive(): string {
      return AlarmState.getCurrentActiveAlarmColour("expMinVol");
    },
    vteAlarmActive(): string {
      return AlarmState.getCurrentActiveAlarmColour("vte");
    },
    fTotalAlarmActive(): string {
      return AlarmState.getCurrentActiveAlarmColour("fTotal");
    },
    spo2AlarmActive(): boolean {
      return AlarmState.status.spo2;
    },
    spo2Connected(): boolean {
      return DeviceState.connectionStatus.spo2;
    },
    spo2(): string {
      return PatientState.parameters.spo2.toFixed(0);
    },
    pPeak(): string {
      return VentilatorState.hadFirstBreath() ? VentilatorState.monitored.pip.toFixed(0) : "---";
    },
    /** moving average of expMinVol for the last 8 breaths but shows after 4 */
    expMinVol(): string {
      let expMinVol = VentilatorState.expMinVol();
      if (expMinVol === null) {
        return "---";
      }

      if (expMinVol < 3) {
        return expMinVol.toFixed(2);
      } else {
        return expMinVol.toFixed(1);
      }
    },
    /** not taking into account gas leak so just using VT */
    vte(): string {
      return VentilatorState.hadFirstBreath() ? VentilatorState.monitored.expiratoryVolume.toFixed(0) : "---";
    },
    /** moving average of rate for the last 8 breaths but shows after 4 */
    fTotal(): string {
      let rateMovingAverage = VentilatorState.rateMovingAverage();
      return rateMovingAverage !== null ? Math.round(rateMovingAverage).toString() : "---";
    },
    isAlarmBtnPressed(): boolean {
      return NavigationState.alarmButton;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    hiFlowValue(): number {
      return SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === DialType.HiFlowO2)?.count!;
    },
    OxygenValue(): number {
      return SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === DialType.Oxygen)?.count!;
    },
  },
  watch: {
    expMinVol() {
      this.lookForExpMinVolAlarms();
    },
    pPeak() {
      this.lookForPPeakAlarms();
    },
    vte() {
      this.lookForPPeakAlarms();
    },
    fTotal() {
      this.lookForFTotalAlarms();
    },
  },
  data() {
    return {
      mediumColour: colours.medium,
      alarm: navButtons.alarm,
      expMinVolMonit: 0,
    };
  },
  mounted() {
    this.lookForExpMinVolAlarms();
    this.lookForPPeakAlarms();
    this.lookForPPeakAlarms();
    this.lookForFTotalAlarms();
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
    lookForExpMinVolAlarms() {
      if (this.expMinVol !== "---") {
        AlarmState.stopAlarm(AlarmType.highMinVol);
        AlarmState.stopAlarm(AlarmType.lowMinVol);
        if (this.currentAlarmCountexpMinVolumeHigh <= Number(this.expMinVol)) {
          AlarmState.triggerAlarm(AlarmType.highMinVol);
          AlarmState.setAlarmBufferFlag(true);
        }
        if (this.currentAlarmCountexpMinVolumeLow >= Number(this.expMinVol)) {
          AlarmState.triggerAlarm(AlarmType.lowMinVol);
          AlarmState.setAlarmBufferFlag(true);
        }
      }
    },
    lookForFTotalAlarms() {
      if (this.fTotal !== "===") {
        AlarmState.stopAlarm(AlarmType.highPres);
        AlarmState.stopAlarm(AlarmType.pressLimit);
        AlarmState.stopAlarm(AlarmType.lowFreq);
        if (this.currentAlarmCountFTotalHigh <= Number(this.fTotal)) {
          AlarmState.triggerAlarm(AlarmType.highPres);
          AlarmState.setAlarmBufferFlag(true);
        }
        if (this.currentAlarmCountFTotalHigh <= Number(this.fTotal) + 2) {
          AlarmState.triggerAlarm(AlarmType.pressLimit);
          AlarmState.setAlarmBufferFlag(true);
        }
        if (this.currentAlarmCountFTotalLow >= Number(this.fTotal)) {
          AlarmState.triggerAlarm(AlarmType.lowFreq);
          AlarmState.setAlarmBufferFlag(true);
        }
      }
    },
    lookForVteAlarms() {
      if (this.vte !== "===") {
        AlarmState.stopAlarm(AlarmType.vtHigh);
        AlarmState.stopAlarm(AlarmType.vtLow);
        if (this.currentAlarmCountVtHigh <= Number(this.vte)) {
          AlarmState.triggerAlarm(AlarmType.vtHigh);
          AlarmState.setAlarmBufferFlag(true);
        }
        if (this.currentAlarmCountVtLow >= Number(this.vte)) {
          AlarmState.triggerAlarm(AlarmType.vtLow);
          AlarmState.setAlarmBufferFlag(true);
        }
      }
    },
    lookForPPeakAlarms() {
      if (this.pPeak !== "---") {
        AlarmState.stopAlarm(AlarmType.highPres);
        AlarmState.stopAlarm(AlarmType.pressLimit);
        AlarmState.stopAlarm(AlarmType.lowPress);
        if (this.currentAlarmCountPressureCMH2OHigh <= Number(this.pPeak)) {
          AlarmState.triggerAlarm(AlarmType.highPres);
          AlarmState.setAlarmBufferFlag(true);
        } else if (this.currentAlarmCountPressureCMH2OHigh <= Number(this.pPeak) + 2) {
          AlarmState.triggerAlarm(AlarmType.pressLimit);
          AlarmState.setAlarmBufferFlag(true);
        }
        if (this.currentAlarmCountPressureCMH2OLow >= Number(this.pPeak)) {
          AlarmState.triggerAlarm(AlarmType.lowPress);
          AlarmState.setAlarmBufferFlag(true);
        }
      }
    },
  },
});
</script>
