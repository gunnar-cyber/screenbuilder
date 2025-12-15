import {
  ControlParameterID,
  ParameterID,
  VentMode,
  PacketController,
  PatientAgeCategory,
  VentilatorSettings,
  ventFlowTriggerOff,
} from "@screenbuilder/components";
import { MainModeState, VentilatorState, PatientState } from "./index";
import { HamiltonIERatioOptionStrings } from "@/classes/HamiltonIERatio";
import dialAlarmLimits from "@/config/alarmLimits.json";
import { DialJsonObject } from "@/classes/AlarmDials/Utilities/CommonDialClasses";
import dialTypesAdult from "@/config/dialType.json";
import dialTypesNeo from "@/config/dialTypeNeonatal.json";
import modeTypes from "../config/modeTypes.json";
let packetController: PacketController | null = null;

function round2Decimal(x: number): number {
  // probably don't need the toFixed but leaving just in case
  return Number((Math.round(x * 100) / 100).toFixed(2));
}

function round1Decimal(x: number): string {
  // probably don't need the toFixed but leaving just in case
  return (Math.round(x * 100) / 100).toFixed(1);
}

function ventilatorIdForDialType(dialType: string): ControlParameterID | "" {
  const mapping: { [dialType: string]: ControlParameterID } = {
    vt: ParameterID.VT,
    peep: ParameterID.PEEP,
    rate: ParameterID.RATE,
    ti: ParameterID.RATIOIE, // this will get converted based on rate-
    oxygen: ParameterID.FIO2,
    pramp: ParameterID.RISETIME,
    ratio: ParameterID.RATIOIE,
    ie: ParameterID.RATIOIE,
    pControl: ParameterID.DELTAP,
    flowTrigger: ParameterID.FLOWTRIGGER,
    hiFlowO2: ParameterID.HIFLOW,
    pSupport: ParameterID.PSUPPORT,
    pLimit: ParameterID.PLIMIT,
    /*
    ets: ParameterID.ETS,
    minvol: ParameterID.MINVOL,
    timax: ParameterID.TIMAX,*/
  };
  return mapping[dialType] ?? "";
}

function dialTypeForVentilatorId(ventilatorId: ControlParameterID): DialType | "" {
  const mapping: { [id: string]: DialType } = {
    [ParameterID.VT]: DialType.Vt,
    [ParameterID.PEEP]: DialType.Peep,
    [ParameterID.RATE]: DialType.Rate,
    [ParameterID.FIO2]: DialType.Oxygen,
    [ParameterID.RISETIME]: DialType.Pramp,
    [ParameterID.DELTAP]: DialType.Pcontrol,
    [ParameterID.RATIOIE]: DialType.Ie,
    [ParameterID.PSUPPORT]: DialType.Psupport,
    [ParameterID.FLOWTRIGGER]: DialType.FlowTrigger,
    [ParameterID.HIFLOW]: DialType.HiFlowO2,
    [ParameterID.PLIMIT]: DialType.Plimit,
    /*
    ets: ParameterID.ETS,
    minvol: ParameterID.MINVOL,
    timax: ParameterID.TIMAX,*/
  };
  return mapping[ventilatorId] ?? "";
}

function checkIfNumberDecOrInt(value: number) {
  if (!Number.isInteger(value)) {
    value = Number(parseFloat(value.toString()).toFixed(1));
  }
  return value;
}
function checkIfNumberDecOrIntNeo(value: number) {
  let result = "";
  if (!Number.isInteger(value)) {
    let firstChr = value.toString().substring(0, 1);
    let splitValue = value.toString().split(".");
    let decPart = splitValue[1];
    if (decPart.length == 3) {
      decPart = decPart.substring(0, decPart.length - 1);
    }
    if (decPart.length > 3) {
      decPart = decPart.substring(0, 2);
    }
    result = firstChr + "." + decPart;
  }
  return result;
}
import { defineStore } from "pinia";
import { DialType } from "./SpinnerSelection";
import { HamiltonModeType, hamiltonModeTypeToVentType } from "@/classes/HamiltonModeType";
import { findIncrementForwards } from "@/classes/SpinnerActions";
import { IERatio } from "isimulate-screen-builder";
import { checkForRateNumber, checkForTINumber, checkForVTNumber } from "@/helpers/defaultDials";
import { PatientType } from "@/types/PatientTypes";
import { getOrangeDotMaxValueForPramp } from "@/helpers/orangeDot";

export interface Dial {
  dialTitle: DialType;
  count: number;
}

