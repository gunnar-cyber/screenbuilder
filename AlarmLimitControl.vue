flex box

<template src="./AlarmLimitControl.html"></template>
<style src="./AlarmLimitControl.css" scoped></style>

<script lang="ts">
import { defineComponent } from "vue";
import AlarmDial from "../AlarmDial/AlarmDial.vue";
import { AlarmState, PatientState, SpinnerResultState } from "@/store";
import { DialID } from "../../store/SpinnerSelection";
import dialAlarm from "../../config/alarmLimits.json";
import { PatientAgeCategory } from "@screenbuilder/components";
import AlarmLimitGraph from "@/components/AlarmLimitControl/AlarmLimitGraph.vue";
import { AlarmType } from "@/store/Alarms";

/**
 * This component does the following
 * (a) Passes dial type to the "alarm dial" component
 * (b) Handles all the processes and mechanics for the bar graph that each dial shows
 */
export default defineComponent({
  name: "AlarmLimitControl",
  components: {
    AlarmDial,
    AlarmLimitGraph,
  },
  computed: {
    currentPatientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
    bottomEndCurrentCount(): number {
      return SpinnerResultState.currentAlarmCount(this.keyDialTypeBottom, this.currentMode, this.currentPatientType);
    },
    topEndCurrentCount(): number {
      return SpinnerResultState.currentAlarmCount(this.keyDialTypeTop, this.currentMode, this.currentPatientType);
    },
    showOrHideBuffer(): Boolean {
      return (
        this.keyDialTypeTop === "pressureCMH2OHigh" &&
        !(
          this.currentPatientType === PatientAgeCategory.Neonate &&
          (this.currentMode === "ncpap" || this.currentMode === "ncpappc")
        )
      );
    },
    showOrHideBottomRectangle(): Boolean {
      return this.keyDialTypeTop === "apneaHigh";
    },
    hasActiveAlarms(): boolean {
      return AlarmState.hasActiveAlarms;
    },
    /* TODO could pass these into AlarmDial
    isOnBottomDial(): boolean {
      return this.spinnerSelectionStore.isControlActive(this.keyDialTypeBottom as DialID);
    },
    isOnTopDial(): boolean {
      return this.spinnerSelectionStore.isControlActive(this.keyDialTypeTop as DialID);
    },*/
  },
  data() {
    return {
      dialJsonObjectTop: {
        alarmTitle: "",
        type: "",
        adultPed: [{ mode: "", min: 0, max: 0, default: 0 }],
        neo: [{ mode: "", min: 0, max: 0, default: 0 }],
        dialText: "",
        intDec: "",
        priority: "Low",
      },
      dialJsonObjectBottom: {
        alarmTitle: "",
        type: "",
        adultPed: [{ mode: "", min: 0, max: 0, default: 0 }],
        neo: [{ mode: "", min: 0, max: 0, default: 0 }],
        dialText: "",
        intDec: "",
        priority: "Low",
      },
      dialMaxTop: 0,
      dialMinBottom: 0,
      dialMaxBottom: 0,
      colorForTopPriority: "",
      colorForBottomPriority: "",
    };
  },
  props: {
    keyDialTypeTop: {
      type: String,
      required: true,
    },
    keyDialTypeBottom: {
      type: String,
      required: true,
    },
    currentMode: {
      type: String,
      required: true,
    },
    monitoredValue: {
      type: Number,
      required: false,
    },
  },
  watch: {
    topEndCurrentCount(value) {
      this.setBarGraphPriorityTop(value);
    },
    bottomEndCurrentCount(value) {
      this.setBarGraphPriorityBottom(value);
    },
  },
  created() {
    this.setDialTypesJsonObjects();
    this.setMaxAndMins();
    AlarmState.setIsNewAlarmCreated(false);
    this.setBarGraphPriorityTop(this.topEndCurrentCount);
    this.setBarGraphPriorityBottom(this.bottomEndCurrentCount);
  },
  methods: {
    setDialTypesJsonObjects() {
      // function is used to set the overarching json object so that it can used in the code
      let ele = dialAlarm.find((ele) => ele.alarmTitle === (this.keyDialTypeTop as DialID));
      if (ele !== undefined) {
        this.dialJsonObjectTop.alarmTitle = ele.alarmTitle;
        this.dialJsonObjectTop.adultPed = ele.adultPed!;
        this.dialJsonObjectTop.neo = ele.neo!;
        this.dialJsonObjectTop.dialText = ele.dialText;
        this.dialJsonObjectTop.intDec = ele.intDec;
        this.dialJsonObjectTop.priority = ele.priority;
      }

      ele = dialAlarm.find((ele) => ele.alarmTitle === (this.keyDialTypeBottom as DialID));
      if (ele !== undefined) {
        this.dialJsonObjectBottom.alarmTitle = ele.alarmTitle;
        this.dialJsonObjectBottom.adultPed = ele.adultPed!;
        this.dialJsonObjectBottom.neo = ele.neo!;
        this.dialJsonObjectBottom.dialText = ele.dialText;
        this.dialJsonObjectBottom.intDec = ele.intDec;
        this.dialJsonObjectBottom.priority = ele.priority;
      }
    },
    setMaxAndMins() {
      // the core aim of the below is to set the min and max counters which are used in the computed functions
      let modeObjectTop: { mode: string; min: number; max: number; default: number }[];
      let modeObjectBottom: { mode: string; min: number; max: number; default: number }[];
      if (
        this.currentPatientType === PatientAgeCategory.Adult ||
        this.currentPatientType === PatientAgeCategory.Paediatric
      ) {
        modeObjectTop = this.dialJsonObjectTop.adultPed;
        modeObjectBottom = this.dialJsonObjectBottom.adultPed;
      } else {
        modeObjectTop = this.dialJsonObjectTop.neo;
        modeObjectBottom = this.dialJsonObjectBottom.neo;
      }

      let getModeMinAndMaxTop = modeObjectTop.find((ele) => ele.mode === this.currentMode);
      if (getModeMinAndMaxTop === undefined) {
        //the current mode is not found use the default.
        getModeMinAndMaxTop = modeObjectTop.find((ele: { mode: string }) => ele.mode === "default");
      }

      let getModeMinAndMaxBottom = modeObjectBottom.find((ele) => ele.mode === this.currentMode);
      if (getModeMinAndMaxBottom === undefined) {
        //the current mode is not found use the default.
        getModeMinAndMaxBottom = modeObjectBottom.find((ele: { mode: string }) => ele.mode === "default");
      }

      this.dialMaxTop = getModeMinAndMaxTop?.max!;
      if (this.keyDialTypeTop === "apneaHigh") {
        this.dialMinBottom = getModeMinAndMaxTop?.min!;
      } else {
        this.dialMinBottom = getModeMinAndMaxBottom?.min!;
      }

      this.dialMaxBottom = getModeMinAndMaxBottom?.max!;
    },
    setBarGraphPriorityTop(topValue: number) {
      if (this.monitoredValue === null) {
        this.colorForTopPriority = AlarmState.getColourForPriority("None");
        return "";
      }
      if (this.keyDialTypeTop === "pressureCMH2OHigh") {
        AlarmState.stopAlarm(AlarmType.highPres);
        AlarmState.stopAlarm(AlarmType.pressLimit);

        if (topValue <= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.highPres);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForTopPriority = AlarmState.getColourForPriority("High");
        } else if (topValue <= this.monitoredValue! + 2) {
          AlarmState.triggerAlarm(AlarmType.pressLimit);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForTopPriority = AlarmState.getColourForPriority("Medium");
        }
      }

      if (this.keyDialTypeTop === "vtHigh") {
        AlarmState.stopAlarm(AlarmType.vtHigh);

        if (topValue <= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.vtHigh);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForTopPriority = AlarmState.getColourForPriority("Medium");
        }
      }
      if (this.keyDialTypeTop === "expMinVolumeHigh") {
        AlarmState.stopAlarm(AlarmType.highMinVol);

        if (topValue <= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.highMinVol);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForTopPriority = AlarmState.getColourForPriority("High");
        }
      }

      if (this.keyDialTypeTop === "fTotalHigh") {
        AlarmState.stopAlarm(AlarmType.highFreq);

        if (topValue <= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.highFreq);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForTopPriority = AlarmState.getColourForPriority("Medium");
        }
      }

      if (this.keyDialTypeTop === "oxygenHigh") {
        this.colorForTopPriority = AlarmState.getColourForPriority("None");
      }
    },
    setBarGraphPriorityBottom(bottomValue: number) {
      if (this.monitoredValue === null) {
        this.colorForBottomPriority = AlarmState.getColourForPriority("None");
        return;
      }
      if (this.keyDialTypeBottom === "pressureCMH2OLow") {
        AlarmState.stopAlarm(AlarmType.lowPress);

        if (bottomValue >= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.lowPress);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForBottomPriority = AlarmState.getColourForPriority("High");
        }
      }

      if (this.keyDialTypeBottom === "vtLow") {
        AlarmState.stopAlarm(AlarmType.vtLow);

        if (bottomValue >= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.vtLow);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForBottomPriority = AlarmState.getColourForPriority("Medium");
        }
      }

      if (this.keyDialTypeBottom === "expMinVolumeLow") {
        AlarmState.stopAlarm(AlarmType.lowMinVol);

        if (bottomValue >= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.lowMinVol);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForBottomPriority = AlarmState.getColourForPriority("High");
        }
      }

      if (this.keyDialTypeBottom === "fTotalLow") {
        AlarmState.stopAlarm(AlarmType.lowFreq);

        if (bottomValue >= this.monitoredValue!) {
          AlarmState.triggerAlarm(AlarmType.lowFreq);
          AlarmState.setAlarmBufferFlag(true);
          this.colorForBottomPriority = AlarmState.getColourForPriority("Medium");
        }
      }
      if (this.keyDialTypeBottom === "oxygenLow") {
        this.colorForBottomPriority = AlarmState.getColourForPriority("None");
      }
    },
  },
});
</script>
