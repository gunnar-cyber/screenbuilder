<style src="./Config.css" scoped></style>
<template src="./Config.html"></template>
<script lang="ts">
import { HamiltonT1State } from "@/store";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Config",
  components: {},
  computed: {},
  data() {
    return {
      activePOModeBtn: 1,
      activeEvents: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      setConfigBtnDisable: true,
      configNumberValue: "",
    };
  },
  props: {},
  mounted() {},
  methods: {
    configProcess() {
      return HamiltonT1State.showFeatureNotImplemented();
    },
    configNumber(value: string) {
      this.configNumberValue = this.configNumberValue + value;
    },
    enterConfigNumber() {
      this.setConfigBtnDisable = this.configNumberValue !== "" ? false : true;
    },
  },
});
</script>
