<template>
  <div :class="[isNightMode ? 'night-mode' : '']">
    <img src="../../img/LampRed.png" class="red flashing" v-show="priority === 'High'" />
    <img
      src="../../img/LampYellow.png"
      class="yellow"
      :class="{ flashing: priority === 'Medium' }"
      v-show="priority === 'Medium' || priority === 'Low'"
    />
  </div>
</template>

<style scoped>
.red.flashing {
  animation-name: red-flash;
  animation-duration: 0.6s;
  animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  animation-delay: 0s;
  animation-direction: normal;
  animation-iteration-count: infinite;
  animation-play-state: running;
}

@keyframes red-flash {
  70% {
    opacity: 0;
  }
  80% {
    opacity: 1;
  }
}

.yellow.flashing {
  animation-name: yellow-flash;
  animation-duration: 2s;
  animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  animation-delay: 0s;
  animation-direction: normal;
  animation-iteration-count: infinite;
  animation-play-state: running;
}

@keyframes yellow-flash {
  0%,
  50% {
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { LayoutState } from "@/store";

export default defineComponent({
  name: "AlarmLamp",
  components: {},
  computed: {
    isNightMode() {
      return LayoutState.isNightMode;
    },
  },
  data() {
    return {};
  },
  props: {
    priority: String, // TODO work out how to type this properly
  },
  mounted() {},
  methods: {},
});
</script>
