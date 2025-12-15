import navTypes from "../config/navButtons.json";
import { defineStore } from "pinia";

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    powerButton: false,
    monitoringButton: false,
    toolsButton: false,
    eventsButton: false,
    systemButton: false,
    controlButton: false,
    alarmButton: false,
    graphicButton: false,
    modeButton: false,
    loadingDone: false,
    hardwareLoad: false,
    alarmLoad: false,
    standByConfirm: false,
  }),
  getters: {
    areAnyWindowsOpen(): boolean {
      return (
        this.graphicButton ||
        this.systemButton ||
        this.toolsButton ||
        this.eventsButton ||
        this.controlButton ||
        this.alarmButton ||
        this.modeButton ||
        this.monitoringButton
      );
    },
    getLoadingDone(): boolean {
      return this.loadingDone;
    },
  },
  actions: {
    resetMainNavigationButtons() {
      this.monitoringButton = false;
      this.graphicButton = false;
      this.toolsButton = false;
      this.eventsButton = false;
      this.systemButton = false;
      this.controlButton = false;
      this.alarmButton = false;
      this.modeButton = false;
      this.standByConfirm = false;
    },
    setNavButton({ value, buttonType }: { value: boolean; buttonType: string }) {
      switch (buttonType) {
        case navTypes.power: {
          this.powerButton = value;
          break;
        }
        case navTypes.monitoring: {
          this.monitoringButton = value;
          break;
        }
        case navTypes.tools: {
          this.toolsButton = value;
          break;
        }
        case navTypes.events: {
          this.eventsButton = value;
          break;
        }
        case navTypes.system: {
          this.systemButton = value;
          break;
        }
        case navTypes.control: {
          this.controlButton = value;
          break;
        }
        case navTypes.alarm: {
          this.alarmButton = value;
          break;
        }
        case navTypes.graphic: {
          this.graphicButton = value;
          break;
        }
        case navTypes.mode: {
          this.modeButton = value;
          break;
        }
        case navTypes.standbyConfirm: {
          this.standByConfirm = value;
          break;
        }
      }
    },
    setLoading({ value }: { value: boolean }) {
      this.loadingDone = value;
    },
    setHardWareLoad({ value }: { value: boolean }) {
      this.hardwareLoad = value;
    },
    setAlarmLoad({ value }: { value: boolean }) {
      this.alarmLoad = value;
    },
  },
});
