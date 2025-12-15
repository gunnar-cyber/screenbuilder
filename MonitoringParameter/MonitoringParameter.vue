<template>
<!-- TODO colour of the value changes if alarming, only do the main ones -->
  <div class="flex flex-row w-full w-1/2">
      <div class="w-1/4 text-right text-2xl flex justify-end items-center flex-initial" :style="{color: color}">
        {{ value || "---" }}
      </div>
      <div class="w-3/4 text-sm text-left ml-1 flex-initial">
        {{ title }} <br />
        {{ unit }}
      </div>
  </div>
</template>

<style scoped>

</style>

<script lang="ts">
export default {
  name: 'MonitoringParameter',
  props: {
    value: String,
    title: String,
    unit: String,
    color: String
  }
}
</script>