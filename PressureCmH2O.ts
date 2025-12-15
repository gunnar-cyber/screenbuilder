import { PatientAgeCategory } from "@screenbuilder/components";
import dialAlarm from "../../config/alarmLimits.json";
import { DialID } from "../../store/SpinnerSelection";
import { DialJsonObject, RetDialObject, PatientData } from "./Utilities/CommonDialClasses";
import { SpinnerResultState } from "@/store";

export class PressureCmH2O {
  keyAlarmPressCmH20Top = "pressureCMH2OHigh";
  keyAlarmPressCmH20Bottom = "pressureCMH2OLow";
  static dialMainJsonObjectTop = new DialJsonObject();
  static dialMainJsonObjectBottom = new DialJsonObject();
  retDialEndResult = new RetDialObject();

  /**
   * Function -
   * (a) Below reads information from the "Mother" related json file into the related Top or Bottom class object
   * (b) This class object is then used to fill in a end "Return" object via the "setObject etc" function
   */
  public setUpMainJsonObject(patient: PatientData): RetDialObject | undefined {
    const ele = dialAlarm.find((ele) => ele.alarmTitle === (patient.dialType as DialID));
    if (ele === undefined) {
      console.error("dial not found");
      return undefined;
    }
    if (patient.dialType === this.keyAlarmPressCmH20Top) {
      PressureCmH2O.dialMainJsonObjectTop.alarmTitle = ele!.alarmTitle;
      PressureCmH2O.dialMainJsonObjectTop.dialDefaultDependency = ele!.dialDefaultDependency;
      PressureCmH2O.dialMainJsonObjectTop.adultPed = ele.adultPed!;
      PressureCmH2O.dialMainJsonObjectTop.neo = ele.neo!;
      PressureCmH2O.dialMainJsonObjectTop.dialText = ele!.dialText;
      PressureCmH2O.dialMainJsonObjectTop.unit = ele!.unit;
      PressureCmH2O.dialMainJsonObjectTop.intDec = ele!.intDec;
      PressureCmH2O.dialMainJsonObjectTop.range_and_increments = ele.range_and_increments!;
      PressureCmH2O.dialMainJsonObjectTop.dialDefaultDependency = ele.dialDefaultDependency!;
      PressureCmH2O.dialMainJsonObjectTop.rangeDependency = ele.rangeDependency!;
      return this.setObjectParametersTop(patient);
    }

    if (patient.dialType === this.keyAlarmPressCmH20Bottom) {
      PressureCmH2O.dialMainJsonObjectBottom.alarmTitle = ele!.alarmTitle;
      PressureCmH2O.dialMainJsonObjectBottom.dialDefaultDependency = ele!.dialDefaultDependency;
      PressureCmH2O.dialMainJsonObjectBottom.adultPed = ele.adultPed!;
      PressureCmH2O.dialMainJsonObjectBottom.neo = ele.neo!;
      PressureCmH2O.dialMainJsonObjectBottom.dialText = ele!.dialText;
      PressureCmH2O.dialMainJsonObjectBottom.unit = ele!.unit;
      PressureCmH2O.dialMainJsonObjectBottom.intDec = ele!.intDec;
      PressureCmH2O.dialMainJsonObjectBottom.range_and_increments = ele.range_and_increments!;
      return this.setObjectParametersBottom(patient);
    }
  }

