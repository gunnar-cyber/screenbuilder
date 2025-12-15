<template>
  <div class="dynamicLungPanelContainer flex flex-col justify-between">
    <div class="flex flex-row flex-grow p-2 justify-between">
      <div class="text-left flex-shrink-0">{{ typeOfGender }}<br />{{ height }} cm<br />IBW: 80kg</div>

      <DynamicLung />

      <div class="text-right flex flex-col justify-between">
        <div class="mt-28">
          <div>PVI</div>
          <div class="text-2xl font-medium leading-none">8</div>
          <div>%</div>
        </div>
      </div>
    </div>

    <div class="flex flex-row m-2 justify-between text-right">
      <div class="w-1/5">
        <div>Rinsp</div>
        <div class="text-2xl font-medium leading-none">20</div>
        <div>cmH20/l/s</div>
      </div>
      <div class="w-1/5">
        <div>Cstat</div>
        <div class="text-2xl font-medium leading-none">169</div>
        <div>ml/cmH20</div>
      </div>
      <div class="w-1/5 hidden">
        <div>PetC02</div>
        <div class="text-2xl font-medium leading-none">{{ etco2 }}</div>
        <div>mmHg</div>
      </div>
      <div class="w-1/5 hidden">
        <div>Sp02</div>
        <div class="text-2xl font-medium leading-none">{{ spo2 }}</div>
        <div>%</div>
      </div>
      <div class="w-1/5">
        <div>Pulse</div>
        <div class="text-2xl font-medium leading-none">{{ hr }}</div>
        <div>1/min</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DynamicLung from "./DynamicLung.vue";
import { PatientType } from "@/types/PatientTypes";
import { MainModeState, PatientState, SpinnerResultState } from "@/store";

export default defineComponent({
  name: "DynamicLungPanel",
  components: { DynamicLung },
  data() {
    return {};
  },
  computed: {
    typeOfGender(): string {
      return MainModeState.currentPatientType == PatientType.Male
        ? "Male"
        : MainModeState.currentPatientType == PatientType.Female
        ? "Female"
        : "Neonatal";
    },
    height(): number {
      return SpinnerResultState.currentCount("height");
    },
    hr(): string {
      return PatientState.parameters.hr.toFixed(0);
    },
    spo2(): string {
      return PatientState.parameters.spo2.toFixed(0);
    },
    etco2(): string {
      return PatientState.parameters.etco2.toFixed(0);
    },
  },
});
</script>

<style scoped>
.dynamicLungPanelContainer {
  color: white;
  background: #174b67;
  font-weight: 200;
  font-size: 0.93em;
}
</style>
