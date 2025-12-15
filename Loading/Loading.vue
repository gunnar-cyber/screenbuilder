<template src="./Loading.html"></template>
<style src="./Loading.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import navTypes from "../../config/navButtons.json";
import { AlarmState, NavigationState, store } from "@/store";
import { AlarmType } from "@/store/Alarms";

export default defineComponent({
  name: "Loading",
  components: {},
  computed: {},
  data() {
    return {};
  },
  props: {},
  mounted() {
    this.move();
  },
  methods: {
    move() {
      var elem = this.$refs.loadingProgressBarInner as HTMLElement;
      let width = 40;
      let stopInterval = setInterval(() => {
        width = width + 10;
        elem.style.width = width + "%";
        if (width === 50) {
          AlarmState.triggerAlarm(AlarmType.progressBarOrange);
        }

        if (width === 60) {
          AlarmState.stopAlarm(AlarmType.progressBarOrange);
          AlarmState.resetAlarm(AlarmType.progressBarOrange);
          AlarmState.triggerAlarm(AlarmType.progressBarRed);
        }

        if (width === 70) {
          AlarmState.stopAlarm(AlarmType.progressBarRed);
          AlarmState.resetAlarm(AlarmType.progressBarRed);
        }

        if (width === 80) {
          NavigationState.setHardWareLoad({ value: true });
        }

        if (width === 90) {
          NavigationState.setHardWareLoad({ value: false });
          NavigationState.setAlarmLoad({ value: true });
        }

        if (width >= 100) {
          NavigationState.setLoading({ value: false });
          NavigationState.setNavButton({ value: true, buttonType: navTypes.power });
          clearInterval(stopInterval);
        }
      }, 1000);
    },
  },
});
</script>
