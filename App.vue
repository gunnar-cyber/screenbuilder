<template>
  <div class="hamiltonBackGround select-none">
    <AlarmLamp :priority="alarmPriority" class="mainLamp"></AlarmLamp>
    <!-- TODO adjust the actual values instead of scaling -->
    <div
      style="
        transform: scale(1.2707) translate(-150px, -59.572px);
        transform-origin: left top 0px;
        width: 100%;
        height: 100%;
      "
    >
      <ScreenLayout></ScreenLayout>
      <div class="rightSide">
        <HardwarePanel></HardwarePanel>
        <SpinnerControl
          :power-on="isPowerButtonOn"
          @spin-backwards="spinnerTurnBackwards"
          @spin-forwards="spinnerTurnForwards"
        ></SpinnerControl>
      </div>
      <img src="./img/Logo.png" class="logoImg" v-multi-press="{ timeout: 500, onPressEnd: exit }" />
    </div>
  </div>
  <div class="sideColor left select-none"></div>
  <div class="sideColor right select-none"></div>

  <FeatureNotImplemented v-if="showingFeatureNotImplemented" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HardwarePanel from "./components/HardwarePanel/HardwarePanel.vue";
import AlarmLamp from "./components/AlarmLamp/AlarmLamp.vue";
import SpinnerControl from "@/components/SpinnerControl/SpinnerControl.vue";
import {
  store,
  AlarmState,
  DeviceState,
  GraphicWaveformState,
  HamiltonT1State,
  NavigationState,
  SpinnerResultState,
  VentilatorState,
  MainModeState,
  LayoutState,
  StandbyStoreState,
  SpinnerSelectionState,
  FeatureFlagsStoreState,
} from "./store";
import {
  audioPlayer,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  setupFixedViewport,
  WaveformEngine,
} from "isimulate-screen-builder";
import {
  BreathState,
  FeatureId,
  PacketController,
  ProxyController,
  VentilatorSettings,
  VentilatorStatus,
} from "@screenbuilder/components";

//DEMO Imports
import navTypes from "./config/navButtons.json";
import LayoutJson from "./config/layout.json";
import ScreenLayout from "@/components/ScreenLayout/ScreenLayout.vue";
import FeatureNotImplemented from "@/components/FeatureNotImplemented/FeatureNotImplemented.vue";
import { isEqual } from "lodash";

let packetController = null as PacketController | null;

