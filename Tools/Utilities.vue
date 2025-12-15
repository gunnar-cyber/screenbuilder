<style src="./Utilities.css" scoped></style>
<template src="./Utilities.html"></template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Utilities",
  components: {},
  computed: {},
  data() {
    return {
      activePOModeBtn: 1,
    };
  },
  props: {},
  mounted() {},
  methods: {
    setPOMode(poBtn: number) {
      this.activePOModeBtn = poBtn;
    },
  },
});
</script>