export const useSpinnerResultsStore = defineStore("spinnerResults", {
  state: () => ({
    currentAlarmMin: 0,
    // don't forget to add to ventilatorControls for initSettings if adding new ones
    lastPatientData: {
      lastPatientMode: HamiltonModeType.SCMV_PLUS,
      lastPatientDial: [
        {
          dialTitle: "oxygen",
          count: 50,
        },
        {
          dialTitle: "peep",
          count: 5,
        },
        {
          dialTitle: "pSupport",
          count: 15,
        },
        {
          dialTitle: "pControl",
          count: 15,
        },
        {
          dialTitle: "daybright",
          count: 10,
        },
        {
          dialTitle: "nightbright",
          count: 10,
        },
        {
          dialTitle: "yearsystem",
          count: 2000,
        },
        {
          dialTitle: "monthsystem",
          count: 1,
        },
        {
          dialTitle: "daysystem",
          count: 1,
        },
        {
          dialTitle: "hoursystem",
          count: 0,
        },
        {
          dialTitle: "minutesystem",
          count: 0,
        },
        {
          dialTitle: "height",
          count: 174,
        },
        {
          dialTitle: "weight",
          count: 2.0,
        },
        {
          dialTitle: "rate",
          count: 12,
        },
        {
          dialTitle: "ti",
          count: 1.0,
        },
        {
          dialTitle: "vt",
          count: 560,
        },
        {
          dialTitle: "flowTrigger",
          count: 5.0,
        },
        {
          dialTitle: "hiFlowO2",
          count: 15,
        },
        {
          dialTitle: "pramp",
          count: 70,
        },
        {
          dialTitle: "pLimit",
          count: 30,
        },
        {
          dialTitle: "ie",
          count: 5,
        },
        {
          dialTitle: "ets",
          count: 25,
        },
        {
          dialTitle: "pinsp",
          count: 15,
        },
        {
          dialTitle: "minvol",
          count: 100,
        },
        {
          dialTitle: "timax",
          count: 1.5,
        },
      ] as Array<Dial>,
      lastPatType: PatientType.Male,
      LastPatIBW: 70,
    },
    dialToUse: [] as Array<Dial>,
    dialToUseForNewMode: [] as Array<Dial>,
    dialsAdult: [
      {
        dialTitle: "oxygen",
        count: 50,
      },
      {
        dialTitle: "peep",
        count: 5,
      },
      {
        dialTitle: "pSupport",
        count: 15,
      },
      {
        dialTitle: "pControl",
        count: 15,
      },
      {
        dialTitle: "daybright",
        count: 10,
      },
      {
        dialTitle: "nightbright",
        count: 10,
      },
      {
        dialTitle: "yearsystem",
        count: 2000,
      },
      {
        dialTitle: "monthsystem",
        count: 1,
      },
      {
        dialTitle: "daysystem",
        count: 1,
      },
      {
        dialTitle: "hoursystem",
        count: 0,
      },
      {
        dialTitle: "minutesystem",
        count: 0,
      },
      {
        dialTitle: "height",
        count: 174,
      },
      {
        dialTitle: "weight",
        count: 2.0,
      },
      {
        dialTitle: "rate",
        count: 12,
      },
      {
        dialTitle: "ti",
        count: 1.0,
      },
      {
        dialTitle: "vt",
        count: 560,
      },
      {
        dialTitle: "flowTrigger",
        count: 5.0,
      },
      {
        dialTitle: "hiFlowO2",
        count: 15,
      },
      {
        dialTitle: "pramp",
        count: 70,
      },
      {
        dialTitle: "pLimit",
        count: 30,
      },
      {
        dialTitle: "ie",
        count: 5,
      },
      {
        dialTitle: "ets",
        count: 25,
      },
      {
        dialTitle: "pinsp",
        count: 15,
      },
      {
        dialTitle: "minvol",
        count: 100,
      },
      {
        dialTitle: "timax",
        count: 1.5,
      },
    ] as Array<Dial>,
    dialsAdultForNewMode: [
      {
        dialTitle: "oxygen",
        count: 50,
      },
      {
        dialTitle: "peep",
        count: 5,
      },
      {
        dialTitle: "pSupport",
        count: 15,
      },
      {
        dialTitle: "pControl",
        count: 15,
      },
      {
        dialTitle: "daybright",
        count: 10,
      },
      {
        dialTitle: "nightbright",
        count: 10,
      },
      {
        dialTitle: "yearsystem",
        count: 2000,
      },
      {
        dialTitle: "monthsystem",
        count: 1,
      },
      {
        dialTitle: "daysystem",
        count: 1,
      },
      {
        dialTitle: "hoursystem",
        count: 0,
      },
      {
        dialTitle: "minutesystem",
        count: 0,
      },
      {
        dialTitle: "height",
        count: 174,
      },
      {
        dialTitle: "weight",
        count: 2.0,
      },
      {
        dialTitle: "rate",
        count: 12,
      },
      {
        dialTitle: "ti",
        count: 1.0,
      },
      {
        dialTitle: "vt",
        count: 560,
      },
      {
        dialTitle: "flowTrigger",
        count: 5.0,
      },
      {
        dialTitle: "hiFlowO2",
        count: 15,
      },
      {
        dialTitle: "pramp",
        count: 70,
      },
      {
        dialTitle: "pLimit",
        count: 30,
      },
      {
        dialTitle: "ie",
        count: 5,
      },
      {
        dialTitle: "ets",
        count: 25,
      },
      {
        dialTitle: "pinsp",
        count: 15,
      },
      {
        dialTitle: "minvol",
        count: 100,
      },
      {
        dialTitle: "timax",
        count: 1.5,
      },
    ] as Array<Dial>,
    dialsNeo: [
      {
        dialTitle: "oxygen",
        count: 40,
      },
      {
        dialTitle: "peep",
        count: 5.0,
      },
      {
        dialTitle: "pSupport",
        count: 15.0,
      },
      {
        dialTitle: "pControl",
        count: 15.0,
      },
      {
        dialTitle: "daybright",
        count: 10,
      },
      {
        dialTitle: "nightbright",
        count: 10,
      },
      {
        dialTitle: "yearsystem",
        count: 2000,
      },
      {
        dialTitle: "monthsystem",
        count: 1,
      },
      {
        dialTitle: "daysystem",
        count: 1,
      },
      {
        dialTitle: "hoursystem",
        count: 0,
      },
      {
        dialTitle: "minutesystem",
        count: 0,
      },
      {
        dialTitle: "height",
        count: 0,
      },
      {
        dialTitle: "weight",
        count: 2.0,
      },
      {
        dialTitle: "rate",
        count: 45,
      },
      {
        dialTitle: "ti",
        count: 0.33,
      },
      {
        dialTitle: "vt",
        count: 10,
      },
      {
        dialTitle: "flowTrigger",
        count: 0.5,
      },
      {
        dialTitle: "hiFlowO2",
        count: 2,
      },
      {
        dialTitle: "pramp",
        count: 50,
      },
      {
        dialTitle: "pLimit",
        count: 30,
      },
      {
        dialTitle: "ie",
        count: 14,
      },
      {
        dialTitle: "ets",
        count: 25,
      },
      {
        dialTitle: "pinsp",
        count: 15.0,
      },
      {
        dialTitle: "minvol",
        count: 100,
      },
      {
        dialTitle: "timax",
        count: 1.0,
      },
    ] as Array<Dial>,
    dialsNeoForNewMode: [
      {
        dialTitle: "oxygen",
        count: 40,
      },
      {
        dialTitle: "peep",
        count: 5.0,
      },
      {
        dialTitle: "pSupport",
        count: 15.0,
      },
      {
        dialTitle: "pControl",
        count: 15.0,
      },
      {
        dialTitle: "daybright",
        count: 10,
      },
      {
        dialTitle: "nightbright",
        count: 10,
      },
      {
        dialTitle: "yearsystem",
        count: 2000,
      },
      {
        dialTitle: "monthsystem",
        count: 1,
      },
      {
        dialTitle: "daysystem",
        count: 1,
      },
      {
        dialTitle: "hoursystem",
        count: 0,
      },
      {
        dialTitle: "minutesystem",
        count: 0,
      },
      {
        dialTitle: "height",
        count: 174,
      },
      {
        dialTitle: "weight",
        count: 2.0,
      },
      {
        dialTitle: "rate",
        count: 45,
      },
      {
        dialTitle: "ti",
        count: 0.33,
      },
      {
        dialTitle: "vt",
        count: 10,
      },
      {
        dialTitle: "flowTrigger",
        count: 0.5,
      },
      {
        dialTitle: "hiFlowO2",
        count: 2,
      },
      {
        dialTitle: "pramp",
        count: 50,
      },
      {
        dialTitle: "pLimit",
        count: 30,
      },
      {
        dialTitle: "ie",
        count: 14,
      },
      {
        dialTitle: "ets",
        count: 25,
      },
      {
        dialTitle: "pinsp",
        count: 15.0,
      },
      {
        dialTitle: "minvol",
        count: 100,
      },
      {
        dialTitle: "timax",
        count: 1.0,
      },
    ] as Array<Dial>,
    alarmDials: [
      {
        dialTitle: "pressureCMH2OHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "pressureCMH2OLow",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "expMinVolumeHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "expMinVolumeLow",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "fTotalHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "fTotalLow",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "vtHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "vtLow",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "apneaHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "oxygenHigh",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "oxygenLow",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "petCO2High",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "petCO2Low",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "pressureLimitation",
        count: -1,
        min: 0,
        max: 1,
      },
      {
        dialTitle: "ets",
        count: 0,
        min: 5,
        max: 1,
      },
      {
        dialTitle: "pinsp",
        count: 0,
        min: 3,
        max: 60,
      },
      {
        dialTitle: "minvol",
        count: 100,
      },
      {
        dialTitle: "timax",
        count: 1.5,
      },
    ],
    ventilatorControls: [
      "oxygen",
      "peep",
      "pSupport",
      "pControl",
      "rate",
      "ti",
      "flowTrigger",
      "hiFlowO2",
      "ie",
      "pramp",
      "vt",
      "ets",
      "pinsp",
      "ti",
      "minvol",
      "pLimit",
      "timax",
    ],
    dialJsonToUse: {
      dialType: "",
      min: 0,
      max: 0,
      dialText: "",
      intDec: "",
      range_and_increments: [{ start: 0, end: 0, increment: 0 }],
      modesAndRanges: [],
      dialLabel: "0",
    },
    selectedModeType: null as HamiltonModeType | null,
  }),
  getters: {
    whichJsonFileToUseAdultOrNeo() {
      return (): typeof dialJsonToUse => {
        const dialJsonToUse = PatientState.ageType === PatientAgeCategory.Adult ? dialTypesAdult : dialTypesNeo;
        return dialJsonToUse;
      };
    },
    getCurrentAlarmMin(): number {
      return this.currentAlarmMin;
    },
    currentCountForNewMode() {
      return (dialType: string): number => {
        const dial = this.dialToUseForNewMode.find((dial) => dial.dialTitle === dialType);
        if (dial === undefined) {
          return 0;
        }
        return dial.count;
      };
    },
    currentCount() {
      return (dialType: string): number => {
        const dial = this.dialToUse.find((ele) => ele.dialTitle === dialType);
        const dialJsonToUse = this.whichJsonFileToUseAdultOrNeo();
        const dialInfo = dialJsonToUse.find((item) => item.dialType === dialType);
        if (dial === undefined) {
          return dialInfo ? dialInfo.min : 0;
        }

        if (dialType == DialType.FlowTrigger) {
          return round2Decimal(dial.count); // TODO if count is always set as 2 decimal then shouldn't need this
        } else {
          const isOutOfRange = dialInfo && (dial.count < dialInfo.min || dial.count > dialInfo.max);
          return isOutOfRange ? dialInfo.min : dial.count;
        }
      };
    },
    currentAlarmCount() {
      // function is used to get the current count
      return (dialType: string, mode: string, patientType: PatientAgeCategory): number => {
        let dial = this.alarmDials.find((ele) => ele.dialTitle === dialType);
        if (dial === undefined) {
          return 0;
        }

        const dialAlarmLimit = (dialAlarmLimits as Array<DialJsonObject>).find((ele) => ele.alarmTitle === dialType);

        if (dialAlarmLimit === undefined) {
          return 0;
        }

        if (dial.count === -1) {
          let modeObject: { mode: string; min: number; max: number; default: number }[];
          let getModeMinAndMax = null;
          const defaultDep = dialAlarmLimit.setDefaultByDep;
          const dialDefDep = dialAlarmLimit.dialDefaultDependency;
          if (patientType === PatientAgeCategory.Adult || patientType === PatientAgeCategory.Paediatric) {
            modeObject = dialAlarmLimit?.adultPed!;
          } else {
            modeObject = dialAlarmLimit?.neo!;
          }
          getModeMinAndMax = modeObject.find((ele) => ele.mode === mode);
          if (getModeMinAndMax === undefined) {
            //the current mode is not found use the default.
            getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
          }

          if (defaultDep) {
            dial.count = this.setAlarmDefault(dialType, dialDefDep, patientType, mode);
          } else {
            dial.count = getModeMinAndMax?.default!;
          }
        }

        return dial.count;
      };
    },
    setAlarmDefault() {
      return (
        dialType: string,
        dependency: { dep: string }[],
        patientType: PatientAgeCategory,
        mode: string
      ): number => {
        // TODO move this logic into it's own class

        let result = "";
        if (dialType === "pressureCMH2OLow") {
          result = "5";
        }

        if (dialType === "pressureCMH2OHigh") {
          if (
            (patientType === PatientAgeCategory.Neonate || patientType === PatientAgeCategory.Adult) &&
            mode !== modeTypes.ncpap &&
            mode !== modeTypes.ncpappc
          ) {
            result = (this.currentCount(dependency[0].dep) + 10).toString();
          }
          if (patientType === PatientAgeCategory.Neonate && (mode === "ncpap" || mode === "ncpappc")) {
            result = "15";
          }
        }

        if (dialType === "expMinVolumeHigh" || dialType === "expMinVolumeLow") {
          result = this.getExpMinVolDefault(dialType).toString();
        }

        if (dialType === "vtHigh" || dialType === "vtLow") {
          result = this.getVTDefault(dialType).toString();
        }
        return Number(result);
      };
    },
    getExpMinVolDefault() {
      return (dialType: string): string => {
        let returnValue = "";
        let IBWOrWeight =
          PatientState.ageType === PatientAgeCategory.Adult
            ? MainModeState.getIBW
            : this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "weight")?.count!;
        let resultRate = checkForRateNumber(PatientState.ageType === PatientAgeCategory.Adult, IBWOrWeight);
        let resultVt = this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "vt")?.count!;
        let roundDownValue = 0;
        let result =
          dialType === "expMinVolumeHigh"
            ? 1.5 * (resultRate / 100) * (resultVt / 10)
            : 0.6 * (resultRate / 100) * (resultVt / 10);
        let incrementRanges: { start: number; end: number; increment: number }[] =
          PatientState.ageType === PatientAgeCategory.Adult
            ? [
                { start: 0, end: 1, increment: 0.1 },
                { start: 1, end: 10, increment: 0.5 },
                { start: 10, end: 70, increment: 1 },
              ]
            : [
                { start: 0, end: 1, increment: 0.01 },
                { start: 1, end: 10, increment: 0.1 },
              ];
        incrementRanges.forEach((ele) => {
          if (result >= ele.start && result <= ele.end) {
            roundDownValue = ele.increment;
          }
        });
        let valueToCompare = "0";
        let decimalValue = "";
        decimalValue = (result % 1).toFixed(3);
        if (roundDownValue === 0.01) {
          valueToCompare = "0.005";
        }
        if (roundDownValue === 0.1) {
          valueToCompare = "0.05";
        }
        if (roundDownValue === 0.5) {
          valueToCompare = "0.25";
        }
        if (roundDownValue === 1) {
          valueToCompare = "0.5";
        }
        if (dialType == "expMinVolumeHigh") {
          if (parseFloat(decimalValue) >= parseFloat(valueToCompare)) {
            returnValue = (Math.ceil(result / roundDownValue) * roundDownValue).toFixed(2);
          } else {
            returnValue = (Math.ceil(result / roundDownValue) * roundDownValue - roundDownValue).toFixed(2);
          }
        }
        if (dialType == "expMinVolumeLow") {
          returnValue = (Math.ceil(result / roundDownValue) * roundDownValue - roundDownValue).toFixed(2);
        }
        return returnValue;
      };
    },
    getVTDefault() {
      return (dialType: string): number => {
        let result = this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "vt")?.count!;
        let roundDownValue = 0;
        let incrementRanges: { start: number; end: number; increment: number }[] =
          PatientState.ageType === PatientAgeCategory.Adult
            ? [
                { start: 0, end: 100, increment: 5 },
                { start: 100, end: 500, increment: 10 },
                { start: 500, end: 3000, increment: 50 },
              ]
            : PatientState.ageType === PatientAgeCategory.Neonate && dialType === "vtHigh"
            ? [
                { start: 0, end: 10, increment: 0.1 },
                { start: 10, end: 100, increment: 1 },
                { start: 100, end: 300, increment: 5 },
              ]
            : [
                { start: 0, end: 10, increment: 0.1 },
                { start: 10, end: 100, increment: 2 },
                { start: 100, end: 300, increment: 6 },
              ];
        let multiplier = dialType === "vtHigh" ? 1.5 : 0.5;
        incrementRanges.forEach((ele) => {
          if (result * multiplier >= ele.start && result * multiplier <= ele.end) {
            roundDownValue = ele.increment;
          }
        });

        result = Math.ceil((result * multiplier) / roundDownValue) * roundDownValue;
        return checkIfNumberDecOrInt(result);
      };
    },
    handleVTViaIBWorWeight() {
      return (patType: boolean): number => {
        let result = 0;
        let dial = patType ? this.dialsAdult : this.dialsNeo;
        let jsonToUse = this.whichJsonFileToUseAdultOrNeo();
        let weightOrIDB = patType
          ? MainModeState.getIBW
          : this.dialToUse.find((ele) => ele.dialTitle == "weight")?.count!;

        dial.find((ele) => {
          if (ele.dialTitle === DialType.Vt) {
            ele.count = checkForVTNumber(
              patType,
              weightOrIDB,
              jsonToUse.find((ele) => ele.dialType === DialType.Vt)?.range_and_increments!!
            );
            result = ele.count;
          }
        });

        return result;
      };
    },
  },
  actions: {
    doPrampCheck(screenType: string) {
      let dial: Dial;
      let correctMode: HamiltonModeType;
      if (screenType === "modes") {
        dial = this.dialToUseForNewMode.find((ele) => ele.dialTitle === DialType.Pramp)!;
        correctMode = MainModeState.selectedModeInModesScreen;
      } else {
        dial = this.dialToUse.find((ele) => ele.dialTitle === DialType.Pramp)!;
        correctMode = MainModeState.whatModeAreWe;
      }
      let maxOrangeDotValueForPramp = getOrangeDotMaxValueForPramp(correctMode, screenType);
      if (maxOrangeDotValueForPramp < dial.count) dial.count = maxOrangeDotValueForPramp;
    },
    processTIDialIBWOrWeight() {
      let result = 0;
      if (PatientState.ageType === PatientAgeCategory.Adult) {
        result = checkForTINumber(true, MainModeState.getIBW);
      } else {
        result = checkForTINumber(false, this.dialToUse.find((ele) => ele.dialTitle == "weight")?.count!);
      }
      return result;
    },
    processRateDialIBWOrWeight() {
      let result = 0;
      if (PatientState.ageType === PatientAgeCategory.Adult) {
        result = checkForRateNumber(true, MainModeState.getIBW);
      } else {
        result = checkForRateNumber(false, this.dialToUse.find((ele) => ele.dialTitle == "weight")?.count!);
      }
      return result;
    },
    processVTDialIBWOrWeight() {
      let result = 0;
      result = this.handleVTViaIBWorWeight(PatientState.ageType === PatientAgeCategory.Adult);
      return result;
    },
    resetAlarmDial() {
      this.alarmDials.forEach((ele) => {
        ele.count = -1;
      });

      this.dialsAdult.find((ele) => {
        if (ele.dialTitle == "pLimit") {
          ele.count = 30;
        }
      });
      this.dialsNeo.find((ele) => {
        if (ele.dialTitle == "pLimit") {
          ele.count = 30;
        }
      });

      this.dialsAdult.find((ele) => {
        if (ele.dialTitle == "peep") {
          ele.count = 5;
        }
      });

      this.dialsNeo.find((ele) => {
        if (ele.dialTitle == "peep") {
          ele.count = 5.0;
        }
      });
    },
    /** replace dials with lastPatientDials */
    whichDialToUseViaLastPatient() {
      this.dialToUse = this.lastPatientData.lastPatientDial.map((ele) => {
        return { dialTitle: ele.dialTitle, count: ele.count };
      });
    },
    /** Sets the state of the new mode dials from the active dials */
    whichDialToUse() {
      if (PatientState.ageType === PatientAgeCategory.Adult) {
        this.dialToUse = this.dialsAdult.map((ele) => {
          return { dialTitle: ele.dialTitle, count: ele.count };
        });

        this.dialToUseForNewMode = this.dialsAdult.map((ele) => {
          return { dialTitle: ele.dialTitle, count: ele.count };
        });
      } else {
        this.dialToUse = this.dialsNeo.map((ele) => {
          return { dialTitle: ele.dialTitle, count: ele.count };
        });

        this.dialToUseForNewMode = this.dialsNeo.map((ele) => {
          return { dialTitle: ele.dialTitle, count: ele.count };
        });
      }

      // Update Counts

      this.setCount({
        value: this.processVTDialIBWOrWeight(),
        dialType: DialType.Vt,
        alarmOrDial: "dial",
      });
      this.setCount({
        value: this.processRateDialIBWOrWeight(),
        dialType: DialType.Rate,
        alarmOrDial: "dial",
      });
      this.setCount({
        value: this.processTIDialIBWOrWeight(),
        dialType: DialType.Ti,
        alarmOrDial: "dial",
      });
    },
    setNewModeDefaults(modeType: string) {
      this.dialToUseForNewMode = this.dialToUse.map((ele) => {
        if (ele.dialTitle === "rate") {
          return { dialTitle: ele.dialTitle, count: this.checkRateMinValue(modeType, ele.count) };
        }
        return { dialTitle: ele.dialTitle, count: ele.count };
      });
    },
    checkRateMinValue(modeType: string, currentCount: number): number {
      let result = 0;
      switch (modeType) {
        case HamiltonModeType.PSIMV_PLUS:
          result = currentCount < 5 ? 5 : currentCount;
          break;
        case HamiltonModeType.SIMV_PLUS:
        case HamiltonModeType.NIV_ST:
        case HamiltonModeType.NIV:
        case HamiltonModeType.HiFlowO2:
          result = currentCount;
          break;
        case HamiltonModeType.SPONT:
        case HamiltonModeType.PCV_PLUS:
        case HamiltonModeType.SCMV_PLUS:
          result = currentCount < 4 ? 4 : currentCount;
          break;
      }
      return result;
    },
    moveNewModeDataIntoCurrentDial() {
      this.dialToUse = this.dialToUseForNewMode.map((ele) => {
        return { dialTitle: ele.dialTitle, count: ele.count };
      });
    },
    /**
    if we are in PSIMV_PLUS mode and psync is enabled or NIVST mode, and the active dial is Pinsp,
    we need to update the pSupport dial to the same value as the Pinsp dial in dialToUseForNewMode.
    dialToUseForNewMode is initialy set when the confirm is not called yet.
     * @param active the active dial
     */
    updateDialNewModeWhenPSyncEnabled(active: DialType) {
      if (
        ((this.selectedModeType === HamiltonModeType.PSIMV_PLUS && MainModeState.psyncEnabled) ||
          this.selectedModeType === HamiltonModeType.NIV_ST) &&
        active === DialType.Pinsp
      ) {
        const value = this.dialToUseForNewMode.find((ele) => ele.dialTitle === active)?.count ?? 0;
        const pSupportDial = this.dialToUseForNewMode.find((ele) => ele.dialTitle === "pSupport");
        if (pSupportDial) {
          pSupportDial.count = value;
        }
      }
    },
    /**
      if we are in SIMV_P mode and psync is enabled or NIVST mode,
      we need to update the pinsp, pSupport, and pControl dials to the same value as the pinsp dial.
      dialToUse is the current dials, dialToUseForNewMode is the dials for the new mode.
      dialToUse changes when confirm is called.
      @param value the value to update the dials to
      @param settings the ventilator settings
      @param from the function that called this function
    */
    updateDialWhenPSyncEnabled(value: number, mode: VentMode, from: string) {
      const currentMode = mode ?? VentilatorState.settings.mode;
      this.dialToUseForNewMode.forEach((newModeDial) => {
        this.dialToUse.forEach(
          (ele: { dialTitle: string; count: number; pinsp?: number; pSupport?: number; pControl?: number }) => {
            if (ele.dialTitle === newModeDial.dialTitle) {
              ele.count = newModeDial.count;
            }
            // if we are in SIMV_P mode and psync is enabled, we need to update the pinsp, pSupport, and pControl dials to the same value
            if ((currentMode === VentMode.SIMV_P && MainModeState.psyncEnabled) || currentMode === VentMode.NIVST_P) {
              if (ele.dialTitle === "pSupport" || ele.dialTitle === "pControl" || ele.dialTitle === "pinsp") {
                ele.count = value;
              }
            }
          }
        );
      });
    },
    /** Updates the active dials with the new mode dial values and updates the ventilator settings */
    confirmNewMode(modeType: HamiltonModeType) {
      this.moveNewModeDataIntoCurrentDial();
      const ventMode = hamiltonModeTypeToVentType(modeType);
      if (ventMode !== undefined) {
        this.updateSettingsWithMode(ventMode, this.dialToUse);
      }
    },
    setNewModeCount({ value, dialType, currentMode }: { value: number; dialType: string; currentMode: string }) {
      this.dialToUseForNewMode.find((ele) => ele.dialTitle === dialType)!.count = value;
      if ((dialType === "pControl" || dialType === "pinsp") && currentMode === "PSIMV+") {
        this.dialToUseForNewMode.find((ele) => ele.dialTitle === "pinsp")!.count = value;
        //normally pControl and pinsp should be set the same values but. pControl min = 5, pinsp min = 3.
        //so if we are setting pinsp to its lowest value of 3, pControl cannot go to 3 only 5 and so we
        //need to check for that and set pControl to it's lowest number
        let minToCompare = this.whichJsonFileToUseAdultOrNeo().find((ele) => ele.dialType === "pControl")!.min;
        if (value === minToCompare) {
          this.dialToUseForNewMode.find((ele) => ele.dialTitle === "pControl")!.count = minToCompare;
        } else {
          this.dialToUseForNewMode.find((ele) => ele.dialTitle === "pControl")!.count = value;
        }
      }
    },
    /** Sets the state for a dial
     * @param isSecondaryUpdate prevents infinite recursion when doing the update, used internally
     */
    setCount({
      value,
      dialType,
      alarmOrDial,
      isSecondaryUpdate = false,
    }: {
      value: number;
      dialType: string;
      alarmOrDial: string;
      isSecondaryUpdate?: boolean;
    }) {
      const target: { dialTitle: string; count: number }[] = alarmOrDial === "alarm" ? this.alarmDials : this.dialToUse;
      target.forEach((ele: { dialTitle: string; count: number }) => {
        if (ele.dialTitle === dialType) {
          ele.count = value;
        }
      });

      if (isSecondaryUpdate) return;

      if (dialType === DialType.PressureCMH2OHigh) {
        this.setCount({ dialType: DialType.Plimit, alarmOrDial: "dial", value: value - 10, isSecondaryUpdate: true });
        // update facilitator
        this.handleVentilatorSettingsStatePacket({
          ...VentilatorState.settings,
          [ParameterID.PLIMIT]: value - 10,
        });
      } else if (dialType === DialType.Plimit) {
        this.setCount({
          dialType: DialType.PressureCMH2OHigh,
          alarmOrDial: "alarm",
          value: value + 10,
          isSecondaryUpdate: true,
        });
      }
    },
    /** Updates the dials when ventilator settings change via control */
    updateCountsWithVentilatorSettings(settings: VentilatorSettings, oldSettings: VentilatorSettings) {
      const unmappedTypes: Array<keyof VentilatorSettings> = [];
      (Object.keys(settings) as Array<keyof VentilatorSettings>).forEach((key) => {
        const value = settings[key] as any;
        const dialType = dialTypeForVentilatorId(key as ControlParameterID);
        if (dialType !== "") {
          if (dialType === DialType.Ie) {
            if (
              settings.mode !== VentMode.SIMV_P &&
              settings.mode !== VentMode.NIVST_P &&
              settings.mode !== VentMode.SIMV_PRVC
            ) {
              const option = HamiltonIERatioOptionStrings.indexOf(value as string);
              this.setCount({ value: option !== -1 ? option : 5, dialType: dialType, alarmOrDial: "dial" });
            }
          } else if (dialType === DialType.Plimit) {
            this.setCount({ value: value as number, dialType: dialType, alarmOrDial: "dial" });
            this.setCount({
              dialType: DialType.PressureCMH2OHigh,
              alarmOrDial: "alarm",
              value: value + 10,
              isSecondaryUpdate: true,
            });
          } else {
            if (dialType === DialType.FlowTrigger && settings.flowTrigger === ventFlowTriggerOff) {
              const dialJsonToUse = this.whichJsonFileToUseAdultOrNeo();

              const dialInfo = dialJsonToUse.find((item) => item.dialType === DialType.FlowTrigger);
              if (dialInfo === undefined) {
                return null;
              }

              // SpinnerActions knows how to handle this case
              const increment = findIncrementForwards(
                dialInfo.intDec,
                dialInfo.range_and_increments!,
                dialInfo.dialType as DialType,
                dialInfo.max
              );

              this.setCount({ value: dialInfo.max + increment, dialType: dialType, alarmOrDial: "dial" });
            } else {
              this.setCount({ value: value as number, dialType: dialType, alarmOrDial: "dial" });
            }
          }
        } else {
          unmappedTypes.push(key);
        }
      });

      const isPsupportChanged = settings.pSupport !== oldSettings.pSupport;
      const isDeltaPChanged = settings.deltaP !== oldSettings.deltaP;
      const isPsyncEnabled = MainModeState.psyncEnabled;

      if (
        isDeltaPChanged &&
        ((isPsyncEnabled && settings.mode === VentMode.SIMV_P) || settings.mode === VentMode.NIVST_P)
      ) {
        // if deltaP is changed, we need to update the pinsp, pcontrol, and psupport dials to the same value
        this.setCount({ value: settings.deltaP, dialType: DialType.Pinsp, alarmOrDial: "dial" });
        this.setCount({ value: settings.deltaP, dialType: DialType.Pcontrol, alarmOrDial: "dial" });
        this.setCount({ value: settings.deltaP, dialType: DialType.Psupport, alarmOrDial: "dial" });
        this.handleVentilatorSettingsStatePacket({
          ...settings,
          [ParameterID.DELTAP]: settings.deltaP,
          [ParameterID.PSUPPORT]: settings.deltaP,
        });
      }
      if (
        isPsupportChanged &&
        !isDeltaPChanged &&
        ((isPsyncEnabled && settings.mode === VentMode.SIMV_P) || settings.mode === VentMode.NIVST_P)
      ) {
        // if psupport is changed, we need to update the pcontrol and pinsp dials to the same value
        this.setCount({ value: settings.pSupport, dialType: DialType.Pcontrol, alarmOrDial: "dial" });
        this.setCount({ value: settings.pSupport, dialType: DialType.Pinsp, alarmOrDial: "dial" });
        this.handleVentilatorSettingsStatePacket({
          ...settings,
          [ParameterID.DELTAP]: settings.pSupport,
        });
      }

      if (unmappedTypes.length > 0) {
        console.warn("There are unmapped VentilatorSettings: ", unmappedTypes);
      }
    },
    // trigger in confirm button in modes
    updateSettingsWithMode(mode: VentMode, dials: Array<Dial>) {
      let settings = {
        ...VentilatorState.settings,
        [ParameterID.MODE]: mode,
      };
      const unmapped: Array<string> = [];
      dials
        .filter((dial) => this.ventilatorControls.indexOf(dial.dialTitle) !== -1)
        .forEach((dial) => {
          const resultSettings = this.updateSettingsObject(dial.dialTitle, dial.count, settings);
          if (resultSettings === null) {
            unmapped.push(dial.dialTitle);
            return;
          }

          settings = resultSettings;
        });
      if (unmapped.length > 0) {
        console.warn("There are some unmapped dial types:", unmapped);
      }
      this.updateDialWhenPSyncEnabled(settings[ParameterID.PSUPPORT], settings.mode, "updateSettingsWithMode");
      this.handleVentilatorSettingsStatePacket(settings);
    },
    /**
     * update the ventilator and send settings in facilitator
      @param settings the settings to update
    **/
    handleVentilatorSettingsStatePacket(settings: VentilatorSettings) {
      VentilatorState.updateSettings(settings, true);
      packetController?.sendVentilatorSettingsPacket();
    },
    updateSettingsObject(dialType: DialType, value: number, settings: VentilatorSettings): VentilatorSettings | null {
      if (dialType == "pinsp" && (settings.mode == VentMode.SIMV_P || settings.mode == VentMode.NIVST_P)) {
        const result = {
          ...settings,
          [ParameterID.DELTAP]: value,
        };

        // if psync is enabled, we need to update the pSupport dial to the same value as the pinsp dial
        if (MainModeState.psyncEnabled || settings.mode == VentMode.NIVST_P) {
          result[ParameterID.PSUPPORT] = value;
        }

        this.updateDialWhenPSyncEnabled(value, settings.mode, "updateSettingsObject");
        return result;
      }

      const id = ventilatorIdForDialType(dialType);
      if (id !== "") {
        if (
          id === ParameterID.RATIOIE &&
          (settings.mode === VentMode.SIMV_P ||
            settings.mode === VentMode.NIVST_P ||
            settings.mode === VentMode.SIMV_PRVC)
        ) {
          // convert Ti to RatioIE
          if (dialType === DialType.Ti) {
            const rate = this.currentCount(DialType.Rate);
            const ratio = IERatio.fromTI(value, rate);
            return {
              ...settings,
              [id]: ratio.toString(),
            };
          } else {
            return settings; // skip this one so it doesn't override the ti
          }
        }

        if (dialType === DialType.FlowTrigger) {
          const dialJsonToUse = this.whichJsonFileToUseAdultOrNeo();
          const dialInfo = dialJsonToUse.find((item) => item.dialType === DialType.FlowTrigger);
          if (dialInfo === undefined) {
            return null;
          }

          if (value > dialInfo.max) {
            value = ventFlowTriggerOff; // this is what the backend will check
          }
        }

        return {
          ...settings,
          [id]: dialType === DialType.Ie ? HamiltonIERatioOptionStrings[value] ?? "1:4.0" : value,
        };
      } else {
        return null;
      }
    },
    // trigger in controls section
    updateSetting(dialType: DialType, value: number) {
      const settings = this.updateSettingsObject(dialType, value, VentilatorState.settings);
      if (settings != null) {
        this.handleVentilatorSettingsStatePacket(settings);
      } else {
        console.warn("Unmapped dial type:", dialType);
      }
    },
    updateSettingsForPSync(enabled: boolean, isSelectingMode: boolean) {
      let settings;
      if (enabled) {
        let value = this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "pSupport")?.count;
        // if we are in selecting mode, we need to use the dialToUseForNewMode
        if (isSelectingMode) {
          value = this.dialToUseForNewMode.find((ele: { dialTitle: string }) => ele.dialTitle == "pSupport")?.count;
        }
        const pControlSetting = ventilatorIdForDialType("pControl");
        const pSupportSetting = ventilatorIdForDialType("pSupport");
        const pinspSetting = ventilatorIdForDialType("pinsp");
        settings = {
          ...VentilatorState.settings,
          [pControlSetting]: value,
          [pSupportSetting]: value,
          [pinspSetting]: value,
        };

        if (!isSelectingMode) {
          this.dialToUse.forEach((ele: any) => {
            if (ele.dialTitle === "pSupport" || ele.dialTitle === "pControl" || ele.dialTitle === "pinsp") {
              ele.count = value;
            }
          });
        } else {
          this.dialToUseForNewMode.forEach((ele: any) => {
            if (ele.dialTitle === "pSupport" || ele.dialTitle === "pControl" || ele.dialTitle === "pinsp") {
              ele.count = value;
            }
          });
        }
      } else {
        const pControlValue = this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "pControl")?.count;
        const pSupportValue = this.dialToUse.find((ele: { dialTitle: string }) => ele.dialTitle == "pSupport")?.count;
        const pControlSetting = ventilatorIdForDialType("pControl");
        const pSupportSetting = ventilatorIdForDialType("pSupport");
        settings = {
          ...VentilatorState.settings,
          [pControlSetting]: pControlValue,
          [pSupportSetting]: pSupportValue,
        };
      }

      /*
        trigger this only when not isSelectingMode or not in modes
        user can cancel the modes, and it should not update the sendVentilatorSettingsPacket
        it should update when pressing confirm
      */
      if (!isSelectingMode) {
        this.handleVentilatorSettingsStatePacket(settings);
      }
    },
    initSettings(inPacketController: PacketController) {
      packetController = inPacketController;
      this.whichDialToUse();
      const ventMode = hamiltonModeTypeToVentType(MainModeState.modeButton);
      this.updateSettingsWithMode(ventMode ?? VentMode.AC_V, this.dialToUse);
    },
    // This function main aim is to check which alarm dial we are using and then
    // pass on the correct paramaters to its related function
    setDialAlarmMaxMinValue({
      newValue,
      dialType,
      mode,
      patientType,
    }: {
      newValue: number;
      dialType: string;
      mode: string;
      patientType: PatientAgeCategory;
    }) {
      let useThirdPartyCounter = false;
      let whichThirdPartyCounter = "";
      let currThirdPartyCounter = 0;
      let bottomDialCurrentCount = 0;
      let bottomDialAdditionCounter = 0;
      if (dialType === "pressureCMH2OHigh" || dialType === "pressureCMH2OLow") {
        useThirdPartyCounter = true;
        whichThirdPartyCounter = "peep";
        bottomDialAdditionCounter = 1;
      }

      if (dialType === "expMinVolumeLow") {
        bottomDialAdditionCounter = 0;
      }

      // This function is used to aid in the communication between the Top and Bottom of alarm dials. This is needed
      // due to the following
      // (a) Example Top Dial range is moved from 70 - 45 (b) Now the related Bottom Dials range is affected as it
      // should no longer be allowed to go past 45 if rotated. Vice versa for the top
      // Also some dials have a third party dial which if set helps determin their overall range. An example of this
      // is Pressure which uses the current Peep count

      // here we check if have third related third party dial count and if so we get that value and record it
      if (useThirdPartyCounter) {
        currThirdPartyCounter = this.alarmDials.find((ele) => ele.dialTitle === whichThirdPartyCounter)?.count!;
      }

      let changedDialType: string;
      let bottomOrTop: string;

      // Overall a core process here. We are looking if Bottom or Top dial is passed. We need to flip the results
      // Example if this function recieves a Top dial we need to change the max value of the Bottom Dial
      //         if this function recieves a Bottom dial we need to change the min value of the Top Dial
      if (dialType.substring(dialType.length - 3, dialType.length) === "Low") {
        //bottom dial - record current count of it, change variable to top dial
        bottomDialCurrentCount = this.alarmDials.find((ele) => ele.dialTitle === dialType)?.count!;
        changedDialType = dialType.substring(0, dialType.length - 3) + "High";
        bottomOrTop = "High";
      } else {
        //top dial - change variable to bottom dial
        changedDialType = dialType.substring(0, dialType.length - 4) + "Low";
        bottomOrTop = "Low";
      }

      const dialAlarmLimit = (dialAlarmLimits as Array<DialJsonObject>).find((ele) => ele.alarmTitle === dialType);
      if (dialAlarmLimit === undefined) {
        return 0;
      }

      // the below will find the correct dial based on the variable "changedDialType"
      // and change max or min accordingly.

      let modeObject: { mode: string; min: number; max: number; default: number }[];
      if (patientType === PatientAgeCategory.Adult || patientType === PatientAgeCategory.Paediatric) {
        modeObject = dialAlarmLimit.adultPed;
      } else {
        modeObject = dialAlarmLimit.neo;
      }

      let getModeMinAndMax = modeObject.find((ele) => ele.mode === mode);
      if (getModeMinAndMax === undefined) {
        //the current mode is not found use the default.
        getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
      }

      const alarmDial = this.alarmDials.find((ele) => ele.dialTitle === changedDialType);
      if (alarmDial === undefined) {
        return;
      }

      if (bottomOrTop === "Low") {
        // change bottom max value

        if (newValue <= getModeMinAndMax?.max!) {
          //update index max
          alarmDial.max = newValue;
        }
      } else {
        // change top min value
        if (alarmDial.count > getModeMinAndMax?.min! && bottomDialCurrentCount < getModeMinAndMax?.min!) {
          alarmDial.min = getModeMinAndMax?.min! + currThirdPartyCounter;
        } else {
          alarmDial.min = bottomDialCurrentCount + bottomDialAdditionCounter;
        }

        this.currentAlarmMin = alarmDial.min;
      }
    },
  },
});
