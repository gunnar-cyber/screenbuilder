import { PatientAgeCategory } from "@screenbuilder/components";
import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";

export class Apnea {
  keyAlarmVtTop = "apneaHigh";
  static dialMainJsonObjectTop = new DialJsonObject();
  retDialEndResult = new RetDialObject();

  /**
  * Function -
  *  (a) Below reads information from the "Mother" related json file into the related Top or Bottom class object
  *  (b) This class object is then used to fill in a end "Return" object via the "setObject etc" function
  */
  public setUpMainJsonObject(patientData: PatientData) {
    const ele = dialAlarm.find((ele) => ele.alarmTitle === (patientData.dialType as DialID));
    if (ele === undefined) {
      console.error("dial not found");
      return undefined;
    }
    if (patientData.dialType === this.keyAlarmVtTop) {
      Apnea.dialMainJsonObjectTop.alarmTitle = ele!.alarmTitle;
      Apnea.dialMainJsonObjectTop.dialDefaultDependency = ele!.dialDefaultDependency;
      Apnea.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      Apnea.dialMainJsonObjectTop.neo = ele.neo!;
      Apnea.dialMainJsonObjectTop.dialText = ele!.dialText;
      Apnea.dialMainJsonObjectTop.unit = ele!.unit;
      Apnea.dialMainJsonObjectTop.intDec = "int";
      Apnea.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersTop(patientData);
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
    if (patientData.patientType === PatientAgeCategory.Adult || patientData.patientType === PatientAgeCategory.Paediatric) {
      modeObject = Apnea.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = Apnea.dialMainJsonObjectTop.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = Apnea.dialMainJsonObjectTop.intDec;
    this.retDialEndResult.dialDefaultDependency = Apnea.dialMainJsonObjectTop.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;
    if (patientData.patientType === PatientAgeCategory.Adult || patientData.patientType === PatientAgeCategory.Paediatric) {
      getOverride = modeObject.find((ele) => ele.override === false);
    } else {
      getOverride = modeObject.find((ele) => ele.override === true);
    }

    if (getOverride?.override) {
      this.retDialEndResult.range_and_increments = Apnea.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === true
      );
    } else {
      this.retDialEndResult.range_and_increments = Apnea.dialMainJsonObjectTop.range_and_increments.filter(
        (ele) => ele.override === false
      );
    }

    this.retDialEndResult.nameOfDial = Apnea.dialMainJsonObjectTop.dialText + "<br />" + Apnea.dialMainJsonObjectTop.unit;
    if (patientData.dialType === this.keyAlarmVtTop) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    return this.retDialEndResult;
  }

  /**
  * Function
  * This function passes in certain patient data from the related vue file which is used to set "current counts"
  */
  setItemsCurrentCount(patientData: PatientData, currentDialObject: RetDialObject) {
    currentDialObject.currentCount = patientData.currentAlarmCount;
  }
}
