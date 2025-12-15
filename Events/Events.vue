<style src="./Events.css" scoped></style>
<template src="./Events.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import { NavigationState } from "@/store";

export default defineComponent({
  name: "Events",
  components: {},
  computed: {},
  data() {
    return {
      //dummy data for now. mock up
      activeEvents: [
        { date: "12-02 00:01", type: "Sensor", msg: "CO2 => Off", priority: "High" },
        { date: "12-02 01:02", type: "Control", msg: "Patient group Adult/Ped.", priority: "" },
        { date: "12-02 03:03", type: "Start", msg: "On", priority: "Low" },
        { date: "12-02 02:04", type: "Sensor", msg: "O2 => On", priority: "" },
        { date: "12-02 03:05", type: "Sensor", msg: "O2 => Off", priority: "" },
        { date: "12-02 04:07", type: "Start", msg: "Off", priority: "Low" },
        { date: "12-02 05:09", type: "Control", msg: "Peep => 5.0 cmH2O", priority: "" },
        { date: "12-02 02:03", type: "Sensor", msg: "CO2 => Off", priority: "High" },
        { date: "12-02 03:05", type: "Sensor", msg: "O2 => Off", priority: "" },
      ],
      evtHigh: "red",
      evtLow: "yellow",
      styleInActive: "#ecc531",
    };
  },
  props: {},
  mounted() {},
  methods: {
    close() {
      NavigationState.resetMainNavigationButtons();
    },
  },
});
</script>
