<template src="./StandByConfirm.html"></template>
<style src="./StandByConfirm.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { MainModeState, NavigationState, VentilatorState } from "@/store";
import { standByCounterStatus } from "@/store/MainMode";

export default defineComponent({
  name: "StandByConfirm",
  components: {},
  computed: {},
  data() {
    return {};
  },
  props: {},
  mounted() {},
  methods: {
    close() {
      NavigationState.resetMainNavigationButtons();
    },
    activateStandBy() {
      MainModeState.standbyCounter = standByCounterStatus.started;
      VentilatorState.stopVentilation();
      MainModeState.setLastPatientType();
    },
  },
});
</script>
