<style src="./BottomNav.css"></style>
<template src="./BottomNav.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import navTypes from "../../config/navButtons.json";
import { AlarmState, DeviceState, MainModeState, NavigationState, SpinnerSelectionState } from "@/store";
import Battery from "@/components/Battery/Battery.vue";
import { BatteryState } from "@screenbuilder/components";

export default defineComponent({
  name: "BottomNav",
  components: {
    Battery,
  },
  computed: {
    isEventsNavBtnPressed(): boolean {
      return NavigationState.eventsButton;
    },
    isToolsNavBtnPressed(): boolean {
      return NavigationState.toolsButton;
    },
    bottomNavSystemActive(): boolean {
      return NavigationState.systemButton;
    },
    isMonitorNavBtnPressed(): boolean {
      return NavigationState.monitoringButton;
    },
    isMonitoringEnabled(): boolean {
      return MainModeState.allowMonitoringButton;
    },
    isSystemNavBtnPressed(): boolean {
      return NavigationState.systemButton;
    },
    silencedTime(): string {
      let time = AlarmState.silenceTime;
      let min = Math.floor(time / 60);
      let sec = time % 60;
      return `${min}:${sec < 10 ? "0" + sec : sec}`;
    },
    isSilenced(): boolean {
      return AlarmState.isSilenced;
    },
    isHumidifierConnected() {
      return false;
    },
    totalBatteryPercent(): number {
      return Math.floor(DeviceState.batteryLevel * 100);
    },
    // LEFT will show percentage from 100-51 inclusive
    leftBatteryPercent(): number {
      if (this.totalBatteryPercent > 99) return 100;
      return this.totalBatteryPercent * 2 - 100;
    },
    // RIGHT will show percentage from 50-0 inclusive
    rightBatteryPercent(): number {
      if (this.totalBatteryPercent > 50) return 100;
      return this.totalBatteryPercent * 2;
    },
    isCharging(): Boolean {
      return DeviceState.batteryState === BatteryState.charging;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
  },
  data() {
    return {
      monitor: navTypes.monitoring,
      system: navTypes.system,
      events: navTypes.events,
      tools: navTypes.tools,
    };
  },
  props: {},
  mounted() {},
  methods: {
    showNavigation(typeOfScreen: string, isSystemNavSet: boolean) {
      if (this.isAnyDialOn) return;
      if (typeOfScreen === this.system) {
        //TO DO SYSTEM SCREEN IS FAULTY NEEDS FIXING JIRA HAS BEEN RAISED
        return;
      }

      NavigationState.resetMainNavigationButtons();
      if (isSystemNavSet) {
        NavigationState.setNavButton({ value: false, buttonType: typeOfScreen });
      } else {
        NavigationState.setNavButton({ value: true, buttonType: typeOfScreen });
      }
    },
  },
});
</script>
