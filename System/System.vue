<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./System.css" scoped></style>
<template src="./System.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import { CommonFunc } from "../../classes/CommonFunc";
import Dial from "../../components/Dial/Dial.vue";
import { MainModeState, SpinnerSelectionState } from "@/store";

export default defineComponent({
  name: "System",
  components: {
    Dial,
  },
  computed: {
    startVentEnabled(): boolean {
      return MainModeState.isStartVentButtonClicked;
    },
    adultOrNeoDialType() {
      return MainModeState.dialType;
    },
  },
  data() {
    return {
      activetab: 2,
      activetabDateAndTime: 1,
      dayAndNightDialActive: 1,
      activeButtonDayOrNight: 1,
      whichDayOrNightActive: 1,
      whichInnerMenu: 1,
      currentTime: "",
      currentDate: "",
      dialTypeDayBright: "",
      dialTypeNightBright: "",
      dialTypeYearSystem: "",
      dialTypeMonthSystem: "",
      dialTypeDaySystem: "",
      dialTypeHourSystem: "",
      dialTypeMinuteSystem: "",
      screenTypeSystem: "system",
      keysYearSystem: "yearsystem",
      keysMonthSystem: "monthsystem",
      keysDaySystem: "daysystem",
      keysHourSystem: "hoursystem",
      keysMinuteSystem: "minutesystem",
      keysDayBright: "daybright",
      keysNightBright: "nightbright",
    };
  },
  created() {
    this.adultOrNeoDialType.forEach((ele) => {
      if (ele.dialType === this.keysYearSystem) {
        this.dialTypeYearSystem = ele.dialType;
      }
      if (ele.dialType === this.keysMonthSystem) {
        this.dialTypeMonthSystem = ele.dialType;
      }
      if (ele.dialType === this.keysDaySystem) {
        this.dialTypeDaySystem = ele.dialType;
      }
      if (ele.dialType === this.keysHourSystem) {
        this.dialTypeHourSystem = ele.dialType;
      }
      if (ele.dialType === this.keysMinuteSystem) {
        this.dialTypeMinuteSystem = ele.dialType;
      }
      if (ele.dialType === this.keysDayBright) {
        this.dialTypeDayBright = ele.dialType;
      }
      if (ele.dialType === this.keysNightBright) {
        this.dialTypeNightBright = ele.dialType;
      }
    });
  },
  mounted() {
    this.updateOveralDateAndTime();
  },
  methods: {
    changeNightOrDay(type: string) {
      if (SpinnerSelectionState.anyActive) {
        SpinnerSelectionState.deactivateAndSelect();
      }

      // TODO set selected

      if (type === "day") {
        this.whichDayOrNightActive = 1;
        this.activeButtonDayOrNight = 1;
      } else {
        this.whichDayOrNightActive = 2;
        this.activeButtonDayOrNight = 2;
      }
      this.dayAndNightDialActive = 1;
    },
    showDateAndNightOrDateAndTime() {
      if (SpinnerSelectionState.anyActive) {
        SpinnerSelectionState.deactivateAndSelect();
      }

      // TODO set selected

      this.activetabDateAndTime = this.activetabDateAndTime === 1 ? 2 : 1;
      if (this.activetabDateAndTime === 1) {
        this.whichInnerMenu = 1;
      } else {
        this.whichInnerMenu = 2;
      }
    },
    updateOveralDateAndTime() {
      let commonFuncCls = new CommonFunc();
      this.currentTime = commonFuncCls.getTime();
      this.currentDate = commonFuncCls.getDate();
    },
  },
});
</script>
