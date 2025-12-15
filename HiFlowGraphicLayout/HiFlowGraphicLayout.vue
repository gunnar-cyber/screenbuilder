<template>
  <div class="flex flex-col waveformGraphicsContainer">
    <WaveformPanelHiFlow />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WaveformPanelHiFlow from "@/components/WaveformPanelHiFlow/WaveformPanelHiFlow.vue";

export default defineComponent({
  name: "WaveformGraphicLayout",
  components: {
    WaveformPanelHiFlow,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {},
});
</script>
<style scoped>
.waveformGraphicsContainer {
  height: 100%;
  width: 100%;
}
</style>
