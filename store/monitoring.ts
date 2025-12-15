import { defineStore } from "pinia";

export const useMonitoringScreenStore = defineStore("monitoringScreen", {
  state: () => ({
    monitoringScreen: false,
  }),
});