export default defineComponent({
  name: "App",
  components: {
    FeatureNotImplemented,
    HardwarePanel,
    AlarmLamp,
    ScreenLayout,
    SpinnerControl,
  },
  data() {
    return {
      isDemo: false,
      isCustomState: false, // TODO set false for the build versions
      isVentilatorRunning: false,
      alarmPriority: "none",
    };
  },
  mounted() {
    packetController = new PacketController(store, this);
    let waveformEngine = new WaveformEngine();
    waveformEngine.start();
    GraphicWaveformState.waveformEngine = waveformEngine;

    this.resize();
    window.onresize = this.resize;

    if (this.isDemo) {
      this.setupDemo();
    } else if (this.isCustomState) {
      NavigationState.setNavButton({ value: true, buttonType: navTypes.power });
      if (!FeatureFlagsStoreState.isEnabled(FeatureId.HAMILTON)) {
        console.log("features", FeatureFlagsStoreState.features);
        let features = FeatureFlagsStoreState.features;
        features.push(FeatureId.HAMILTON);
        FeatureFlagsStoreState.updateFeatureFlags(features);
      }
    }

    DeviceState.updateAudioPlayer(audioPlayer);

    const search = new URLSearchParams(window.location.search);
    const debug = search.get("debug");
    if (debug) {
      packetController.connect(debug);
    }

    // allow the connection time to connect before sending the ventilator settings
    setTimeout(() => {
      if (packetController != null) {
        SpinnerResultState.initSettings(packetController);
        VentilatorState.init(packetController);
      }
    }, 300);
  },
  methods: {
    resize() {
      setupFixedViewport(
        ".hamiltonBackGround",
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT,
        { x: 0, y: 0, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
        false,
        false,
        true
      );
    },
    updateWaveforms(
      data: any,
      heartbeatOccurred?: boolean,
      pacerPulseOccured?: boolean,
      spontTriggerOccurred?: boolean
    ) {
      if (GraphicWaveformState.waveformEngine) {
        GraphicWaveformState.waveformEngine.updateWaveforms(data, false, false, spontTriggerOccurred);
        GraphicWaveformState.waveformEngine.updateLoops(data);
      }
    },
    setupDemo() {
      // Start with MainMode
      NavigationState.setNavButton({ value: true, buttonType: navTypes.power });
      // Start vent with Layout 2
      MainModeState.isStartVentButtonClicked = true;
      MainModeState.allowMonitoringButton = true;
      LayoutState.layoutType = LayoutJson.layout2;
      NavigationState.resetMainNavigationButtons();

      GraphicWaveformState.resetWaveforms();
    },
    spinnerTurnForwards() {
      if (HamiltonT1State.screenLocked) return;

      let spinnerActions = SpinnerSelectionState.activeSpinnerActions;
      if (spinnerActions) {
        spinnerActions.spinForwards();
        spinnerActions.applyCount();
      }
    },
    spinnerTurnBackwards() {
      if (HamiltonT1State.screenLocked) return;

      let spinnerActions = SpinnerSelectionState.activeSpinnerActions;
      if (spinnerActions) {
        spinnerActions.spinBackwards();
        spinnerActions.applyCount();
      }
    },
    exit(count: number): boolean {
      if (count === 2) {
        new ProxyController().exit();
      }

      return false;
    },
  },
  computed: {
    getCurrentPatient() {
      return MainModeState.currentPatientType;
    },
    isPowerButtonOn(): boolean {
      return NavigationState.powerButton;
    },
    isLoadingDone(): boolean {
      return NavigationState.loadingDone;
    },
    breathFinished(): boolean {
      return VentilatorState.breathState === BreathState.Finished;
    },
    isNewAlarm(): string {
      return AlarmState.getAlarmType();
    },
    ventilatorSettings(): VentilatorSettings {
      return VentilatorState.settings;
    },
    ventilatorStatus(): VentilatorStatus {
      return VentilatorState.status;
    },
    showingFeatureNotImplemented(): boolean {
      return HamiltonT1State.showingFeatureNotImplemented;
    },
  },
  watch: {
    getCurrentPatient() {
      packetController = new PacketController(store, this);
      if (packetController !== null) {
        SpinnerResultState.initSettings(packetController);
      }
    },
    breathFinished() {
      if (GraphicWaveformState.waveformEngine) {
        GraphicWaveformState.waveformEngine.clearLoopsForNewBreath();
      }
    },
    isNewAlarm(value: string) {
      this.alarmPriority = value;
    },
    ventilatorSettings(newValue, oldValue) {
      if (VentilatorState.packetChangedSettings || !isEqual(newValue, oldValue)) {
        SpinnerResultState.updateCountsWithVentilatorSettings(newValue, oldValue);
      }
    },
    /** isRunning can be changed from a packet or from StandByConfirm and MainMode */
    ventilatorStatus(newValue) {
      if (newValue.isRunning !== this.isVentilatorRunning) {
        this.isVentilatorRunning = newValue.isRunning;
        if (this.isVentilatorRunning) {
          AlarmState.silenceAlarms(60);
          MainModeState.isStartVentButtonClicked = true;
          StandbyStoreState.isLastPatientOn = true;
          MainModeState.allowMonitoringButton = true;
          LayoutState.layoutType = LayoutJson.layout2;
          NavigationState.resetMainNavigationButtons();
        } else {
          MainModeState.isStartVentButtonClicked = false;
          MainModeState.allowMonitoringButton = false;
          LayoutState.layoutType = "";
          NavigationState.resetMainNavigationButtons();
          AlarmState.resetAllAlarms();
          AlarmState.setAlarmBufferFlag(false);
          AlarmState.stopAllAlarms();
        }
      }
    },
  },
});
</script>

<style>
@import "./assets/styles/central.css";
@import "./assets/styles/shared.css";

.sideColor {
  background: #d06758;
  height: 100vh;
  width: 10px;
  position: absolute;
  top: 0;
}

.sideColor.left {
  left: 0;
  background: -webkit-linear-gradient(right, #882926, #d05c58); /*C85C4E*/
  background: -moz-linear-gradient(right, #882926, #d05c58);
  background: linear-gradient(to left, #882926, #d05c58);
}

.sideColor.right {
  right: 0;
  background: -webkit-linear-gradient(left, #882926, #d05c58); /*C85C4E*/
  background: -moz-linear-gradient(left, #882926, #d05c58);
  background: linear-gradient(to right, #882926, #d05c58);
}

.divParameterSpinnerApp {
  padding-left: 80px;
}

.hamiltonBackGround {
  background-image: url("./img/HamiltonT1-Base.png");
  background-repeat: no-repeat;
  background-size: cover;
}

.logoImg {
  position: absolute;
  top: 73.5%;
  height: 23px;
  padding-left: 275px;
}

#app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: block;
  position: relative;
}

.mainLamp {
  position: absolute;
  top: 0;
  left: 28px;
  z-index: 1;
}

.rightSide {
  top: 176px;
  left: 1012px;
  position: absolute;
  width: 154px;
  height: 550px;
}
</style>
