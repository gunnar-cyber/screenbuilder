<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./HardwarePanel.css" scoped></style>
<template src="./HardwarePanel.html"></template>

<script lang="ts">
import { defineComponent } from "vue";
import powerButton from "@/img/HamiltonSideControl/power-button.png";
import navTypes from "@/config/navButtons.json";
import {
  AlarmState,
  DeviceState,
  HamiltonT1State,
  LayoutState,
  MainModeState,
  NavigationState,
  SpinnerResultState,
  SpinnerSelectionState,
} from "@/store";
import { BatteryState } from "@screenbuilder/components";
import layoutJson from "../../config/layout.json";
import { takeNativeScreenshot } from "isimulate-screen-builder";

export default defineComponent({
  name: "HardwarePanel",
  data() {
    return {
      element: null,
      svg: null,
      imgElement: null,
      isDragging: false,
      isLight1On: false,
      isLight2On: false,
      isLight3On: false,
      isLight4On: false,
      isLight5On: false,
      isLight6On: false,
      audioSilenceOn: false,
      isAlarmSoundLoading: false,
      powerButton: powerButton,
      timePowerHeld: 0,
      silenceIntervalId: undefined as number | undefined,
      alarmButtonClass: "hardwarePanelLightRedFlash",
    };
  },
  computed: {
    hasActiveAlarms(): boolean {
      return AlarmState.hasActiveAlarms;
    },
    isSilenced(): boolean {
      return AlarmState.isSilenced;
    },
    isCharging(): Boolean {
      return DeviceState.batteryState === BatteryState.charging;
    },
    isChargedAndPluggedIn(): Boolean {
      const isCharged = DeviceState.batteryState === BatteryState.full || DeviceState.batteryLevel >= 0.98;
      const isPlugged =
        DeviceState.batteryState !== BatteryState.unplugged && DeviceState.batteryState !== BatteryState.unknown;

      return isCharged && isPlugged;
    },
    isHardwareLoading(): boolean {
      return NavigationState.hardwareLoad;
    },
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
    isNewAlarmTriggered(): boolean {
      return AlarmState.getNewAlarmFlagTriggered;
    },
    isPoweredOn(): boolean {
      return DeviceState.poweredOn;
    },
  },
  watch: {
    isNewAlarmTriggered(newValue: boolean) {
      if (newValue && this.isSilenced) {
        this.alarmButtonClass = "hardwarePanelLightRed";
      }

      if (!newValue && !this.isSilenced) {
        this.alarmButtonClass = "hardwarePanelLightRedFlash";
      }
    },
    isSilenced(newValue: boolean) {
      if (newValue) {
        this.alarmButtonClass = "hardwarePanelLightRed";
      }
      if (!newValue) {
        this.alarmButtonClass = "hardwarePanelLightRedFlash";
      }
    },
    isHardwareLoading(newValue: boolean) {
      if (newValue) {
        this.isLight1On = true;
        this.isLight2On = true;
        this.isLight3On = true;
        this.isLight4On = true;
        this.isLight5On = true;
        this.isLight6On = true;
      } else {
        this.isLight1On = false;
        this.isLight2On = false;
        this.isLight3On = false;
        this.isLight4On = false;
        this.isLight5On = false;
        this.isLight6On = false;
      }
    },
    isPoweredOn(newValue: boolean) {
      if (newValue) {
        NavigationState.setLoading({ value: true });
      } else {
        NavigationState.setLoading({ value: false });
        NavigationState.setNavButton({ value: false, buttonType: navTypes.power });
      }
    },
  },
  mounted() {},
  methods: {
    /* power button toggles standby window when venting otherwise starts venting if in standby */
    powerButtonChange(isDown: boolean) {
      if (HamiltonT1State.screenLocked) return;
      SpinnerResultState.resetAlarmDial();
      if (!NavigationState.powerButton) {
        // NOTE the real device requires a brief hold to power on, using press for usability
        // turn on
        NavigationState.setLoading({ value: true });
        return;
      }

      // must be on up for start screen so it can be held
      if (isDown && !this.startVentEnabled) {
        return;
      }

      // ignore up when venting
      if (!isDown && this.startVentEnabled) {
        NavigationState.resetMainNavigationButtons();
        NavigationState.setNavButton({
          value: !NavigationState.standByConfirm,
          buttonType: navTypes.standbyConfirm,
        });
        return;
      }

      if (!this.startVentEnabled) {
        // start venting
        SpinnerSelectionState.deactivateAndSelect();
        LayoutState.layoutType = layoutJson.layout2;
        NavigationState.resetMainNavigationButtons();
      }
    },
    /** only turn off if in standby and held */
    powerButtonHeld() {
      if (HamiltonT1State.screenLocked) return;

      this.timePowerHeld = this.timePowerHeld + 1;

      if (NavigationState.powerButton) {
        if (!this.startVentEnabled && this.timePowerHeld >= 3) {
          // turn off
          NavigationState.setLoading({ value: false });
          NavigationState.setNavButton({ value: false, buttonType: navTypes.power });
          LayoutState.isNightMode = false;
        }
      }
    },
    powerButtonHeldEnd() {
      this.timePowerHeld = 0;
    },
    o2ButtonPressed() {
      HamiltonT1State.showFeatureNotImplemented();
    },
    async nebulizerButtonPressed() {
      if (this.isLight6On) {
        HamiltonT1State.hideNebulizerActive();
        this.isLight6On = false;
      } else {
        this.isLight6On = true;
        await HamiltonT1State.showNebulizerActive();
        this.isLight6On = false;
      }
    },
    silenceButtonPressed() {
      // TODO check behaviour of lights
      if (AlarmState.isSilenced) {
        AlarmState.unsilenceAlarms();
        this.alarmButtonClass = "hardwarePanelLightRedFlash";
      } else {
        AlarmState.silenceAlarms();
        AlarmState.setIsNewAlarmCreated(false);
        this.alarmButtonClass = "hardwarePanelLightRed";
      }
    },
    nightModeButtonPressed() {
      if (!NavigationState.powerButton) return;

      LayoutState.isNightMode = !LayoutState.isNightMode;
      this.isLight1On = LayoutState.isNightMode;
    },
    screenLockButtonPressed() {
      if (!NavigationState.powerButton) return;

      HamiltonT1State.screenLocked = !HamiltonT1State.screenLocked;
      this.isLight2On = HamiltonT1State.screenLocked;
    },
    printScreenButtonPressed() {
      if (!NavigationState.powerButton) return;

      this.isLight5On = true;

      const { x, y, width, height } = (document.querySelector("#entire-screen") as HTMLElement).getBoundingClientRect();
      takeNativeScreenshot({ x, y, width, height });

      window.setTimeout(() => {
        HamiltonT1State.showScreenshotSaved();
        this.isLight5On = false;
      }, 1000);
    },
  },
});
</script>
