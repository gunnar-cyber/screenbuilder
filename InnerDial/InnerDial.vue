<template src="./InnerDial.html"></template>
<style src="./InnerDial.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";

export const redDialMaxValue = 192.6; //TODO remove export when alarmDial no longer needs it
let dotEndRotation = 240;

function roundUp2Decimal(x: number): number {
  // probably don't need the toFixed but leaving just in case
  return Math.ceil(Number((x * 100).toFixed(2))) / 100;
}

export default defineComponent({
  name: "InnerDial",
  components: {},
  computed: {
    /** this just needs to as large as the circumference to prevent any further dashes */
    dashGap(): number {
      return 2 * Math.PI * this.radius + 200;
    },
    /** the rotation of the black dot which represents current value when not editing */
    currentRotVal(): number {
      const min = this.minHardP;
      const max = this.maxHardP;

      const value = roundUp2Decimal((this.currentCountP - min) / (max - min));

      return Math.ceil(value * dotEndRotation);
    },
    /** the rotation value for the mode specific max dot */
    maxModeRotVal(): number {
      const min = this.minHardP;
      const max = this.maxHardP;

      let dotValue = this.maxModeP;
      if (dotValue >= max) {
        dotValue = max;
      }

      const value = roundUp2Decimal((dotValue - min) / (max - min));
      return Math.ceil(value * (dotEndRotation - 6)); // adjusted to align with red line insted of black dot
    },
    /** the rotation value for the mode specific min dot */
    minModeRotVal(): number {
      const min = this.minHardP;
      const max = this.maxHardP;

      let dotValue = this.minModeP;
      if (dotValue <= min) {
        dotValue = min;
      }

      const value = roundUp2Decimal((dotValue - min) / (max - min));
      return Math.ceil(value * (dotEndRotation - 6)); // adjusted to align with red line insted of black dot
    },
    /** gives how much of the red line to show to represent the value being edited */
    currentRedDialPercent(): number {
      return ((this.currentCountP - this.minHardP) / (this.maxHardP - this.minHardP)) * redDialMaxValue;
    },
  },
  data() {
    return {
      radius: 46,
    };
  },
  props: [
    "currentCountP",
    "customWidthP",
    "customHeightP",
    "customPaddingP",
    "whichDialIsOnP",
    "minHardP",
    "maxHardP",
    "minModeP",
    "maxModeP",
    "onDialBackgroundColorP",
    "offDialBackgroundColorP",
    "screenTypeP",
    "isOffCount",
    "newOuterGreyCircle",
    "showMinOrangeDial",
    "showMaxOrangeDial",
    "currentDialType",
  ],
  mounted() {},
  methods: {
    toggleDial() {
      if (!this.newOuterGreyCircle) {
        this.$emit("toggleInnerDialEvent");
      }
    },
  },
});
</script>
