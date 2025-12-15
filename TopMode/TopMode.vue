<template src="./TopMode.html"></template>
<style src="./TopMode.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import genderM from "@/img/Monitoring/MaleBlack.png";
import genderF from "@/img/Monitoring/FemaleBlack.png";
import neonatal from "@/img/Monitoring/neo-natal.png";
import info from "@/img/TopMode/info-icon.png";
import colours from "../../config/alarmColours.json";
import navButtons from "../../config/navButtons.json";
import { AlarmState, HamiltonT1State, MainModeState, NavigationState, SpinnerSelectionState, store } from "@/store";
import { PatientType } from "@/types/PatientTypes";

export default defineComponent({
  name: "TopMode",
  components: {},
  computed: {
    getCurrentDate(): { currentDate: string; currentTime: string } {
      return HamiltonT1State.getCurrentDateAndTime;
    },
    getGender(): PatientType {
      return MainModeState.currentPatientType === PatientType.Male
        ? PatientType.Male
        : MainModeState.currentPatientType === PatientType.Female
        ? PatientType.Female
        : PatientType.Neonatal;
    },
    getMode(): string {
      return MainModeState.whatModeAreWe;
    },
    bufferedAlarms(): boolean {
      return AlarmState.hasBufferedAlarms;
    },
    activeAlarms(): boolean {
      return AlarmState.hasActiveAlarms;
    },
    messageBackground(): string {
      return colours.medium;
    },
    isModeBtnPressed(): boolean {
      return NavigationState.modeButton;
    },
    isAnyDialOn(): boolean {
      return SpinnerSelectionState.anyActive;
    },
    isAlarmBtnPressed(): boolean {
      return NavigationState.alarmButton;
    },
  },
  data() {
    return {
      male: genderM,
      female: genderF,
      neonatal: neonatal,
      info: info,
      mode: navButtons.mode,
      currentTime: "",
      currentDate: "",
      currentDay: -1,
      interValStop: 0,
      activeAlarmsMessage: [{ title: "", priority: "" }],
      alarmMessageText: "",
      currentAlarmCount: 0,
      alarmCounter: 0,
      alarmBackgroundColor: "",
      currentPriority: "",
      alarmTextColour: "",
      alarm: navButtons.alarm,
    };
  },
  props: {},
  mounted() {
    HamiltonT1State.createDateAndTime();
    setInterval(() => {
      HamiltonT1State.createDateAndTime();
      this.getHomManyAlarms();
    }, 1000);

    setInterval(() => {
      this.alarmCounter++;
      if (this.alarmCounter >= this.currentAlarmCount) {
        this.alarmCounter = 0;
      }
      this.startAlarmsMessages();
    }, 3000);
  },
  methods: {
    showNavigation(typeOfScreen: string, isNavSet: boolean) {
      NavigationState.resetMainNavigationButtons();
      NavigationState.setNavButton({
        value: isNavSet === false,
        buttonType: typeOfScreen,
      });
      if (typeOfScreen === "alarm") {
        AlarmState.setWhichTabToLoad(3);
      }
    },
    getHomManyAlarms() {
      this.currentAlarmCount = AlarmState.getCurrentAlarmTitles().length;
    },
    startAlarmsMessages() {
      this.alarmBackgroundColor = "";
      if (this.currentAlarmCount !== 0) {
        this.activeAlarmsMessage = AlarmState.getCurrentAlarmTitles();
        this.alarmMessageText = this.activeAlarmsMessage[this.alarmCounter].title;
        this.currentPriority = this.activeAlarmsMessage[this.alarmCounter].priority;
        if (this.currentPriority === "High") {
          this.alarmTextColour = "white";
          this.alarmBackgroundColor = "red";
        }

        if (this.currentPriority === "Medium") {
          this.alarmBackgroundColor = "#ecc531";
          this.alarmTextColour = "black";
        }
      }
    },
  },
});
</script>
