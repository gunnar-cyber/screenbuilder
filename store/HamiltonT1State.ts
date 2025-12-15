import { defineStore } from "pinia";
import { NavigationState } from "@/store/index";
import screenbeep from "../assets/sounds/screenbeep.wav";
import { audioPlayer } from "isimulate-screen-builder";

export const getHamiltonT1State = defineStore("hamiltonT1State", {
  state: () => ({
    notImplementedTimer: undefined as number | undefined,
    screenLockTimer: undefined as number | undefined,
    screenshotSavedTimer: undefined as number | undefined,
    nebulizerActiveTimer: undefined as number | undefined,
    showingFeatureNotImplemented: false,
    showingScreenLocked: false,
    showingScreenshotSaved: false,
    showingNebulizerActive: false,
    screenLocked: false,
    applicationTime: "",
    dateAndtime: { currentDate: "", currentTime: "" },
  }),
  getters: {
    getCurrentDateAndTime(): { currentDate: string; currentTime: string } {
      return this.dateAndtime;
    },
  },
  actions: {
    createDateAndTime() {
      let today = new Date();
      let currentDay = -1;
      // date will update much less frequently than time
      let day = today.getDate();
      if (currentDay !== day) {
        currentDay = day;
        let dd = String(day).padStart(2, "0");
        let mm = String(today.getMonth() + 1).padStart(2, "0");
        let yyyy = today.getFullYear();
        this.dateAndtime.currentDate = yyyy + "-" + mm + "-" + dd;
      }

      this.dateAndtime.currentTime = today.toTimeString().substr(0, 8);
    },
    showScreenLocked(duration = 2000) {
      // If the device is off, don't do anything
      if (!NavigationState.powerButton) return;

      if (this.screenLockTimer) {
        clearTimeout(this.screenLockTimer);
        this.screenLockTimer = undefined;
      }

      audioPlayer.play(screenbeep);
      this.showingScreenLocked = true;

      this.screenLockTimer = window.setTimeout(() => (this.showingScreenLocked = false), duration);
    },
    showFeatureNotImplemented(duration = 2000) {
      // If the device is off, don't do anything
      if (!NavigationState.powerButton) return;

      if (this.notImplementedTimer) {
        clearTimeout(this.notImplementedTimer);
        this.notImplementedTimer = undefined;
      }

      this.showingFeatureNotImplemented = true;

      this.notImplementedTimer = window.setTimeout(() => (this.showingFeatureNotImplemented = false), duration);
    },
    showScreenshotSaved(duration = 2000) {
      // If the device is off, don't do anything
      if (!NavigationState.powerButton) return;

      if (this.screenshotSavedTimer) {
        clearTimeout(this.screenshotSavedTimer);
        this.screenshotSavedTimer = undefined;
      }

      this.showingScreenshotSaved = true;

      this.screenshotSavedTimer = window.setTimeout(() => (this.showingScreenshotSaved = false), duration);
    },
    async showNebulizerActive(duration = 10000) {
      // If the device is off, don't do anything
      if (!NavigationState.powerButton) return;

      if (this.nebulizerActiveTimer) {
        clearTimeout(this.nebulizerActiveTimer);
        this.nebulizerActiveTimer = undefined;
      }

      this.showingNebulizerActive = true;

      return new Promise((res, _) => {
        this.nebulizerActiveTimer = window.setTimeout(() => res((this.showingNebulizerActive = false)), duration);
      });
    },
    hideNebulizerActive() {
      if (this.nebulizerActiveTimer) {
        clearTimeout(this.nebulizerActiveTimer);
        this.nebulizerActiveTimer = undefined;
      }
      this.showingNebulizerActive = false;
    },
  },
});
