<style scoped>
.spinnerControlContainer {
  padding-top: 40%;
  top: 0;
}
.spinnerControl {
  width: 160px;
  height: 160px;
  background-image: url("../../img/HamiltonSideControl/spinner.png");
  background-size: cover;
}

.spinnerControl.off {
  background-image: url("../../img/HamiltonSideControl/spinnerOff.png");
}
</style>

<template>
  <div class="spinnerControlContainer" :class="[isNightMode ? 'night-mode-half' : '']">
    <div id="Spinner" class="spinnerControl" :class="{ off: !powerOn }" @click="spinnerPressed"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HamiltonT1State, LayoutState, SpinnerSelectionState } from "@/store";
import { Rotatable } from "../../resources/rotatable";
let rotatable: Rotatable | null = null;

export default defineComponent({
  name: "Spinner",
  components: {},
  data() {
    return {};
  },
  props: {
    powerOn: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    isNightMode() {
      return LayoutState.isNightMode;
    },
  },
  watch: {},
  mounted() {
    // TODO use refs instead
    const element = document.getElementById("Spinner");
    if (element) {
      rotatable = new Rotatable({ onRotating: this.createCount }, element);
    }
  },
  beforeUnmount() {
    if (rotatable) {
      rotatable.destroy();
      rotatable = null;
    }
  },
  methods: {
    createCount() {
      if (!rotatable) {
        return;
      }

      if (rotatable.currentRotation < rotatable.rotation) {
        this.$emit("spinForwards");
      } else {
        this.$emit("spinBackwards");
      }
    },
    spinnerPressed() {
      if (HamiltonT1State.screenLocked) return;

      // confirm or make active control
      if (SpinnerSelectionState.anySelected) {
        SpinnerSelectionState.activateSelected();
      } else if (SpinnerSelectionState.anyActive) {
        SpinnerSelectionState.deactivateAndSelect();
      }
    },
  },
});
</script>
