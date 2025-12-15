<template>
  <div class="container">Feature not simulated</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FeatureNotImplemented",
});
</script>

<style scoped>
.container {
  padding: 50px;
  background: rgba(117, 117, 117, 0.95);
  color: white;
  font-size: xx-large;
  text-align: center;
  position: absolute;
  width: 768px;
  height: 9rem;
  top: calc(50% - 4.5rem);
  left: calc(50% - (768px / 2));
  z-index: 9999;
}
</style>
