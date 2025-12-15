<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./Graphics.css" scoped></style>
<template src="./Graphics.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import LayoutJson from "../../config/layout.json";
import { GraphicWaveformState, LayoutState, MainModeState, NavigationState } from "@/store";

export default defineComponent({
  name: "Graphics",
  components: {},
  computed: {
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
  },
  data() {
    return {
      activeButton: 1,
      layout1: LayoutJson.layout1,
      layout2: LayoutJson.layout2,
      layout3: LayoutJson.layout3,
      layout4: LayoutJson.layout4,
    };
  },
  props: {},
  mounted() {
    this.setActive();
  },
  methods: {
    setActive() {
      if (LayoutState.layoutType === LayoutJson.layout1) {
        this.activeButton = 1;
      }
      if (LayoutState.layoutType === LayoutJson.layout2) {
        this.activeButton = 2;
      }
      if (LayoutState.layoutType === LayoutJson.layout3) {
        this.activeButton = 3;
      }
      if (LayoutState.layoutType === LayoutJson.layout4) {
        this.activeButton = 4;
      }
    },
    close() {
      NavigationState.resetMainNavigationButtons();
    },
    changeLayout(layoutType: string) {
      GraphicWaveformState.resetWaveforms();
      // TODO: temp for tradeshow
      // if (layoutType === LayoutJson.layout1) {
      //   GraphicWaveStore.setWaveForm(WaveJson.pressure);
      //   GraphicWaveStore.setWaveForm(WaveJson.flow);
      //   GraphicWaveStore.setWaveForm(WaveJson.volume);
      //   GraphicWaveStore.setWaveForm(WaveJson.pes);
      // }
      // if (layoutType === LayoutJson.layout2) {
      //   GraphicWaveStore.setWaveForm(WaveJson.pressure);
      //   GraphicWaveStore.setWaveForm(WaveJson.flow);
      // }
      LayoutState.layoutType = layoutType;
      NavigationState.resetMainNavigationButtons();
    },
  },
});
</script>
