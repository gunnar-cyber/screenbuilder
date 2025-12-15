<template>
  <!-- viewBox height is 100 so that the values can be in percent -->

  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <!-- the base with border -->
      <rect
        fill="white"
        :x="x"
        y="0"
        :width="width + 'px'"
        height="100%"
        style="stroke-width: 1; stroke: #93a5ab"
      ></rect>

      <!-- the top segment, colour will change when value goes outside of the top range -->
      <rect :fill="topFillColour" :x="x" y="0" :width="width + 'px'" :height="topSliderPercentY + '%'"></rect>

      <!-- the plimit buffer, only shows for pressure -->
      <rect
        fill="#2f95d1"
        v-if="showBuffer"
        :x="x"
        :y="topSliderPercentY + '%'"
        :width="width + 'px'"
        :height="(topSliderPercentY <= getPercentOfBottom ? 10 : hideShowBuffer) + '%'"
      ></rect>

      <!-- the bottom segment, colour will change when value goes outside of the bottom range -->
      <rect
        :fill="bottomFillColour"
        :v-if="showBottomRect"
        :x="x"
        :y="bottomSliderPercentY + '%'"
        :width="width + 'px'"
        :height="bottomSliderPercentHeight + '%'"
      ></rect>

      <!-- the value indicator, only shows when ventilator is active -->
      <g v-if="value">
        <line :x1="x" :y1="valuePercentY" :x2="x + width" :y2="valuePercentY" stroke="black" data-v-ba8eb912=""></line>
        <text x="33" :y="valuePercentY" text-anchor="end" dominant-baseline="middle" class="alarmLimitPPeakFontSize">
          {{ value }}
        </text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.alarmLimitPPeakFontSize {
  font-size: small;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";

// determined manually by turning spinner while on the alarm dial
const segments = 50;

export default defineComponent({
  name: "AlarmLimitGraph",
  components: {},
  props: {
    max: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    topValue: {
      type: Number,
      required: true,
    },
    bottomValue: {
      type: Number,
      required: true,
    },
    /** the active monitored parameter value, set to null to not show */
    value: {
      type: Number,
      required: false,
    },
    showBuffer: {
      type: Boolean,
      required: true,
    },
    highAlarmColour: {
      type: String,
      required: true,
    },
    lowAlarmColour: {
      type: String,
      required: true,
    },
    showBottomRect: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      width: 26,
      x: 37,
    };
  },
  computed: {
    topFillColour() {
      return this.highAlarmColour;
    },
    bottomFillColour() {
      return this.lowAlarmColour;
    },
    interval() {
      return (this.max - this.min) / segments;
    },
    /** determines how low the top bar goes, increments in segments */
    topSliderPercentY(): number {
      // 100 inverts because the y starts at the top
      if (this.showBottomRect) {
        return this.getPercentViaApnea;
      } else {
        return 100 - (Math.floor(this.topValue / this.interval) / segments) * 100;
      }
    },
    /** determines how high the bottom bar goes, increments in segments */
    bottomSliderPercentY(): number {
      // 100 inverts because the y starts at the top
      return 100 - this.bottomSliderPercentHeight;
    },
    bottomSliderPercentHeight(): number {
      return (Math.floor(this.bottomValue / this.interval) / segments) * 100 == 0
        ? 1.5
        : (Math.floor(this.bottomValue / this.interval) / segments) * 100;
    },
    valuePercentY(): number {
      return this.value === null || this.value === undefined
        ? 0
        : 100 - ((this.value - this.min) / (this.max - this.min)) * 100;
    },
    /** collapses the buffer when the bottomSlider goes past it */
    hideShowBuffer(): number {
      let topValue = this.topSliderPercentY;
      let bottomValue = this.bottomSliderPercentY;
      let diff = bottomValue - topValue;
      if (diff < 11) {
        return diff;
      } else {
        return 10;
      }
    },
    getPercentOfBottom(): number {
      // function is designed so that the bottom and top sliders are able to slider over the buffer
      var percentUsed = 20;
      var percent = (percentUsed / 100) * this.bottomSliderPercentY;
      return this.bottomSliderPercentY - percent;
    },
    getPercentViaApnea(): number {
      const mapping: { [key: number]: number } = {
        60: 0,
        55: 11.1,
        50: 22.2,
        45: 33.3,
        40: 44.4,
        35: 54.5,
        30: 65.6,
        25: 76.7,
        20: 86.8,
        15: 100,
      };
      return mapping[this.topValue] ?? 0;
    },
  },
});
</script>
