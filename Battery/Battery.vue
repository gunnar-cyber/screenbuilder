<style scoped>
  .red {
    background-color: #FE5849;
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: 15%;
    border: thin solid rgba(0,0,0,0.2);
  }

  .green {
    background-color: #42B149;
    position: absolute;
    width: 100%;
    bottom: 0;
    border-radius: 15%;
    border: thin solid rgba(0,0,0,0.2);
  }

  .battery-image {
    position: relative;
    background-image: url("../../img/BottomNav/batteryPower.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position-x: center;
    background-position-y: center;
    flex: 2;
  }

  .charge-image {
    position: relative;
    background-image: url("../../img/BottomNav/charge.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position-x: center;
    background-position-y: center;
    flex: 1;
    width: 50%;
    align-self: center;
  }

  .hide {
    visibility: hidden;
  }

  .main {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .container {
    position: relative;
    height: 79%;
    width: 62%;
    margin-top: 22%;
    margin-left: 19%;
  }
</style>
<template>
  <div class="main">
    <div class="charge-image" :class="{ hide: !charging }"></div>
    <div class="battery-image">
      <div class="container">
        <div class="red"></div>
        <div v-if="chargePercent > 0" class="green" :style="{ height: `${chargePercent}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/** A visual representation of the battery amount */
export default defineComponent({
  name: "Battery",
  computed: {
  },
  data() {
    return {
    };
  },
  props: {
    chargePercent: { type: Number, required: true },
    charging: { type: Boolean, required: true }
  }
});
</script>