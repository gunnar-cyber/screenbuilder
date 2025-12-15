import { PatientAgeCategory } from "@screenbuilder/components";
import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";
import { SpinnerResultState } from "@/store";

export class Oxygen {
  keyAlarmOxygenTop = "oxygenHigh";
  keyAlarmOxygenBottom = "oxygenLow";
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
    if (patientData.dialType === this.keyAlarmOxygenTop) {
      Oxygen.dialMainJsonObjectTop.alarmTitle = ele!.alarmTitle;
      Oxygen.dialMainJsonObjectTop.dialDefaultDependency = ele!.dialDefaultDependency;
      Oxygen.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      Oxygen.dialMainJsonObjectTop.neo = ele.neo!;
      Oxygen.dialMainJsonObjectTop.dialText = ele!.dialText;
      Oxygen.dialMainJsonObjectTop.unit = ele!.unit;
      Oxygen.dialMainJsonObjectTop.intDec = ele!.intDec;
      Oxygen.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersTop(patientData);
    }

    if (patientData.dialType === this.keyAlarmOxygenBottom) {
      Oxygen.dialMainJsonObjectBottom.alarmTitle = ele!.alarmTitle;
      Oxygen.dialMainJsonObjectBottom.dialDefaultDependency = ele!.dialDefaultDependency;
      Oxygen.dialMainJsonObjectBottom.adultPed = ele.adultPed!;
      Oxygen.dialMainJsonObjectBottom.neo = ele.neo!;
      Oxygen.dialMainJsonObjectBottom.dialText = ele!.dialText;
      Oxygen.dialMainJsonObjectBottom.unit = ele!.unit;
      Oxygen.dialMainJsonObjectBottom.intDec = ele!.intDec;
      Oxygen.dialMainJsonObjectBottom.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersBottom(patientData);
    }
  }

  /**
   * Function
   * (a) Uses the main json class object to get certain data which is then returned to the related vue file
   */
  setObjectParametersTop(patientData: PatientData): RetDialObject {
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = Oxygen.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = Oxygen.dialMainJsonObjectTop.neo;
    }

    let getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = Oxygen.dialMainJsonObjectTop.intDec;
    this.retDialEndResult.dialDefaultDependency = Oxygen.dialMainJsonObjectTop.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;
    this.retDialEndResult.nameOfDial =
      Oxygen.dialMainJsonObjectTop.dialText + "<br />" + Oxygen.dialMainJsonObjectTop.unit;
    if (patientData.dialType === this.keyAlarmOxygenTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmOxygenBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmOxygenTop,
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
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = Oxygen.dialMainJsonObjectBottom.adultPed;
    } else {
      modeObject = Oxygen.dialMainJsonObjectBottom.neo;
    }

    let getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = Oxygen.dialMainJsonObjectBottom.intDec;
    this.retDialEndResult.dialDefaultDependency = Oxygen.dialMainJsonObjectBottom.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    if (patientData.dialType === this.keyAlarmOxygenTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmOxygenBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmOxygenTop,
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
    if (patientData.dialType === this.keyAlarmOxygenTop) {
      if (SpinnerResultState.getCurrentAlarmMin === 0) {
        if (patientData.patientType === PatientAgeCategory.Neonate) {
          currentDialObject.currentMin = currentDialObject.hardMin;
        } else {
          currentDialObject.currentMin = SpinnerResultState.currentAlarmCount(
            this.keyAlarmOxygenBottom,
            patientData.currentPassedMode,
            patientData.patientType
          );
        }
      } else {
        if (
          SpinnerResultState.currentAlarmCount(
            this.keyAlarmOxygenBottom,
            patientData.currentPassedMode,
            patientData.patientType
          ) <= currentDialObject.hardMin
        ) {
          currentDialObject.currentMin = currentDialObject.hardMin;
        }
      }
    }

    if (patientData.dialType === this.keyAlarmOxygenBottom) {
      if (
        SpinnerResultState.currentAlarmCount(
          this.keyAlarmOxygenTop,
          patientData.currentPassedMode,
          patientData.patientType
        ) >= currentDialObject.hardMax
      ) {
        currentDialObject.currentMax = currentDialObject.hardMax;
      } else {
        currentDialObject.currentMax = SpinnerResultState.currentAlarmCount(
          this.keyAlarmOxygenTop,
          patientData.currentPassedMode,
          patientData.patientType
        );
      }
    }
  }
}
