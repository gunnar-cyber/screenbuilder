<template src="./AlarmModal.html"></template>
<style src="./AlarmModal.css" scoped></style>
<script lang="ts">
import { defineComponent } from "vue";
import { AlarmBufferHelp } from "@/classes/Alarms/AlarmHelper";
import { AlarmState } from "@/store";
export default defineComponent({
  name: "AlarmsModal",
  components: {},
  data() {
    return {
      alHelpCls: new AlarmBufferHelp(),
      alarmHelpNotes: [""],
    };
  },
  props: {
    alarmType: {
      type: String,
      required: true,
    },
  },
  created() {
    this.alHelpCls = AlarmState.getAlarmHelp(this.alarmType);
    if (this.alHelpCls.HelpMessages.indexOf("#")) {
      this.alarmHelpNotes = this.alHelpCls.HelpMessages.split("#");
    } else {
      this.alarmHelpNotes[0] = this.alHelpCls.HelpMessages;
    }
  },
});
</script>
