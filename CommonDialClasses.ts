import { PatientAgeCategory } from "@screenbuilder/components";

/* class is used to hold the main json alarm dial object */
export class DialJsonObject {
  alarmTitle: string = "";
  adultPed: { mode: string; min: number; max: number; default: number; override: boolean }[] = [];
  neo: { mode: string; min: number; max: number; default: number; override: boolean }[] = [];
  dialText: string = "";
  unit: string = "";
  intDec: string = "";
  range_and_increments: { start: number; end: number; increment: number; override: boolean }[] = [];
  dialDefaultDependency: { dep: string }[] = [];
  rangeDependency: { dep: string }[] = [];
  setDefaultByDep: Boolean = false;
}

/* class is used communicate between alarm dial classes and vue alarm file */
export class RetDialObject {
  nameOfDial: string = "";
  currentCount: number = 0;
  intOrDec: string = "";
  range_and_increments: { start: number; end: number; increment: number; override: boolean }[] = [];
  hardMin: number = 0;
  hardMax: number = 0;
  currentMin: number = 0;
  currentMax: number = 0;
  dialDefaultDependency: { dep: string }[] = [];
  dialMode: string = "";
}

/* class is used to hold commonly passed patient data */
export class PatientData {
  dialType: string = "";
  patientType: PatientAgeCategory = PatientAgeCategory.Adult;
  currentPassedMode: string = "";
  currentAlarmCount: number = 0;
}
