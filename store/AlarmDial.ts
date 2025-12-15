import { defineStore } from "pinia";

export const useAlarmDialStore = defineStore("alarmDial", {
  state: () => ({
    PressHighDialMin: 0,
    PressLowDialMax: 0,
    CurrentBottomDialValue: 0,
    OxygenHighDialMin: 0,
    OxygenLowDialMax: 0,
    FTotalHighDialMin: 0,
    FTotalLowDialMax: 0,
  }),
  actions: {},
});
