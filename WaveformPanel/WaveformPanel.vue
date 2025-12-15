<template>
  <div class="waveform-panel">
    <div class="vertical-axis text-right" :class="{ flow: isFlow, TenNotch: isFlow && yAxis.length === 5 }">
      <div v-for="val in yAxis" :key="val">{{ val }}</div>
    </div>
    <div class="horizontal-axis" :class="{ middle: isFlow }">
      <div class="axis-label" v-for="val in horizontalAxes" :key="val">{{ val }}</div>
    </div>
    <!-- <svg
      v-if="isPressure"
      class="axis-lines"
      viewBox="0 0 497 164"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xml:space="preserve"
      xmlns:serif="http://www.serif.com/"
      style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
    >
      <rect x="6.5" :y="pressureAlarmLineY" width="497" height="3" style="fill: rgb(245, 72, 66)" />
      <rect x="6.5" :y="pLimitLineY" width="497" height="3" style="fill: rgb(78, 183, 223)" />
    </svg> -->
    <img class="axis-lines" v-if="isPressure" src="../../img/MiddleArea/PressurePanelBackground.svg" />
    <img
      class="axis-lines"
      v-if="isPressure && yAxis[2] === 20"
      src="../../img/MiddleArea/PressurePanelBackground6Notch.svg"
    />
    <img
      class="axis-lines"
      v-else-if="isFlow && yAxis.length === 7"
      src="../../img/MiddleArea/FlowPanelBackground6YNotch.svg"
    />
    <img
      class="axis-lines"
      v-else-if="isFlow && (yAxis.length === 11 || yAxis.length === 5)"
      src="../../img/MiddleArea/FlowPanelBackground10YNotch.svg"
    />
    <img
      class="axis-lines"
      v-else-if="isVolume && yAxis.length === 5"
      src="../../img/MiddleArea/VolumePanelBackground5YLabels.svg"
    />
    <img
      class="axis-lines"
      v-else-if="isVolume && yAxis.length === 6"
      src="../../img/MiddleArea/VolumePanelBackground6YLabels.svg"
    />

    <div class="waveform-part">
      <slot></slot>
    </div>

    <div class="unit vertical">
      {{ waveformDetails.title }} <br />
      {{ waveformDetails.unitOfMeasurement }}
    </div>

    <div class="unit horizontal" :class="{ flow: isFlow, volume: isVolume, pressure: isPressure }">s</div>

    <img v-if="isPressure" class="freeze-image" src="../../assets/trend-icon.png" />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { WaveformType } from "isimulate-screen-builder";

const LIMIT_MIN = 0;
const LIMIT_MAX = 115;

export default defineComponent({
  name: "WaveformPanel",
  props: {
    waveformDetails: {
      type: Object,
      required: true,
    },
    yAxis: {
      type: Array as PropType<Array<number>>,
      required: true,
    },
    pLimit: {
      type: Number,
      required: false,
    },
  },
  components: {},
  computed: {
    isPressure(): boolean {
      return this.waveformDetails.type === WaveformType.VentPressure;
    },
    isFlow(): boolean {
      return this.waveformDetails.type === WaveformType.VentFlow;
    },
    isVolume(): boolean {
      return this.waveformDetails.type === WaveformType.VentVolume;
    },
    pressureAlarmLineY(): number {
      if (this.pLimit === undefined) {
        return 0;
      }
      const range = this.waveformDetails.range;
      const pressureAlarmLimit = this.pLimit + 10;
      return (range.max - pressureAlarmLimit) * ((LIMIT_MAX - LIMIT_MIN) / (range.max - range.min));
    },
    pLimitLineY(): number {
      if (this.pLimit === undefined) {
        return 0;
      }
      const range = this.waveformDetails.range;
      return (range.max - this.pLimit) * ((LIMIT_MAX - LIMIT_MIN) / (range.max - range.min));
    },
  },
  data() {
    return {
      horizontalAxes: [2, 4, 6, 8, 10, 12],
    };
  },
  mounted() {},
  methods: {},
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
  flex-direction: column-reverse;
  position: absolute;
  height: 103px;
  margin-left: 2px;
  top: 14px;
  width: 22px;
}

.vertical-axis.flow {
  height: 117px;
}

.vertical-axis.flow.TenNotch {
  height: 99px;
  top: 24px;
}

.horizontal-axis {
  flex-direction: row;
  position: absolute;
  width: 295px;
  left: 82px;
  top: 113px;
}

.horizontal-axis.middle {
  top: 77px;
}

.axis-lines {
  position: absolute;
  left: 27px;
  height: 124px;
  top: 21px;
}

.axis-label {
  width: 12px;
}

.freeze-image {
  position: absolute;
  background-color: #232522;
  top: 2px;
  right: 0px;
  width: 36px;
  height: 26px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.unit {
  position: absolute;
  color: #fff;
  text-align: left;
  font-size: 0.8em;
}

.unit.vertical {
  top: 3px;
  left: 36px;
}

.unit.horizontal.flow {
  top: 55px;
  right: 0;
}

.unit.horizontal.volume {
  top: 90px;
  right: 0;
}

.unit.horizontal.pressure {
  top: 90px;
  right: 0;
}

.waveform-part {
  position: absolute;
  left: 32px;
  top: 10px;
  pointer-events: none;
}

.waveform-panel {
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
