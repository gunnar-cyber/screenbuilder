import { SpinnerResultState } from "@/store";
import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";
import { PatientAgeCategory } from "@screenbuilder/components";

export class VT {
  keyAlarmVtTop = "vtHigh";
  keyAlarmVtBottom = "vtLow";
  static dialMainJsonObjectTop = new DialJsonObject();
  static dialMainJsonObjectBottom = new DialJsonObject();
  retDialEndResult = new RetDialObject();

  /**
   * Function -
   * (a) Below reads information from the "Mother" related json file into the related Top or Bottom class object
   * (b) This class object is then used to fill in a end "Return" object via the "setObject etc" function
   */
  public setUpMainJsonObject(patientData: PatientData) {
    const ele = dialAlarm.find((ele) => ele.alarmTitle === (patientData.dialType as DialID));
    if (ele === undefined) {
      console.error("dial not found");
      return undefined;
    }

    if (patientData.dialType === this.keyAlarmVtTop) {
      VT.dialMainJsonObjectTop.alarmTitle = ele.alarmTitle;
      VT.dialMainJsonObjectTop.dialDefaultDependency = ele.dialDefaultDependency;
      VT.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      VT.dialMainJsonObjectTop.neo = ele.neo!;
      VT.dialMainJsonObjectTop.dialText = ele.dialText;
      VT.dialMainJsonObjectTop.unit = ele!.unit;
      if (
        patientData.patientType === PatientAgeCategory.Adult ||
        patientData.patientType === PatientAgeCategory.Paediatric
      ) {
        VT.dialMainJsonObjectTop.intDec = "int";
      } else {
        VT.dialMainJsonObjectTop.intDec = "dec";
      }

      VT.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersTop(patientData);
    }

    if (patientData.dialType === this.keyAlarmVtBottom) {
      VT.dialMainJsonObjectBottom.alarmTitle = ele.alarmTitle;
      VT.dialMainJsonObjectBottom.dialDefaultDependency = ele.dialDefaultDependency;
      VT.dialMainJsonObjectBottom.adultPed = ele.adultPed!;
      VT.dialMainJsonObjectBottom.neo = ele.neo!;
      VT.dialMainJsonObjectBottom.dialText = ele!.dialText;
      VT.dialMainJsonObjectBottom.unit = ele!.unit;
      if (
        patientData.patientType === PatientAgeCategory.Adult ||
        patientData.patientType === PatientAgeCategory.Paediatric
      ) {
        VT.dialMainJsonObjectBottom.intDec = "int";
      } else {
        VT.dialMainJsonObjectBottom.intDec = "dec";
      }
      VT.dialMainJsonObjectBottom.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersBottom(patientData);
    }
  }

  /**
   * Function
   * (a) Uses the main json class object to get certain data which is then returned to the related vue file
   */
  setObjectParametersTop(patientData: PatientData): RetDialObject {
    let getModeMinAndMax = null;
    let getOverride = null;
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];

    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = VT.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = VT.dialMainJsonObjectTop.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = VT.dialMainJsonObjectTop.intDec;
    this.retDialEndResult.dialDefaultDependency = VT.dialMainJsonObjectTop.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      getOverride = modeObject.find((ele) => ele.override === false);
    } else {
      getOverride = modeObject.find((ele) => ele.override === true);
    }

    if (getOverride?.override) {
      this.retDialEndResult.range_and_increments = VT.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === true
      );
    } else {
      this.retDialEndResult.range_and_increments = VT.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === false
      );
    }

    this.retDialEndResult.nameOfDial = VT.dialMainJsonObjectTop.dialText + "<br />" + VT.dialMainJsonObjectTop.unit;
    if (patientData.dialType === this.keyAlarmVtTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmVtBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmVtTop,
        patientData.currentPassedMode,
        patientData.patientType
      );
    }

    return this.retDialEndResult;
  }

  /**
   * Function
   * (a) Uses the main json class object to get certain data which is then returned to the related vue file
   */
  setObjectParametersBottom(patientData: PatientData): RetDialObject {
    let getModeMinAndMax = null;
    let getOverride = null;
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];

    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = VT.dialMainJsonObjectBottom.adultPed;
    } else {
      modeObject = VT.dialMainJsonObjectBottom.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = VT.dialMainJsonObjectBottom.intDec;
    this.retDialEndResult.dialDefaultDependency = VT.dialMainJsonObjectBottom.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      getOverride = modeObject.find((ele) => ele.override === false);
    } else {
      getOverride = modeObject.find((ele) => ele.override === true);
    }

    if (getOverride?.override) {
      this.retDialEndResult.range_and_increments = VT.dialMainJsonObjectBottom.range_and_increments.filter(
        (ele) => ele.override === true
      );
    } else {
      this.retDialEndResult.range_and_increments = VT.dialMainJsonObjectBottom.range_and_increments.filter(
        (ele) => ele.override === false
      );
    }

    if (patientData.dialType === this.keyAlarmVtTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmVtBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmVtTop,
        patientData.currentPassedMode,
        patientData.patientType
      );
    }

    return this.retDialEndResult;
  }

  /**
   * Function
   * This function passes in certain patient data from the related vue file which is used to set "current min or max's"
   */
  setItemsCurrentCount(patientData: PatientData, currentDialObject: RetDialObject) {
    currentDialObject.currentCount = patientData.currentAlarmCount;
    if (patientData.dialType === this.keyAlarmVtTop) {
      currentDialObject.currentMin = SpinnerResultState.currentAlarmCount(
        this.keyAlarmVtBottom,
        patientData.currentPassedMode,
        patientData.patientType
      );
    }
    if (patientData.dialType === this.keyAlarmVtBottom) {
      if (
        SpinnerResultState.currentAlarmCount(
          this.keyAlarmVtTop,
          patientData.currentPassedMode,
          patientData.patientType
        ) >= currentDialObject.hardMax
      ) {
        currentDialObject.currentMax = currentDialObject.hardMax;
      } else {
        currentDialObject.currentMax = SpinnerResultState.currentAlarmCount(
          this.keyAlarmVtTop,
          patientData.currentPassedMode,
          patientData.patientType
        );
      }
    }
  }
}