  setObjectParametersTop(patientData: PatientData): RetDialObject {
    let getModeMinAndMax = null;
    let modeObject: { mode: string; min: number; max: number; default: number }[];

    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = PressureCmH2O.dialMainJsonObjectTop.adultPed;
    } else {
      modeObject = PressureCmH2O.dialMainJsonObjectTop.neo;
    }

    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = "int";
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;
    this.retDialEndResult.nameOfDial =
      PressureCmH2O.dialMainJsonObjectTop.dialText + "<br />" + PressureCmH2O.dialMainJsonObjectTop.unit;
    this.retDialEndResult.dialMode = getModeMinAndMax?.mode!;
    let rangeDepValue = SpinnerResultState.currentCount(PressureCmH2O.dialMainJsonObjectTop.rangeDependency[0].dep);
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min! + rangeDepValue;
    }

    if (patientData.currentPassedMode === "" && patientData.patientType === PatientAgeCategory.Neonate) {
      if (rangeDepValue === 3) {
        rangeDepValue = 0;
      }
      if (rangeDepValue > 3) {
        rangeDepValue = rangeDepValue - 3;
      }
      this.retDialEndResult.currentMin = getModeMinAndMax?.min! + rangeDepValue;
    }

    if (
      (patientData.currentPassedMode === "ncpap" || patientData.currentPassedMode === "ncpappc") &&
      patientData.patientType === PatientAgeCategory.Neonate
    ) {
      switch (rangeDepValue) {
        case 5:
          rangeDepValue = 0;
          break;
        case 6:
          rangeDepValue = rangeDepValue - 5;
          break;
        case 7:
          rangeDepValue = rangeDepValue - 5;
          break;
        case 8:
          rangeDepValue = rangeDepValue - 5;
          break;
        case 9:
          rangeDepValue = rangeDepValue - 5;
          break;
      }
      if (rangeDepValue > 9) {
        rangeDepValue = 5;
      }

      this.retDialEndResult.currentMin = getModeMinAndMax?.min! + rangeDepValue;
    } else {
      this.retDialEndResult.currentMin = getModeMinAndMax?.min!;
    }

    this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    return this.retDialEndResult;
  }

  setObjectParametersBottom(patientData: PatientData): RetDialObject {
    let getModeMinAndMax = null;
    let modeObject: { mode: string; min: number; max: number; default: number }[];
    if (
      patientData.patientType === PatientAgeCategory.Adult ||
      patientData.patientType === PatientAgeCategory.Paediatric
    ) {
      modeObject = PressureCmH2O.dialMainJsonObjectBottom.adultPed;
    } else {
      modeObject = PressureCmH2O.dialMainJsonObjectBottom.neo;
    }
    getModeMinAndMax = modeObject.find((ele) => ele.mode === patientData.currentPassedMode);
    if (getModeMinAndMax === undefined) {
      getModeMinAndMax = modeObject.find((ele: { mode: string }) => ele.mode === "default");
    }

    this.retDialEndResult.currentCount = patientData.currentAlarmCount;
    this.retDialEndResult.intOrDec = "int";
    this.retDialEndResult.dialDefaultDependency = PressureCmH2O.dialMainJsonObjectBottom.dialDefaultDependency;
    this.retDialEndResult.hardMin = getModeMinAndMax?.min!;
    this.retDialEndResult.hardMax = getModeMinAndMax?.max!;
    this.retDialEndResult.range_and_increments = PressureCmH2O.dialMainJsonObjectBottom.range_and_increments;
    this.retDialEndResult.dialMode = getModeMinAndMax?.mode!;

    if (patientData.dialType === this.keyAlarmPressCmH20Top) {
      this.retDialEndResult.currentMin =
        getModeMinAndMax?.min! + SpinnerResultState.currentCount(this.retDialEndResult.dialDefaultDependency[0].dep);
      this.retDialEndResult.currentMax = getModeMinAndMax?.max!;
    }

    if (patientData.dialType === this.keyAlarmPressCmH20Bottom) {
      this.retDialEndResult.currentMin = this.retDialEndResult.hardMin;
      this.retDialEndResult.currentMax = SpinnerResultState.currentAlarmCount(
        this.keyAlarmPressCmH20Top,
        patientData.currentPassedMode,
        patientData.patientType
      );
    }

    return this.retDialEndResult;
  }

  setItemsCurrentCount(patientData: PatientData, currentDialObject: RetDialObject) {
    currentDialObject.currentCount = patientData.currentAlarmCount;
    if (patientData.dialType === this.keyAlarmPressCmH20Top) {
      if (SpinnerResultState.getCurrentAlarmMin === 0) {
        let rangeDepValue = SpinnerResultState.currentCount(PressureCmH2O.dialMainJsonObjectTop.rangeDependency[0].dep);
        if (
          patientData.patientType === PatientAgeCategory.Adult ||
          patientData.patientType === PatientAgeCategory.Paediatric
        ) {
          currentDialObject.currentMin = currentDialObject.hardMin + rangeDepValue;
        }
        if (patientData.currentPassedMode === "" && patientData.patientType === PatientAgeCategory.Neonate) {
          if (rangeDepValue === 3) {
            rangeDepValue = 0;
          }
          if (rangeDepValue > 3) {
            rangeDepValue = rangeDepValue - 3;
          }
          currentDialObject.currentMin = currentDialObject.hardMin + rangeDepValue;
        }

        if (
          (patientData.currentPassedMode === "ncpap" || patientData.currentPassedMode === "ncpappc") &&
          patientData.patientType === PatientAgeCategory.Neonate
        ) {
          let rangeDepValue = SpinnerResultState.currentCount(PressureCmH2O.dialMainJsonObjectTop.rangeDependency[0].dep);

          switch (rangeDepValue) {
            case 5:
              rangeDepValue = 0;
              break;
            case 6:
              rangeDepValue = rangeDepValue - 5;
              break;
            case 7:
              rangeDepValue = rangeDepValue - 5;
              break;
            case 8:
              rangeDepValue = rangeDepValue - 5;
              break;
            case 9:
              rangeDepValue = rangeDepValue - 5;
              break;
          }
          if (rangeDepValue > 9) {
            rangeDepValue = 5;
          }
          currentDialObject.currentMin = currentDialObject.hardMin + rangeDepValue;
        } else {
          this.retDialEndResult.currentMin = currentDialObject.hardMin;
        }
      } else {
        if (
          SpinnerResultState.currentAlarmCount(
            this.keyAlarmPressCmH20Bottom,
            patientData.currentPassedMode,
            patientData.patientType
          ) <= currentDialObject.hardMin
        ) {
          currentDialObject.currentMin = currentDialObject.hardMin;
        } else {
          currentDialObject.currentMin = SpinnerResultState.currentAlarmCount(
            this.keyAlarmPressCmH20Bottom,
            patientData.currentPassedMode,
            patientData.patientType
          );
        }
      }
    }
    if (patientData.dialType === this.keyAlarmPressCmH20Bottom) {
      if (
        SpinnerResultState.currentAlarmCount(
          this.keyAlarmPressCmH20Top,
          patientData.currentPassedMode,
          patientData.patientType
        ) >= currentDialObject.hardMax
      ) {
        currentDialObject.currentMax = currentDialObject.hardMax;
      } else {
        currentDialObject.currentMax = SpinnerResultState.currentAlarmCount(
          this.keyAlarmPressCmH20Top,
          patientData.currentPassedMode,
          patientData.patientType
        );
      }
    }
  }
}
