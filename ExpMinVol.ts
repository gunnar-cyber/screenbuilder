import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { SpinnerResultState } from "@/store";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";
import { PatientAgeCategory } from "@screenbuilder/components";

export class ExpMinVol {
  keyAlarmExpMinVolTop = "expMinVolumeHigh";
  keyAlarmExpMinVolBottom = "expMinVolumeLow";
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

    if (patientData.dialType === this.keyAlarmExpMinVolTop) {
      ExpMinVol.dialMainJsonObjectTop.alarmTitle = ele.alarmTitle;
      ExpMinVol.dialMainJsonObjectTop.dialDefaultDependency = ele.dialDefaultDependency;
      ExpMinVol.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      ExpMinVol.dialMainJsonObjectTop.neo = ele.neo;
      ExpMinVol.dialMainJsonObjectTop.dialText = ele.dialText;
      ExpMinVol.dialMainJsonObjectTop.unit = ele!.unit;
      ExpMinVol.dialMainJsonObjectTop.intDec = ele.intDec;
      ExpMinVol.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersTop(patientData);
    }

    if (patientData.dialType === this.keyAlarmExpMinVolBottom) {
      ExpMinVol.dialMainJsonObjectBottom.alarmTitle = ele.alarmTitle;
      ExpMinVol.dialMainJsonObjectBottom.dialDefaultDependency = ele.dialDefaultDependency;
      ExpMinVol.dialMainJsonObjectBottom.adultPed = ele.adultPed!;
      ExpMinVol.dialMainJsonObjectBottom.neo = ele.neo!;
      ExpMinVol.dialMainJsonObjectBottom.dialText = ele.dialText;
      ExpMinVol.dialMainJsonObjectBottom.unit = ele!.unit;
      ExpMinVol.dialMainJsonObjectBottom.intDec = ele.intDec;
      ExpMinVol.dialMainJsonObjectBottom.range_and_increments = ele.range_and_increments!;
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
      modeObject = ExpMinVol.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = ExpMinVol.dialMainJsonObjectTop.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = ExpMinVol.dialMainJsonObjectTop.intDec;
    this.retDialEndResult.dialDefaultDependency = ExpMinVol.dialMainJsonObjectTop.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    getOverride = modeObject.find((ele) => ele.override === true);
    if (getOverride === undefined) {
      getOverride = modeObject.find((ele: { override: boolean }) => ele.override === false);
    }

    if (getOverride?.override) {
      this.retDialEndResult.range_and_increments = ExpMinVol.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === true
      );
    } else {
      this.retDialEndResult.range_and_increments = ExpMinVol.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === false
      );
    }

    this.retDialEndResult.nameOfDial =
      ExpMinVol.dialMainJsonObjectTop.dialText + "<br />" + ExpMinVol.dialMainJsonObjectTop.unit;
    if (patientData.dialType === this.keyAlarmExpMinVolTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmExpMinVolBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmExpMinVolTop,
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
      modeObject = ExpMinVol.dialMainJsonObjectBottom.adultPed;
    } else {
      modeObject = ExpMinVol.dialMainJsonObjectBottom.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = ExpMinVol.dialMainJsonObjectBottom.intDec;
    this.retDialEndResult.dialDefaultDependency = ExpMinVol.dialMainJsonObjectBottom.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    getOverride = modeObject.find((ele) => ele.override === true);
    if (getOverride === undefined) {
      getOverride = modeObject.find((ele: { override: boolean }) => ele.override === false);
    }

    if (getOverride?.override) {
      this.retDialEndResult.range_and_increments = ExpMinVol.dialMainJsonObjectBottom.range_and_increments.filter(
        (ele) => ele.override === true
      );
    } else {
      this.retDialEndResult.range_and_increments = ExpMinVol.dialMainJsonObjectBottom.range_and_increments.filter(
        (ele) => ele.override === false
      );
    }

    if (patientData.dialType === this.keyAlarmExpMinVolTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmExpMinVolBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmExpMinVolTop,
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
    if (patientData.dialType === this.keyAlarmExpMinVolTop) {
      currentDialObject.currentMin = SpinnerResultState.currentAlarmCount(
        this.keyAlarmExpMinVolBottom,
        patientData.currentPassedMode,
        patientData.patientType
      );
    }
    if (patientData.dialType === this.keyAlarmExpMinVolBottom) {
      if (
        SpinnerResultState.currentAlarmCount(
          this.keyAlarmExpMinVolTop,
          patientData.currentPassedMode,
          patientData.patientType
        ) >= currentDialObject.hardMax
      ) {
        currentDialObject.currentMax = currentDialObject.hardMax;
      } else {
        currentDialObject.currentMax = SpinnerResultState.currentAlarmCount(
          this.keyAlarmExpMinVolTop,
          patientData.currentPassedMode,
          patientData.patientType
        );
      }
    }
  }
}
