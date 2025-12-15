import { audioPlayer } from "isimulate-screen-builder";
import alarmHigh from "../assets/sounds/alarmHigh.wav";
import alarmMedium from "../assets/sounds/alarmMedium.wav";
import alarmLow from "../assets/sounds/alarmLow.wav";
import { defineStore } from "pinia";
import alarmHelp from "../config/alarmBufferHelp.json";
import { AlarmBufferHelp } from "../classes/Alarms/AlarmHelper";
import { DeviceState } from "./index";
const { setInterval } = window;

export type AlarmPriority = "High" | "Medium" | "Low" | "None" | "Technical";
export type AlarmTypeString =
  | "pPeak"
  | "expMinVol"
  | "vte"
  | "fTotal"
  | "spo2"
  | "cpr"
  | "ambientState"
  | "apneaVentEnd"
  | "apneaVent"
  | "apnea"
  | "asvCanMeetTarget"
  | "batCalRequired"
  | "batDefective"
  | "batRepReq"
  | "batTempHigh"
  | "batWrongBat"
  | "batComError"
  | "batLow"
  | "batPowLoss"
  | "batTotalDis"
  | "blowFault"
  | "blowServRequired"
  | "buzzerDef"
  | "checCO2Adapt"
  | "checCo2Samp"
  | "checFlowSenWater"
  | "checFlowSen"
  | "checFlowSenTubing"
  | "checForBlockage"
  | "checPatInt"
  | "checPLimit"
  | "checSettings"
  | "circutCaliNeed"
  | "co2CaliNeed"
  | "co2SensorDef"
  | "co2SensorDisc"
  | "co2SensorTemp"
  | "c02SensorWarm"
  | "deviceTempHigh"
  | "discOnPatSide"
  | "discOnVentSide"
  | "exhalObstruc"
  | "extConnDisabled"
  | "extFlowSensorFail"
  | "fanFail"
  | "flipFlowSen"
  | "flowSenCalibNeed"
  | "funKeyNotOp"
  | "highFlow"
  | "highFreq"
  | "highMinVol"
  | "highOxygen"
  | "highPeep"
  | "highPresDurSigh"
  | "highPres"
  | "inspVolLimit"
  | "invalidComBoard"
  | "irv"
  | "jtagNotWork"
  | "lossExtPow"
  | "lossOfPeep"
  | "loudSpeakDefective"
  | "lowFreq"
  | "lowMinVol"
  | "lowOxygen"
  | "lowPress"
  | "maxLeakComp"
  | "o2SensorCalib"
  | "o2SensorDefective"
  | "o2SensorMissing"
  | "o2SensorNotComp"
  | "obstruction"
  | "optNotFound"
  | "oxygenSupFailed"
  | "perfLimitByHighAlt"
  | "petCo2High"
  | "petCo2Low"
  | "pressLimitHasChanged"
  | "pressLimit"
  | "pressNotReleased"
  | "preventMaintReq"
  | "realTimeClockFail"
  | "realValDef"
  | "repHEPAFilt"
  | "repo2Sensor"
  | "safeMode"
  | "safeVent"
  | "selfTestFail"
  | "speakValOff"
  | "speakValOn"
  | "uckManeuver"
  | "techEvent"
  | "techFault"
  | "techStateFail"
  | "touchNotFun"
  | "unknownPartNumber"
  | "ventOutTempHigh"
  | "ventCancel"
  | "vtHigh"
  | "vtLow"
  | "wrongExpiratory"
  | "progressBarOrange"
  | "progressBarRed";

export enum AlarmType {
  pPeak = 0,
  expMinVol,
  vte,
  fTotal,
  spo2,
  cpr,
  ambientState,
  apneaVentEnd,
  apneaVent,
  apnea,
  asvCanMeetTarget,
  batCalRequired,
  batDefective,
  batRepReq,
  batTempHigh,
  batWrongBat,
  batComError,
  batLow,
  batPowLoss,
  batTotalDis,
  blowFault,
  blowServRequired,
  buzzerDef,
  checCO2Adapt,
  checCo2Samp,
  checFlowSenWater,
  checFlowSen,
  checFlowSenTubing,
  checForBlockage,
  checPatInt,
  checPLimit,
  checSettings,
  circutCaliNeed,
  co2CaliNeed,
  co2SensorDef,
  co2SensorDisc,
  co2SensorTemp,
  c02SensorWarm,
  deviceTempHigh,
  discOnPatSide,
  discOnVentSide,
  exhalObstruc,
  extConnDisabled,
  extFlowSensorFail,
  fanFail,
  flipFlowSen,
  flowSenCalibNeed,
  funKeyNotOp,
  highFlow,
  highFreq,
  highMinVol,
  highOxygen,
  highPeep,
  highPresDurSigh,
  highPres,
  inspVolLimit,
  invalidComBoard,
  irv,
  jtagNotWork,
  lossExtPow,
  lossOfPeep,
  loudSpeakDefective,
  lowFreq,
  lowMinVol,
  lowOxygen,
  lowPress,
  maxLeakComp,
  o2SensorCalib,
  o2SensorDefective,
  o2SensorMissing,
  o2SensorNotComp,
  obstruction,
  optNotFound,
  oxygenSupFailed,
  perfLimitByHighAlt,
  petCo2High,
  petCo2Low,
  pressLimitHasChanged,
  pressLimit,
  pressNotReleased,
  preventMaintReq,
  realTimeClockFail,
  realValDef,
  repHEPAFilt,
  repo2Sensor,
  safeMode,
  safeVent,
  selfTestFail,
  speakValOff,
  speakValOn,
  suckManeuver,
  techEvent,
  techFault,
  techStateFail,
  touchNotFun,
  unknownPartNumber,
  ventOutTempHigh,
  ventCancel,
  vtHigh,
  vtLow,
  wrongExpiratory,
  progressBarOrange,
  progressBarRed,
}

