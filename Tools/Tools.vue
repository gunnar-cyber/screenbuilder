<style src="./Tools.css" scoped></style>
<template src="./Tools.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import Utilities from "../../components/Tools/Utilities.vue";
import Config from "../../components/Tools/Config.vue";
import { NavigationState } from "@/store";

export default defineComponent({
  name: "Tools",
  components: { Utilities, Config },
  computed: {},
  data() {
    return {
      activetab: 1,
      activePOModeBtn: 1,
    };
  },
  props: {},
  mounted() {},
  methods: {
    changeTab(index: number) {
      this.activetab = index;
    },
    close() {
      NavigationState.resetMainNavigationButtons();
    },
    setPOMode(poBtn: number) {
      this.activePOModeBtn = poBtn;
    },
  },
});
</script>
