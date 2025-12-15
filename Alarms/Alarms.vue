<template src="./Alarms.html"></template>
<style src="./Alarms.css" scoped></style>

<script lang="ts">
import { defineComponent } from "vue";
import AlarmLimitControl from "../AlarmLimitControl/AlarmLimitControl.vue";
import { ModalPosition } from "../../store/layout";
import {
  AlarmState,
  LayoutState,
  MainModeState,
  NavigationState,
  SpinnerSelectionState,
  VentilatorState,
} from "@/store";
import alarmLimitJson from "../../config/alarmLimits.json";

import AlarmModal from "../Alarms/AlarmModal.vue";

export default defineComponent({
  name: "Alarms",
  components: {
    AlarmLimitControl,
    AlarmModal,
  },
  computed: {
    ftotal(): number | null {
      let rateMovingAverage = VentilatorState.rateMovingAverage();
      return this.startVentEnabled && rateMovingAverage !== null ? Math.round(rateMovingAverage) : null;
    },
    expMinVol(): number | null {
      let expMinVolMovingAverage = VentilatorState.expMinVolMovingAverage();
      return this.startVentEnabled && expMinVolMovingAverage !== null
        ? Number(expMinVolMovingAverage.toFixed(1))
        : null;
    },
    vte(): number | null {
      return this.startVentEnabled && VentilatorState.hadFirstBreath()
        ? Number(VentilatorState.monitored.vt.toFixed(0))
        : null;
    },
    ppeak(): number | null {
      return this.startVentEnabled && VentilatorState.hadFirstBreath()
        ? Number(VentilatorState.monitored.pip.toFixed(0))
        : null;
    },
    apnea(): number | null {
      return null; // TODO
    },
    position(): ModalPosition {
      return LayoutState.modalPosition;
    },
    currentMode(): string {
      return MainModeState.whatModeAreWe;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
    whichTabToLoad(): number {
      return AlarmState.getWhichTabToLoad;
    },
  },
  data() {
    return {
      pressureCMH2OHighLabel: "",
      pressureCMH2OLowLabel: "",
      expMinVolHighLabel: "",
      expMinVolLowLabel: "",
      fTotalHighLabel: "",
      fTotalLowLabel: "",
      vTLowLabel: "",
      vTHighLabel: "",
      apneaHighLabel: "",
      apneaLowLabel: "",
      oxygenHighLabel: "",
      oxygenLowLabel: "",
      activeAlarms: [{ type: "", priority: "", timeStamp: new Date(), active: false, title: "" }],
      inActiveAlarms: [{ type: "", priority: "", timeStamp: new Date(), active: false, title: "" }],
      classTest: false,
      styleActive: "red",
      styleInActive: "#ecc531",
      textInActive: "black",
      textActive: "white",
      showModal: false,
      alarmModalType: "",
      resetBtn: false,
    };
  },
  created() {
    this.pressureCMH2OHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "pressureCMH2OHigh")?.alarmTitle!;
    this.pressureCMH2OLowLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "pressureCMH2OLow")?.alarmTitle!;
    this.expMinVolHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "expMinVolumeHigh")?.alarmTitle!;
    this.expMinVolLowLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "expMinVolumeLow")?.alarmTitle!;
    this.fTotalHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "fTotalHigh")?.alarmTitle!;
    this.fTotalLowLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "fTotalLow")?.alarmTitle!;
    this.vTHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "vtHigh")?.alarmTitle!;
    this.vTLowLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "vtLow")?.alarmTitle!;
    this.apneaHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "apneaHigh")?.alarmTitle!;
    this.oxygenLowLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "oxygenLow")?.alarmTitle!;
    this.oxygenHighLabel = alarmLimitJson.find((dial) => dial.alarmTitle === "oxygenHigh")?.alarmTitle!;
    this.getAlarmsBuffer();
  },
  methods: {
    close() {
      if (this.isAnyDialOn) return;
      NavigationState.resetMainNavigationButtons();
      AlarmState.setWhichTabToLoad(1);
    },
    currentDateTime(current: Date) {
      const minutes = current.getMinutes() < 10 ? "0" + current.getMinutes() : current.getMinutes();
      const hours = current.getHours();
      const time = hours + ":" + minutes;
      return time;
    },
    getAlarmsBuffer() {
      this.activeAlarms = AlarmState.getAlarms(true, 0);
      if (this.activeAlarms.length < 5 && this.activeAlarms.length !== 0) {
        let alarmsToAdd = 5 - this.activeAlarms.length;
        this.inActiveAlarms = AlarmState.getAlarms(false, alarmsToAdd);
        this.inActiveAlarms.forEach((ele) => {
          this.activeAlarms.push(ele);
        });
      }
      if (this.activeAlarms.length == 0) {
        this.inActiveAlarms = AlarmState.getAlarms(false, 6);
        this.inActiveAlarms.forEach((ele) => {
          this.activeAlarms.push(ele);
        });
      }

      this.activeAlarms.length ? AlarmState.setAlarmBufferFlag(true) : AlarmState.setAlarmBufferFlag(false);
      this.setResetButton();
    },
    showAlarmHelp(alarmType: string) {
      this.alarmModalType = alarmType;
      this.showModal = true;
    },
    setTab(activeTabValue: number) {
      AlarmState.setWhichTabToLoad(activeTabValue);
      if (activeTabValue === 3) {
        this.getAlarmsBuffer();
        this.setResetButton();
      }
    },
    setResetButton() {
      this.resetBtn = AlarmState.hasActiveAlarms ? false : AlarmState.anyInactiveAlarmsWithValidDate;
    },
    resetAlarms() {
      AlarmState.resetAllAlarms();
      this.getAlarmsBuffer();
      this.resetBtn = false;
    },
  },
});
</script>
