<template src="./VentTimer.html"></template>
<style src="./VentTimer.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { StandBy } from "../../classes/Standby";
import { StandbyStoreState } from "@/store";
const { setInterval } = window;

let stopInterval = 1;
export default defineComponent({
  name: "VentTimer",
  components: {},
  computed: {
    isVentResetClicked(): boolean {
      return StandbyStoreState.isVentResetClicked;
    },
  },
  watch: {
    isVentResetClicked: {
      handler: function (newVal) {
        if (newVal) {
          this.stopVentTime(newVal);
          this.startVentTime();
        }
      },
    },
  },
  data() {
    return {
      day: "00",
      hour: "00",
      min: "00",
      standByCls: new StandBy(),
      interValVentStop: 0,
    };
  },
  mounted() {
    this.startVentTime();
  },
  methods: {
    startVentTime() {
      const isVentStarted = StandbyStoreState.isVentTimerStarted;
      let sDate = new Date();
      if (isVentStarted) {
        sDate = StandbyStoreState.startTime;
      } else {
        sDate = this.standByCls.setStartTime();
      }
      stopInterval = setInterval(() => {
        let object = this.standByCls.getElapsedTimeForVent(sDate);
        this.day = object.days;
        this.hour = object.hours;
        this.min = object.min;
        StandbyStoreState.isVentTimerStarted = true;
        StandbyStoreState.startTime = sDate;
      }, 1000);
    },
    stopVentTime(isVentResetPressed: boolean) {
      if (isVentResetPressed) {
        window.clearInterval(stopInterval);
        StandbyStoreState.isVentTimerStarted = false;
        StandbyStoreState.isVentResetClicked = false;
        stopInterval = -1;
      }
    },
  },
});
</script>
