import { SpinnerResultState } from "@/store";
import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";
import { PatientAgeCategory } from "@screenbuilder/components";

export class FTotal {
  keyAlarmFTotalTop = "fTotalHigh";
  keyAlarmFTotalBottom = "fTotalLow";
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
    if (patientData.dialType === this.keyAlarmFTotalTop) {
      FTotal.dialMainJsonObjectTop.alarmTitle = ele!.alarmTitle;
      FTotal.dialMainJsonObjectTop.dialDefaultDependency = ele!.dialDefaultDependency;
      FTotal.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      FTotal.dialMainJsonObjectTop.neo = ele.neo!;
      FTotal.dialMainJsonObjectTop.dialText = ele!.dialText;
      FTotal.dialMainJsonObjectTop.unit = ele!.unit;
      FTotal.dialMainJsonObjectTop.intDec = ele!.intDec;
      FTotal.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersTop(patientData);
    }

    if (patientData.dialType === this.keyAlarmFTotalBottom) {
      FTotal.dialMainJsonObjectBottom.alarmTitle = ele!.alarmTitle;
      FTotal.dialMainJsonObjectBottom.dialDefaultDependency = ele!.dialDefaultDependency;
      FTotal.dialMainJsonObjectBottom.adultPed = ele.adultPed!;
      FTotal.dialMainJsonObjectBottom.neo = ele.neo!;
      FTotal.dialMainJsonObjectBottom.dialText = ele!.dialText;
      FTotal.dialMainJsonObjectBottom.unit = ele!.unit;
      FTotal.dialMainJsonObjectBottom.intDec = ele!.intDec;
      FTotal.dialMainJsonObjectBottom.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersBottom(patientData);
    }
  }

  /**
   * Function
   * (a) Uses the main json class object to get certain data which is then returned to the related vue file
   */
  setObjectParametersTop(patientData: PatientData): RetDialObject {
    let getModeMinAndMax = null;
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = FTotal.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = FTotal.dialMainJsonObjectTop.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = FTotal.dialMainJsonObjectTop.intDec;
    this.retDialEndResult.dialDefaultDependency = FTotal.dialMainJsonObjectTop.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;
    this.retDialEndResult.nameOfDial =
      FTotal.dialMainJsonObjectTop.dialText + "<br />" + FTotal.dialMainJsonObjectTop.unit;
    if (patientData.dialType === this.keyAlarmFTotalTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmFTotalBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmFTotalTop,
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
    let modeObject: { mode: string; min: number; max: number; default: number; override: boolean }[];
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = FTotal.dialMainJsonObjectBottom.adultPed;
    } else {
      modeObject = FTotal.dialMainJsonObjectBottom.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = FTotal.dialMainJsonObjectBottom.intDec;
    this.retDialEndResult.dialDefaultDependency = FTotal.dialMainJsonObjectBottom.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;

    if (patientData.dialType === this.keyAlarmFTotalTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmFTotalBottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmFTotalTop,
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
    if (patientData.dialType === this.keyAlarmFTotalTop) {
      if (SpinnerResultState.getCurrentAlarmMin === 0) {
        if (patientData.patientType === PatientAgeCategory.Neonate) {
          currentDialObject.currentMin = currentDialObject.hardMin;
        } else {
          currentDialObject.currentMin = SpinnerResultState.currentAlarmCount(
            this.keyAlarmFTotalBottom,
            patientData.currentPassedMode,
            patientData.patientType
          );
        }
      } else {
        if (
          SpinnerResultState.currentAlarmCount(
            this.keyAlarmFTotalBottom,
            patientData.currentPassedMode,
            patientData.patientType
          ) <= currentDialObject.hardMin
        ) {
          currentDialObject.currentMin = currentDialObject.hardMin;
        }
      }
    }
    if (patientData.dialType === this.keyAlarmFTotalBottom) {
      if (
        SpinnerResultState.currentAlarmCount(
          this.keyAlarmFTotalTop,
          patientData.currentPassedMode,
          patientData.patientType
        ) >= currentDialObject.hardMax
      ) {
        currentDialObject.currentMax = currentDialObject.hardMax;
      } else {
        currentDialObject.currentMax = SpinnerResultState.currentAlarmCount(
          this.keyAlarmFTotalTop,
          patientData.currentPassedMode,
          patientData.patientType
        );
      }
    }
  }
}
