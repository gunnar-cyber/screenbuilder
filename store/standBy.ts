import { defineStore } from "pinia";

export const useStandbyStore = defineStore("standby", {
  state: () => ({
    startTime: new Date(),
    isStandByStarted: false,
    isVentTimerStarted: false,
    isVentResetClicked: false,
    isLastPatientOn: false,
  }),
  actions: {
    setStandByStarted({ value }: { value: boolean }) {
      this.isStandByStarted = value;
    },
  },
});
