<template src="./ScreenLayout.html"></template>
<style src="./ScreenLayout.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import BottomNav from "@/components/BottomNav/BottomNav.vue";
import MainControls from "@/components/MainControls/MainControls.vue";
import TopMode from "@/components/TopMode/TopMode.vue";
import MainMode from "@/components/MainMode/MainMode.vue";
import Loading from "@/components/Loading/Loading.vue";
import WaveformGraphicLayout from "@/components/WaveformGraphicLayout/WaveformGraphicLayout.vue";
import HiFlowGraphicLayout from "@/components/HiFlowGraphicLayout/HiFlowGraphicLayout.vue";
import LayoutJson from "@/config/layout.json";
import MainMonitoringParameters from "@/components/MainMonitoringParameters/MainMonitoringParameters.vue";

// windows
import Monitoring from "@/components/Monitoring/Monitoring.vue";
import Events from "@/components/Events/Events.vue";
import Tools from "@/components/Tools/Tools.vue";
import Modes from "@/components/Modes/Modes.vue";
import Alarms from "@/components/Alarms/Alarms.vue";
import Controls from "@/components/Controls/Controls.vue";
import Graphics from "@/components/Graphics/Graphics.vue";
import System from "@/components/System/System.vue";
import StandByConfirm from "@/components/StandbyConfirm/StandByConfirm.vue";
import { HamiltonT1State, LayoutState, MainModeState, NavigationState } from "@/store";
import { HamiltonModeType } from "@/classes/HamiltonModeType";

export default defineComponent({
  name: "ScreenLayout",
  components: {
    MainControls,
    TopMode,
    MainMode,
    MainMonitoringParameters,
    Loading,
    Monitoring,
    Modes,
    Alarms,
    Controls,
    WaveformGraphicLayout,
    Graphics,
    System,
    BottomNav,
    StandByConfirm,
    Events,
    Tools,
    HiFlowGraphicLayout,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    checkScreenLock() {
      if (HamiltonT1State.screenLocked) {
        HamiltonT1State.showScreenLocked();
      }
    },
  },
  computed: {
    isHiFlowModeOn(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
    isEventsBtnPressed(): boolean {
      return NavigationState.eventsButton;
    },
    showingScreenshotSaved(): boolean {
      return HamiltonT1State.showingScreenshotSaved;
    },
    showingNebulizerMessage(): boolean {
      return HamiltonT1State.showingNebulizerActive;
    },
    screenLocked(): boolean {
      return HamiltonT1State.screenLocked;
    },
    showingScreenLock(): boolean {
      return HamiltonT1State.showingScreenLocked;
    },
    isPowerButtonOn(): boolean {
      return NavigationState.powerButton;
    },
    isLoadingDone(): boolean {
      return NavigationState.loadingDone;
    },
    isInStandby(): boolean {
      return !MainModeState.isStartVentButtonClicked;
    },
    isGraphicsNavBtnPressed(): boolean {
      return NavigationState.graphicButton;
    },
    isSystemNavBtnPressed(): boolean {
      return NavigationState.systemButton;
    },
    isControlsNavBtnPressed(): boolean {
      return NavigationState.controlButton;
    },
    isAlarmsNavBtnPressed(): boolean {
      return NavigationState.alarmButton;
    },
    isMonitoringBtnPressed(): boolean {
      return NavigationState.monitoringButton;
    },
    isToolsBtnPressed(): boolean {
      return NavigationState.toolsButton;
    },
    isModesNavBtnPressed(): boolean {
      return NavigationState.modeButton;
    },
    isStandByConfirmBtnPressed() {
      return NavigationState.standByConfirm;
    },
    isNightMode() {
      return LayoutState.isNightMode;
    },

    //TODO remove layouts
    isLayoutOnePresent() {
      return LayoutState.layoutType === LayoutJson.layout1;
    },
    isLayoutTwoPresent() {
      return LayoutState.layoutType === LayoutJson.layout2;
    },
    isLayoutThreePresent() {
      return LayoutState.layoutType === LayoutJson.layout3;
    },
    isLayoutFourPresent() {
      return LayoutState.layoutType === LayoutJson.layout4;
    },
  },
});
</script>
