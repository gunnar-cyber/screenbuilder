<template>
  <div class="waveform-loop-panel">
    <div class="waveform-panel">
      <div class="vertical-axis text-right">
        <div v-for="val in verticalAxes" :key="val">{{ val }}</div>
      </div>
      <div class="horizontal-axis" :class="{ middle: isFlow }">
        <div class="axis-label" v-for="val in horizontalAxes" :key="val">{{ val }}</div>
      </div>
      <div class="waveform-part">
        <slot></slot>
      </div>

      <img class="axis-lines" v-if="isPressure" src="../../img/MiddleArea/FlowVolumeLoopPanelBackground.svg" />
      <img class="axis-lines" v-else-if="isFlow" src="../../img/MiddleArea/FlowVolumeLoopPanelBackground.svg" />
      <img class="axis-lines" v-else-if="isVolume" src="../../img/MiddleArea/FlowVolumeLoopPanelBackground.svg" />

      <div class="unitX">
        {{ waveformXDetails.title }} <br />
        {{ waveformXDetails.unitOfMeasurement }}
      </div>

      <div class="unitY">
        {{ waveformYDetails.title }} <br />
        {{ waveformYDetails.unitOfMeasurement }}
      </div>

      <div class="reference-image-container">
        <img class="reference-image" src="../../img/MiddleArea/ReferenceIcon.png" @click="saveReference" />
      </div>
    </div>

    <div class="flex flex-col flex-1 mr-1 justify-between text-right text-white" style="height: 92%">
      <div class="" style="margin-top: 8px">
        <div>Rinsp</div>
        <div class="text-2xl font-medium leading-none">{{ inspiratoryFlowResistance }}</div>
        <div>cmH20/l/s</div>
      </div>
      <div class="">
        <div>Cstat</div>
        <div class="text-2xl font-medium leading-none">{{ staticCompliance }}</div>
        <div>ml/cmH20</div>
      </div>
      <div class="">
        <div>RCexp</div>
        <div class="text-2xl font-medium leading-none">{{ expiratoryTimeConstant }}</div>
        <div>s</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { WaveformType } from "isimulate-screen-builder";
import { VentilatorState } from "@/store/index";

const vals = {
  paw: [40, 20, 0],
  flow: [75, 50, 25, 0, -25, -50, -75],
  volume: [800, 600, 400, 200],
};

export default defineComponent({
  name: "WaveformLoopPanel",
  props: ["waveformXDetails", "waveformYDetails"],
  components: {},
  computed: {
    isPressure(): boolean {
      return this.waveformXDetails.type === WaveformType.VentPressure;
    },
    isFlow(): boolean {
      return this.waveformXDetails.type === WaveformType.VentFlow;
    },
    isVolume(): boolean {
      return this.waveformXDetails.type === WaveformType.VentVolume;
    },
    verticalAxes(): Array<number> {
      return this.axesForType(this.waveformYDetails.type);
    },
    horizontalAxes(): Array<number> {
      return this.axesForType(this.waveformXDetails.type).reverse();
    },
    staticCompliance(): string {
      return VentilatorState.hadFirstBreath() ? VentilatorState.monitored.compliance.toFixed(1) : "---";
    },
    expiratoryTimeConstant(): string {
      let value = VentilatorState.monitored.expiratoryTimeConstant;
      return VentilatorState.hadFirstBreath() && value != 0
        ? VentilatorState.monitored.expiratoryTimeConstant.toFixed(2)
        : "---";
    },
    inspiratoryFlowResistance(): string {
      return "---"; // TODO
    },
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    axesForType(type: number): Array<number> {
      switch (type) {
        case WaveformType.VentFlow:
          return vals.flow;
        case WaveformType.VentVolume:
          return vals.volume;
        case WaveformType.VentPressure:
        default:
          return vals.paw;
      }
    },
    saveReference(event: MouseEvent | TouchEvent) {
      this.$emit("saveReference", event);
    },
  },
});
</script>

<style scoped>
.title {
  color: #fff;
  font-weight: bold;
  position: relative;
  left: 35px;
  font-size: 0.8em;
  text-align: left;
}

.vertical-axis,
.horizontal-axis {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 0.7em;
  color: #fff;
}

.vertical-axis {
  flex-direction: column;
  position: absolute;
  height: 263px;
  margin-left: 2px;
  top: 15px;
  width: 22px;
}

.horizontal-axis {
  flex-direction: row;
  position: absolute;
  width: 266px;
  left: 25px;
  top: 272px;
}

.horizontal-axis.middle {
  top: 275px;
}

.axis-lines {
  position: absolute;
  left: 21px;
  height: 270px;
  top: 21px;
}

.axis-label {
  width: 12px;
}

.reference-image-container {
  position: absolute;
  top: 2px;
  right: 0px;
  padding: 8px;
  background-color: #000;
}

.reference-image {
  background-color: #232522;
  width: 36px;
  height: 36px;
  padding: 8px;
}

.unitY {
  position: absolute;
  color: #fff;
  text-align: left;
  top: 3px;
  left: 36px;
  font-size: 0.8em;
}

.unitX {
  position: absolute;
  color: #fff;
  text-align: left;
  bottom: 36px;
  right: 3px;
  font-size: 0.8em;
}

.waveform-part {
  position: absolute;
  left: 32px;
  top: 10px;
}

.waveform-panel {
  background-color: #0d0d0d;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 0 0 310px;
}

.waveform-loop-panel {
  background-color: #0d0d0d;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