function isDateGreaterStartDate(alarm: { timeStamp: Date }): boolean {
  return alarm.timeStamp.getFullYear() > 1818;
}
let highIntveralStop = -1;
let mediumIntervalStop = -1;

export const useAlarmStore = defineStore("alarms", {
  state: () => ({
    // will be cycled with a timer, null for no active alarm
    currentAlarmTitle: "CPR On" as string | null,
    silenceTimeoutId: -1,
    isSilenced: false,
    silenceTime: 0,
    silenceTimeStartVent: 0,
    continuousTimeoutId: -1,
    audioPlayer: audioPlayer,
    pressureBottomFlag: false,
    whichTabToLoad: 1,
    alarmsBufferFlag: false,
    monitorPeepColor: "",
    monitorVteColor: "",
    monitorFTotalColor: "",
    monitorExpMinVolColor: "",
    highTimeOut: 1,
    highAlarmRunning: false,
    mediumAlarmRunning: false,
    lowAlarmRunning: false,
    startVentTimerInterval: -1,
    startVentTime: 0,
    doWeHaveNewAlarm: false,
    currentAlarmTriggered: "",
    //log the alarm for the events window, will be combined with the other ones
    //log the change of alarm for the events window
    //when cpr mode is on alarms don't trigger
    //the alarm sound beeps don't align with the flashing
    status: {
      [AlarmType.pPeak]: false,
      [AlarmType.expMinVol]: false,
      [AlarmType.vte]: false,
      [AlarmType.fTotal]: false,
      [AlarmType.spo2]: false,
      [AlarmType.cpr]: false,
      [AlarmType.ambientState]: false,
      [AlarmType.apneaVentEnd]: false,
      [AlarmType.apneaVent]: false,
      [AlarmType.apnea]: false,
      [AlarmType.asvCanMeetTarget]: false,
      [AlarmType.batCalRequired]: false,
      [AlarmType.batDefective]: false,
      [AlarmType.batRepReq]: false,
      [AlarmType.batTempHigh]: false,
      [AlarmType.batWrongBat]: false,
      [AlarmType.batComError]: false,
      [AlarmType.batLow]: false,
      [AlarmType.batPowLoss]: false,
      [AlarmType.batTotalDis]: false,
      [AlarmType.blowFault]: false,
      [AlarmType.blowServRequired]: false,
      [AlarmType.buzzerDef]: false,
      [AlarmType.checCO2Adapt]: false,
      [AlarmType.checCo2Samp]: false,
      [AlarmType.checFlowSenWater]: false,
      [AlarmType.checFlowSen]: false,
      [AlarmType.checFlowSenTubing]: false,
      [AlarmType.checForBlockage]: false,
      [AlarmType.checPatInt]: false,
      [AlarmType.checPLimit]: false,
      [AlarmType.checSettings]: false,
      [AlarmType.circutCaliNeed]: false,
      [AlarmType.co2CaliNeed]: false,
      [AlarmType.co2SensorDef]: false,
      [AlarmType.co2SensorDisc]: false,
      [AlarmType.co2SensorTemp]: false,
      [AlarmType.c02SensorWarm]: false,
      [AlarmType.deviceTempHigh]: false,
      [AlarmType.discOnPatSide]: false,
      [AlarmType.discOnVentSide]: false,
      [AlarmType.exhalObstruc]: false,
      [AlarmType.extConnDisabled]: false,
      [AlarmType.extFlowSensorFail]: false,
      [AlarmType.fanFail]: false,
      [AlarmType.flipFlowSen]: false,
      [AlarmType.flowSenCalibNeed]: false,
      [AlarmType.funKeyNotOp]: false,
      [AlarmType.highFlow]: false,
      [AlarmType.highFreq]: false,
      [AlarmType.highMinVol]: false,
      [AlarmType.highOxygen]: false,
      [AlarmType.highPeep]: false,
      [AlarmType.highPresDurSigh]: false,
      [AlarmType.highPres]: false,
      [AlarmType.inspVolLimit]: false,
      [AlarmType.invalidComBoard]: false,
      [AlarmType.irv]: false,
      [AlarmType.jtagNotWork]: false,
      [AlarmType.lossExtPow]: false,
      [AlarmType.lossOfPeep]: false,
      [AlarmType.loudSpeakDefective]: false,
      [AlarmType.lowFreq]: false,
      [AlarmType.lowMinVol]: false,
      [AlarmType.lowOxygen]: false,
      [AlarmType.lowPress]: false,
      [AlarmType.maxLeakComp]: false,
      [AlarmType.o2SensorCalib]: false,
      [AlarmType.o2SensorDefective]: false,
      [AlarmType.o2SensorMissing]: false,
      [AlarmType.o2SensorNotComp]: false,
      [AlarmType.obstruction]: false,
      [AlarmType.optNotFound]: false,
      [AlarmType.oxygenSupFailed]: false,
      [AlarmType.perfLimitByHighAlt]: false,
      [AlarmType.petCo2High]: false,
      [AlarmType.petCo2Low]: false,
      [AlarmType.pressLimitHasChanged]: false,
      [AlarmType.pressLimit]: false,
      [AlarmType.pressNotReleased]: false,
      [AlarmType.preventMaintReq]: false,
      [AlarmType.realTimeClockFail]: false,
      [AlarmType.realValDef]: false,
      [AlarmType.repHEPAFilt]: false,
      [AlarmType.repo2Sensor]: false,
      [AlarmType.safeMode]: false,
      [AlarmType.safeVent]: false,
      [AlarmType.selfTestFail]: false,
      [AlarmType.speakValOff]: false,
      [AlarmType.speakValOn]: false,
      [AlarmType.suckManeuver]: false,
      [AlarmType.techEvent]: false,
      [AlarmType.techFault]: false,
      [AlarmType.techStateFail]: false,
      [AlarmType.touchNotFun]: false,
      [AlarmType.unknownPartNumber]: false,
      [AlarmType.ventOutTempHigh]: false,
      [AlarmType.ventCancel]: false,
      [AlarmType.vtHigh]: false,
      [AlarmType.vtLow]: false,
      [AlarmType.wrongExpiratory]: false,
      [AlarmType.progressBarOrange]: false,
      [AlarmType.progressBarRed]: false,
    } as Record<any, boolean>,
    //TODO and messages that can be translated, need low and high for vitals and the technical alarms
    alarms: [
      { type: "pPeak", priority: "High", timeStamp: new Date("1818-01-01"), title: "Peak Temp" },
      { type: "expMinVol", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Exp Temp" },
      { type: "vte", priority: "High", timeStamp: new Date("1818-01-01"), title: "VTE Temp" },
      { type: "fTotal", priority: "High", timeStamp: new Date("1818-01-01"), title: "FTotal Temp" },
      { type: "spo2", priority: "High", timeStamp: new Date("1818-01-01"), title: "SPO Temp" },
      { type: "cpr", priority: "High", timeStamp: new Date("1818-01-01"), title: "CPR On" },
      { type: "ambientState", priority: "High", timeStamp: new Date("1818-01-01"), title: "Ambient state" },
      { type: "apneaVentEnd", priority: "High", timeStamp: new Date("1818-01-01"), title: "Apnea ventilation ended" },
      { type: "apneaVent", priority: "High", timeStamp: new Date("1818-01-01"), title: "Apnea ventilation" },
      { type: "apnea", priority: "High", timeStamp: new Date("1818-01-01"), title: "Apnea" },
      {
        type: "asvCanMeetTarget",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "ASV: Cannot meet target",
      },
      {
        type: "batCalRequired",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Battery 1, 2: Calibration required",
      },
      { type: "batDefective", priority: "High", timeStamp: new Date("1818-01-01"), title: "Battery 1, 2: Defective" },
      {
        type: "batRepReq",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Battery 1, 2:Replacement required",
      },
      {
        type: "batTempHigh",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Battery 1, 2:Temperature high",
      },
      { type: "batWrongBat", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Battery 1, 2:Wrong battery" },
      {
        type: "batComError",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Battery communication error",
      },
      { type: "batLow", priority: "High", timeStamp: new Date("1818-01-01"), title: "Battery low" },
      { type: "batPowLoss", priority: "High", timeStamp: new Date("1818-01-01"), title: "Battery power loss" },
      { type: "batTotalDis", priority: "High", timeStamp: new Date("1818-01-01"), title: "Battery totally discharged" },
      { type: "blowFault", priority: "High", timeStamp: new Date("1818-01-01"), title: "Blower fault" },
      {
        type: "blowServRequired",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Blower service required",
      },
      { type: "buzzerDef", priority: "High", timeStamp: new Date("1818-01-01"), title: "Buzzer defective" },
      { type: "checCO2Adapt", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Check CO2 airway adapter" },
      { type: "checCo2Samp", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Check CO2 sampling line" },
      {
        type: "checFlowSenWater",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Check flow sensor for water",
      },
      { type: "checFlowSen", priority: "High", timeStamp: new Date("1818-01-01"), title: "Check flow sensor" },
      {
        type: "checFlowSenTubing",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Check flow sensor tubing",
      },
      { type: "checForBlockage", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Check for blockage" },
      { type: "checPatInt", priority: "High", timeStamp: new Date("1818-01-01"), title: "Check patient interface" },
      { type: "checPLimit", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Check Plimit" },
      { type: "checSettings", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Check settings" },
      {
        type: "circutCaliNeed",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Circuit calibration needed",
      },
      { type: "co2CaliNeed", priority: "Low", timeStamp: new Date("1818-01-01"), title: "CO2 calibration needed" },
      { type: "co2SensorDef", priority: "Low", timeStamp: new Date("1818-01-01"), title: "CO2 sensor defect" },
      { type: "co2SensorDisc", priority: "Low", timeStamp: new Date("1818-01-01"), title: "CO2 sensor disconnected" },
      {
        type: "co2SensorTemp",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "CO2 sensor over temperature",
      },
      { type: "c02SensorWarm", priority: "Low", timeStamp: new Date("1818-01-01"), title: "CO2 sensor warmup" },
      { type: "deviceTempHigh", priority: "High", timeStamp: new Date("1818-01-01"), title: "Device temperature high" },
      {
        type: "discOnPatSide",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Disconnection on patient side",
      },
      {
        type: "discOnVentSide",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Disconnection on ventilator side",
      },
      { type: "exhalObstruc", priority: "High", timeStamp: new Date("1818-01-01"), title: "Exhalation obstructed" },
      {
        type: "extConnDisabled",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "External connections disabled",
      },
      {
        type: "extFlowSensorFail",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "External flow sensor failed",
      },
      { type: "fanFail", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Fan Failure" },
      { type: "flipFlowSen", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Flip the flow sensor" },
      {
        type: "flowSenCalibNeed",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "low sensor calibration needed",
      },
      {
        type: "funKeyNotOp",
        priority: "Medium",
        timeStamp: new Date("1818-01-01"),
        title: "Function key not operational",
      },
      { type: "highFlow", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "High Flow" },
      { type: "highFreq", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "High frequency" },
      { type: "highMinVol", priority: "High", timeStamp: new Date("1818-01-01"), title: "High minute volume" },
      { type: "highOxygen", priority: "High", timeStamp: new Date("1818-01-01"), title: "High oxygen" },
      { type: "highPeep", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "High PEEP" },
      {
        type: "highPresDurSigh",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "High pressure during sigh",
      },
      { type: "highPres", priority: "High", timeStamp: new Date("1818-01-01"), title: "High pressure" },
      {
        type: "inspVolLimit",
        priority: "Medium",
        timeStamp: new Date("1818-01-01"),
        title: "Inspiratory volume limitation",
      },
      {
        type: "invalidComBoard",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Ivalid communiation board",
      },
      { type: "irv", priority: "Low", timeStamp: new Date("1818-01-01"), title: "IRV" },
      { type: "jtagNotWork", priority: "Low", timeStamp: new Date("1818-01-01"), title: "JTAG not working" },
      { type: "lossExtPow", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Loss of external power" },
      { type: "lossOfPeep", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Loss of PEEP" },
      {
        type: "loudSpeakDefective",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Loudspeaker defective",
      },
      { type: "lowFreq", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Low frequency" },
      { type: "lowMinVol", priority: "High", timeStamp: new Date("1818-01-01"), title: "Low minute volume" },
      { type: "lowOxygen", priority: "High", timeStamp: new Date("1818-01-01"), title: "Low oxygen" },
      { type: "lowPress", priority: "High", timeStamp: new Date("1818-01-01"), title: "Low pressure" },
      { type: "maxLeakComp", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Maximum leak compensation" },
      {
        type: "o2SensorCalib",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "O2 sensor calibration needed",
      },
      { type: "o2SensorDefective", priority: "Low", timeStamp: new Date("1818-01-01"), title: "O2 sensor defective" },
      { type: "o2SensorMissing", priority: "Low", timeStamp: new Date("1818-01-01"), title: "O2 sensor missing" },
      {
        type: "o2SensorNotComp",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "O2 sensor not system compatible",
      },
      { type: "obstruction", priority: "High", timeStamp: new Date("1818-01-01"), title: "Obstruction" },
      { type: "optNotFound", priority: "High", timeStamp: new Date("1818-01-01"), title: "Options not found" },
      { type: "oxygenSupFailed", priority: "High", timeStamp: new Date("1818-01-01"), title: "Oxygen supply failed" },
      {
        type: "perfLimitByHighAlt",
        priority: "Medium",
        timeStamp: new Date("1818-01-01"),
        title: "Performance limited by high altitude",
      },
      { type: "petCo2High", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "PetCO2 high" },
      { type: "petCo2Low", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "PetCO2 Low" },
      {
        type: "pressLimitHasChanged",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Pressure limit has changed",
      },
      { type: "pressLimit", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Pressure limitation" },
      { type: "pressNotReleased", priority: "High", timeStamp: new Date("1818-01-01"), title: "Pressure not released" },
      {
        type: "preventMaintReq",
        priority: "Low",
        timeStamp: new Date("1818-01-01"),
        title: "Preventive maintenance required",
      },
      {
        type: "realTimeClockFail",
        priority: "Medium",
        timeStamp: new Date("1818-01-01"),
        title: "Real-time clock failure",
      },
      { type: "realValDef", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Release valve defective" },
      { type: "repHEPAFilt", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Replace HEPA filter" },
      { type: "repo2Sensor", priority: "High", timeStamp: new Date("1818-01-01"), title: "Replace O2 sensor" },
      { type: "safeMode", priority: "Technical", timeStamp: new Date("1818-01-01"), title: "Safety mode" },
      { type: "safeVent", priority: "Technical", timeStamp: new Date("1818-01-01"), title: "Safety ventilation" },
      { type: "selfTestFail", priority: "High", timeStamp: new Date("1818-01-01"), title: "Self test failed" },
      { type: "speakValOff", priority: "Low", timeStamp: new Date("1818-01-01"), title: "SpeakValve OFF" },
      { type: "speakValOn", priority: "Low", timeStamp: new Date("1818-01-01"), title: "SpeakValve ON" },
      { type: "suckManeuver", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Suctioning maneuver" },
      { type: "techEvent", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Technical event" },
      { type: "techFault", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Technical fault" },
      { type: "techStateFail", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Technical state failed" },
      { type: "touchNotFun", priority: "Low", timeStamp: new Date("1818-01-01"), title: "Touch not functional" },
      {
        type: "unknownPartNumber",
        priority: "Technical",
        timeStamp: new Date("1818-01-01"),
        title: "Unknown part number",
      },
      {
        type: "ventOutTempHigh",
        priority: "High",
        timeStamp: new Date("1818-01-01"),
        title: "Vent outlet temperature high",
      },
      { type: "ventCancel", priority: "Technical", timeStamp: new Date("1818-01-01"), title: "Ventilation canceled" },
      { type: "vtHigh", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Vt High" },
      { type: "vtLow", priority: "Medium", timeStamp: new Date("1818-01-01"), title: "Vt Low" },
      {
        type: "wrongExpiratory",
        priority: "Medium",
        timeStamp: new Date("1818-01-01"),
        title: "Wrong expiratory valve",
      },
      { type: "progressBarOrange", priority: "High", timeStamp: new Date("1818-01-01"), title: "" },
      { type: "progressBarRed", priority: "High", timeStamp: new Date("1818-01-01"), title: "" },
    ],
    alarmMap: [
      { number: "0", type: "pPeak" },
      { number: "1", type: "expMinVol" },
      { number: "2", type: "vte" },
      { number: "3", type: "fTotal" },
      { number: "4", type: "spo2" },
      { number: "5", type: "cpr" },
      { number: "6", type: "ambientState" },
      { number: "7", type: "apneaVentEnd" },
      { number: "8", type: "apneaVent" },
      { number: "9", type: "apnea" },
      { number: "10", type: "asvCanMeetTarget" },
      { number: "11", type: "batCalRequired" },
      { number: "12", type: "batDefective" },
      { number: "13", type: "batRepReq" },
      { number: "14", type: "batTempHigh" },
      { number: "15", type: "batWrongBat" },
      { number: "16", type: "batComError" },
      { number: "17", type: "batLow" },
      { number: "18", type: "batPowLoss" },
      { number: "19", type: "batTotalDis" },
      { number: "20", type: "blowFault" },
      { number: "21", type: "blowServRequired" },
      { number: "22", type: "buzzerDef" },
      { number: "23", type: "checCO2Adapt" },
      { number: "24", type: "checCo2Samp" },
      { number: "25", type: "checFlowSenWater" },
      { number: "26", type: "checFlowSen" },
      { number: "27", type: "checFlowSenTubing" },
      { number: "28", type: "checForBlockage" },
      { number: "29", type: "checPatInt" },
      { number: "30", type: "checPLimit" },
      { number: "31", type: "checSettings" },
      { number: "32", type: "circutCaliNeed" },
      { number: "33", type: "co2CaliNeed" },
      { number: "34", type: "co2SensorDef" },
      { number: "35", type: "co2SensorDisc" },
      { number: "36", type: "co2SensorTemp" },
      { number: "37", type: "c02SensorWarm" },
      { number: "38", type: "deviceTempHigh" },
      { number: "39", type: "discOnPatSide" },
      { number: "40", type: "discOnVentSide" },
      { number: "41", type: "exhalObstruc" },
      { number: "42", type: "extConnDisabled" },
      { number: "43", type: "extFlowSensorFail" },
      { number: "44", type: "fanFail" },
      { number: "45", type: "flipFlowSen" },
      { number: "46", type: "flowSenCalibNeed" },
      { number: "47", type: "funKeyNotOp" },
      { number: "48", type: "highFlow" },
      { number: "49", type: "highFreq" },
      { number: "50", type: "highMinVol" },
      { number: "51", type: "highOxygen" },
      { number: "52", type: "highPeep" },
      { number: "53", type: "highPresDurSigh" },
      { number: "54", type: "highPres" },
      { number: "55", type: "inspVolLimit" },
      { number: "56", type: "invalidComBoard" },
      { number: "57", type: "irv" },
      { number: "58", type: "jtagNotWork" },
      { number: "59", type: "lossExtPow" },
      { number: "60", type: "lossOfPeep" },
      { number: "61", type: "loudSpeakDefective" },
      { number: "62", type: "lowFreq" },
      { number: "63", type: "lowMinVol" },
      { number: "64", type: "lowOxygen" },
      { number: "65", type: "lowPress" },
      { number: "66", type: "maxLeakComp" },
      { number: "67", type: "o2SensorCalib" },
      { number: "68", type: "o2SensorDefective" },
      { number: "69", type: "o2SensorMissing" },
      { number: "70", type: "o2SensorNotComp" },
      { number: "71", type: "obstruction" },
      { number: "72", type: "optNotFound" },
      { number: "73", type: "oxygenSupFailed" },
      { number: "74", type: "perfLimitByHighAlt" },
      { number: "75", type: "petCo2High" },
      { number: "76", type: "petCo2Low" },
      { number: "77", type: "pressLimitHasChanged" },
      { number: "78", type: "pressLimit" },
      { number: "79", type: "pressNotReleased" },
      { number: "80", type: "preventMaintReq" },
      { number: "81", type: "realTimeClockFail" },
      { number: "82", type: "realValDef" },
      { number: "83", type: "repHEPAFilt" },
      { number: "84", type: "repo2Sensor" },
      { number: "85", type: "safeMode" },
      { number: "86", type: "safeVent" },
      { number: "87", type: "selfTestFail" },
      { number: "88", type: "speakValOff" },
      { number: "89", type: "speakValOn" },
      { number: "90", type: "suckManeuver" },
      { number: "91", type: "techEvent" },
      { number: "92", type: "techFault" },
      { number: "93", type: "techStateFail" },
      { number: "94", type: "touchNotFun" },
      { number: "95", type: "unknownPartNumber" },
      { number: "96", type: "ventOutTempHigh" },
      { number: "97", type: "ventCancel" },
      { number: "98", type: "vtHigh" },
      { number: "99", type: "vtLow" },
      { number: "100", type: "wrongExpiratory" },
      { number: "101", type: "progressBarOrange" },
      { number: "102", type: "progressBarRed" },
    ],
  }),
  getters: {
    hasBufferedAlarms(): boolean {
      return this.alarmsBufferFlag;
    },
    getNewAlarmFlagTriggered(): boolean {
      return this.doWeHaveNewAlarm;
    },
    hasActiveAlarms(): boolean {
      return Object.values(this.status).some((value) => value);
    },
    getColourForPriority() {
      return (priority: AlarmPriority) => {
        switch (priority) {
          case "High":
            return "#D04A40";
          case "Medium":
            return "#F6E75D";
          case "Low":
            return "#F6E75D";
          case "Technical":
            return "#F6E75D";
          case "None":
            return "#dfdfdf";
          default:
            throw "Priority not supported: " + priority;
        }
      };
    },
    getAlarmMapType() {
      return (type: AlarmType): string => {
        return this.alarmMap.find((ele) => ele.number === type.toString())?.type!;
      };
    },
    getCurrentAlarmTitles() {
      return (): Array<{ title: string; priority: string }> => {
        //get all alarms status objects that are active
        const returnObject: [{ title: string; priority: string }] = [{ title: "", priority: "" }];
        const key = this.keysOfAlarms(true);

        returnObject.splice(0);

        //now get the actual alarm
        key.forEach((ele) => {
          const tempValue: { title: string; priority: string } = { title: "", priority: "" };
          const typeAl = this.findTypeOfAlarm(ele)!;
          const alarm = this.alarmOfType(typeAl);
          if (isDateGreaterStartDate(alarm!)) {
            tempValue.title = alarm!.title;
            tempValue.priority = alarm!.priority;
            returnObject.push(tempValue);
          }
        });

        return returnObject;
      };
    },
    getAlarmType() {
      return (): string => {
        const returnObject: [{ priority: string }] = [{ priority: "" }];
        const keys = this.keysOfAlarms(true);
        returnObject.splice(0);
        //now get the actual alarm
        keys.forEach((ele) => {
          const tempValue: { priority: string } = {
            priority: "",
          };
          const typeAl = this.findTypeOfAlarm(ele);
          const alarm = this.alarmOfType(typeAl!);
          if (isDateGreaterStartDate(alarm!)) {
            tempValue.priority = alarm!.priority;
            returnObject.push(tempValue);
          }
        });

        if (returnObject.some((ele) => ele.priority === "High")) {
          return "High";
        }

        if (returnObject.some((ele) => ele.priority === "Medium")) {
          return "Medium";
        }

        if (returnObject.some((ele) => ele.priority === "Low")) {
          return "Low";
        }
        return "None";
      };
    },
    getAlarms() {
      return (
        isActive: boolean,
        howMany: number
      ): Array<{ type: string; priority: string; timeStamp: Date; active: boolean; title: string }> => {
        //get all alarms status objects that are active
        const returnObject: [{ type: string; priority: string; timeStamp: Date; active: boolean; title: string }] = [
          { type: "", priority: "", timeStamp: new Date(), active: false, title: "" },
        ];
        const key = this.keysOfAlarms(isActive);

        returnObject.splice(0);
        //now get the actual alarm
        key.forEach((ele) => {
          const tempValue: { type: string; priority: string; timeStamp: Date; active: boolean; title: string } = {
            type: "",
            priority: "",
            timeStamp: new Date(),
            active: false,
            title: "",
          };
          const typeAl = this.findTypeOfAlarm(ele);
          const alarm = this.alarmOfType(typeAl!);
          if (isDateGreaterStartDate(alarm!)) {
            tempValue.type = this.alarms.find((ele) => ele.type === typeAl)!.type;
            tempValue.priority = this.alarms.find((ele) => ele.type === typeAl)!.priority;
            tempValue.timeStamp = this.alarms.find((ele) => ele.type === typeAl)!.timeStamp;
            tempValue.active = isActive;
            tempValue.title = this.alarms.find((ele) => ele.type === typeAl)!.title;
            returnObject.push(tempValue);
          }
        });

        returnObject.sort((x, y) => +new Date(y.timeStamp) - +new Date(x.timeStamp));
        //are we processing active alarms
        if (isActive) {
          //yes we can only return 5 active alarms
          if (returnObject.length > 5) {
            //we have more than 5 active alarms we have to remove the over supply
            returnObject.splice(4, 5 - returnObject.length);
          }
        }

        //are we processing inActive alarms
        if (!isActive) {
          //we have more than 5 active alarms we have to remove the over supply
          returnObject.splice(howMany, returnObject.length - howMany);
        }
        return returnObject;
      };
    },
    getAlarmHelp() {
      return (alarmType: string): AlarmBufferHelp => {
        let alHelpCls = new AlarmBufferHelp();
        alHelpCls = alarmHelp.find((ele: { type: string }) => ele.type === alarmType)!;
        return alHelpCls;
      };
    },
    getBottomPressureDialFlag(): boolean {
      return this.pressureBottomFlag;
    },
    currentPressureColor(): string {
      return this.monitorPeepColor;
    },
    currentExpMinVolColor(): string {
      return this.monitorExpMinVolColor;
    },
    currentVteColor(): string {
      return this.monitorVteColor;
    },
    currentFTotalColor(): string {
      return this.monitorFTotalColor;
    },
    getCurrentActiveAlarmColour() {
      return (type: string): string => {
        let result = "";
        if (type === "pressure") {
          result = this.getMainAlarmErrorsPressure;
          this.monitorPeepColor = result;
        } else if (type === "expMinVol") {
          result = this.getMainAlarmErrorExpMinVol;
          this.monitorExpMinVolColor = result;
        } else if (type === "vte") {
          result = this.getMainAlarmErrorVT;
          this.monitorVteColor = result;
        } else if (type === "fTotal") {
          result = this.getMainAlarmErrorFTotal;
          this.monitorFTotalColor = result;
        }
        return result;
      };
    },
    getMainAlarmErrorsPressure(): string {
      let result = "";
      let priority: AlarmPriority;
      const pressLimit =
        this.status[AlarmType.pressLimit] &&
        this.alarms.some(
          (ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.pressLimit)
        );

      const pressHigh =
        this.status[AlarmType.highPres] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.highPres));

      const pressLow =
        this.status[AlarmType.lowPress] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.lowPress));

      if (pressHigh || pressLow) {
        priority = this.alarms.find((ele) => ele.type === this.getAlarmMapType(AlarmType.highPres))
          ?.priority as AlarmPriority;
        result = this.getColourForPriority(priority);
      } else {
        if (pressLimit) {
          priority = this.alarms.find((ele) => ele.type === this.getAlarmMapType(AlarmType.pressLimit))
            ?.priority as AlarmPriority;
          result = this.getColourForPriority(priority);
        }
      }

      return result;
    },
    getMainAlarmErrorVT(): string {
      let result = "";
      let priority: AlarmPriority;
      const vtLow =
        this.status[AlarmType.vtLow] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.vtLow));

      const vtHigh =
        this.status[AlarmType.vtHigh] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.vtHigh));

      if (vtLow || vtHigh) {
        priority = this.alarms.find((ele) => ele.type === this.getAlarmMapType(AlarmType.vtLow))
          ?.priority as AlarmPriority;
        result = this.getColourForPriority(priority);
      }

      return result;
    },
    getMainAlarmErrorExpMinVol(): string {
      let result = "";
      let priority: AlarmPriority;
      const lowMin =
        this.status[AlarmType.lowMinVol] &&
        this.alarms.some(
          (ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.lowMinVol)
        );

      const highMin =
        this.status[AlarmType.highMinVol] &&
        this.alarms.some(
          (ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.highMinVol)
        );

      if (lowMin || highMin) {
        priority = this.alarms.find((ele) => ele.type === this.getAlarmMapType(AlarmType.highMinVol))
          ?.priority as AlarmPriority;
        result = this.getColourForPriority(priority);
      }

      return result;
    },
    getMainAlarmErrorFTotal(): string {
      let result = "";
      let priority: AlarmPriority;
      const lowFreq =
        this.status[AlarmType.lowFreq] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.lowFreq));

      const highFreq =
        this.status[AlarmType.highFreq] &&
        this.alarms.some((ele) => isDateGreaterStartDate(ele) && ele.type === this.getAlarmMapType(AlarmType.highFreq));

      if (lowFreq || highFreq) {
        priority = this.alarms.find((ele) => ele.type === this.getAlarmMapType(AlarmType.highFreq))
          ?.priority as AlarmPriority;
        result = this.getColourForPriority(priority);
      }

      return result;
    },
    getWhichTabToLoad(): number {
      return this.whichTabToLoad;
    },
    findTypeOfAlarm() {
      return (key: string): string | undefined => {
        return this.alarmMap.find((ele1) => ele1.number === key)?.type;
      };
    },
    alarmOfType() {
      return (type: string) => {
        return this.alarms.find((ele) => ele.type === type);
      };
    },
    keysOfAlarms() {
      return (active: boolean) => {
        return (Object.keys(this.status) as Array<AlarmTypeString>).filter((key) => this.status[key] === active);
      };
    },
    anyInactiveAlarmsWithValidDate(): boolean {
      const keysInactiveAlarms = this.keysOfAlarms(false);
      return keysInactiveAlarms.some((key) => {
        const typeAl = this.findTypeOfAlarm(key);
        return typeAl === undefined ? false : isDateGreaterStartDate(this.alarmOfType(typeAl)!);
      });
    },
  },
  actions: {
    setAlarmBufferFlag(value: boolean) {
      this.alarmsBufferFlag = value;
    },
    resetAllAlarms() {
      const key = Object.keys(this.status) as Array<AlarmTypeString>;
      key.forEach((ele) => {
        const typeAl = this.findTypeOfAlarm(ele);
        this.alarms.find((ele) => ele.type === typeAl)!.timeStamp = new Date("1818-01-01");
      });
    },
    setStatus(type: AlarmType, enabled: boolean) {
      this.status[type] = enabled;
    },
    setBottomPressureDialFlag(value: boolean) {
      this.pressureBottomFlag = value;
    },
    setIsNewAlarmCreated(value: boolean) {
      this.doWeHaveNewAlarm = value;
    },
    silenceAlarms(silenceTimeout: number = 120) {
      this.isSilenced = true;
      this.continuousTimeoutId = -1;
      if (silenceTimeout !== 0) {
        this.silenceTime = silenceTimeout;
        const id = window.setInterval(() => {
          if (this.silenceTime < 1 || this.doWeHaveNewAlarm) {
            this.unsilenceAlarms();
          }
          this.silenceTime = this.silenceTime - 1;
        }, 1000);

        this.silenceTimeoutId = id;
      }
      this.updateAlarmingState("None", "stop");
    },
    unsilenceAlarms() {
      this.isSilenced = false;
      if (this.silenceTimeoutId !== -1) {
        window.clearInterval(this.silenceTimeoutId);
        this.silenceTimeoutId = -1;
        const anyAlarms = this.hasActiveAlarms;
        if (!anyAlarms) {
          this.updateAlarmingState("None", "stop");
        } else {
          this.playAlarmNoiseViaPriority();
        }
      }
    },
    playAlarmNoiseViaPriority() {
      let highPri = "";
      let mediumPri = "";
      let lowPri = "";
      const keys = this.keysOfAlarms(true);

      for (const item of keys) {
        const typeAl = this.alarmMap.find((ele) => ele.number === item);
        highPri = this.alarms.find((ele) => ele.type === typeAl?.type && ele.priority === "High")?.priority!;
        if (highPri === "High") {
          this.updateAlarmingState("High" as AlarmPriority, "start");
          return;
        }
      }

      if (highPri === "" || highPri === undefined) {
        //need to look for medium
        for (const item of keys) {
          const typeAl = this.alarmMap.find((ele) => ele.number === item);
          mediumPri = this.alarms.find((ele) => ele.type === typeAl?.type && ele.priority === "Medium")?.priority!;
          if (mediumPri === "Medium") {
            this.updateAlarmingState("Medium" as AlarmPriority, "start");
            return;
          }
        }
      }

      if (mediumPri === "" || mediumPri === undefined) {
        //need to look for low
        for (const item of keys) {
          const typeAl = this.alarmMap.find((ele) => ele.number === item);
          lowPri = this.alarms.find((ele) => ele.type === typeAl?.type && ele.priority === "Low")?.priority!;
          if (lowPri === "Low") {
            this.updateAlarmingState("Low" as AlarmPriority, "start");
            return;
          }
        }
      }
    },
    triggerAlarmBuffer(type: AlarmType) {
      this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.timeStamp = new Date();
    },
    triggerAlarm(type: AlarmType) {
      this.setStatus(type, true);
      this.triggerAlarmBuffer(type);
      //ignore loading alarms
      if (type === AlarmType.progressBarOrange || type === AlarmType.progressBarRed) {
        return;
      }
      const passedInAlarm = this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.title;
      if (this.currentAlarmTriggered === "") {
        this.currentAlarmTriggered = this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.title;
        this.doWeHaveNewAlarm = true;
      } else {
        if (passedInAlarm !== this.currentAlarmTriggered) {
          this.currentAlarmTriggered = this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.title;
          this.doWeHaveNewAlarm = true;
        } else {
          this.doWeHaveNewAlarm = false;
        }
      }
      if (this.silenceTimeoutId === -1) {
        this.playAlarmNoiseViaPriority();
      }
    },
    stopAlarm(type: AlarmType) {
      this.setStatus(type, false);
      this.continuousTimeoutId = -1;
      const passedInAlarm = this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.title;
      if (passedInAlarm === this.currentAlarmTriggered) {
        this.currentAlarmTriggered = "";
      }
      const anyAlarms = this.hasActiveAlarms;
      if (!anyAlarms || this.isSilenced) {
        this.updateAlarmingState("None", "stop");
      } else {
        this.playAlarmNoiseViaPriority();
      }
    },
    stopAllAlarms() {
      Object.entries(this.status).forEach(([key, value]) => {
        if (value === true) {
          this.status[key] = false;
        }
      });

      this.continuousTimeoutId = -1;
      this.updateAlarmingState("None", "stop");
    },
    resetAlarm(type: AlarmType) {
      this.alarms.find((ele) => ele.type === AlarmType[type].toString())!.timeStamp = new Date("1818-01-01");
    },
    updateAlarmingState(priority: AlarmPriority, startStop: string) {
      const repeatHigh = () => {
        const idTimeOut = setInterval(() => {
          if (DeviceState.playAlarms) {
            audioPlayer.play(alarmHigh);
          }
        }, 6000);
        highIntveralStop = idTimeOut;
      };

      const repeatMedium = () => {
        const idTimeOutMed = setInterval(() => {
          if (DeviceState.playAlarms) {
            audioPlayer.play(alarmMedium);
          }
        }, 4000);
        mediumIntervalStop = idTimeOutMed;
      };

      if (priority === "High" && startStop === "start") {
        if (!this.highAlarmRunning) {
          this.highAlarmRunning = true;
          clearInterval(mediumIntervalStop);
          repeatHigh();
          this.mediumAlarmRunning = false;
          this.lowAlarmRunning = false;
        }
      } else if (priority === "Medium" && startStop === "start") {
        if (!this.mediumAlarmRunning) {
          this.mediumAlarmRunning = true;
          repeatMedium();
          clearInterval(highIntveralStop);
          this.highAlarmRunning = false;
          this.lowAlarmRunning = false;
        }
      } else if (priority === "Low" && startStop === "start") {
        if (!this.lowAlarmRunning) {
          this.lowAlarmRunning = true;
          audioPlayer.play(alarmLow);
          clearInterval(highIntveralStop);
          clearInterval(mediumIntervalStop);
          this.highAlarmRunning = false;
          this.mediumAlarmRunning = false;
        }
      } else if (priority === "None" || startStop === "stop") {
        clearInterval(highIntveralStop);
        clearInterval(mediumIntervalStop);
        this.highAlarmRunning = false;
        this.mediumAlarmRunning = false;
        this.lowAlarmRunning = false;
      }
    },
    setWhichTabToLoad(tabValue: number) {
      this.whichTabToLoad = tabValue;
    },
  },
});
