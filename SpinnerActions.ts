import { SpinnerResultState, SpinnerSelectionState, store } from "@/store";
import { DialID, DialType } from "@/store/SpinnerSelection";
import spinnerTurnSound from "@/assets/sounds/spinnerTurn.wav";
import { audioPlayer } from "isimulate-screen-builder";
import { PatientAgeCategory } from "@screenbuilder/components";
import { HamiltonModeType } from "./HamiltonModeType";

type RangeAndIncrementsType = Array<{
  start: number;
  end: number;
  increment: number;
}>;

function findIncrement(
  typeOfNumber: string,
  rangeAndIncrements: RangeAndIncrementsType,
  dialType: DialType,
  count: number,
  isForwards: boolean,
  defaultIncrement = 1
) {
  if (rangeAndIncrements === null) return defaultIncrement;

  const countPadding = findCountPaddingFromRangeAndIncrements(typeOfNumber, rangeAndIncrements, dialType, count);

  for (let i = 0; i < rangeAndIncrements.length; i++) {
    // NOTE: because the JSON values are START inclusive,
    // we need to add an offset when we are INCREASING the
    // value, so we compute the increment based on the
    // target count instead of the source count
    let start = isForwards ? +(count + countPadding).toFixed(2) : +count.toFixed(2);
    let end = isForwards ? +(count + rangeAndIncrements[i].increment).toFixed(2) : +count.toFixed(2);

    if (start >= rangeAndIncrements[i].start && end <= rangeAndIncrements[i].end) {
      return rangeAndIncrements[i].increment;
    }
  }

  return defaultIncrement;
}

export function findIncrementForwards(
  typeOfNumber: string,
  rangeAndIncrements: RangeAndIncrementsType,
  dialType: DialType,
  count: number
): number {
  return findIncrement(typeOfNumber, rangeAndIncrements, dialType, count, true);
}

export function findIncrementBackwards(
  typeOfNumber: string,
  rangeAndIncrements: RangeAndIncrementsType,
  dialType: DialType,
  count: number
): number {
  return findIncrement(typeOfNumber, rangeAndIncrements, dialType, count, false);
}

//TODO see if this can be removed
function findCountPaddingFromRangeAndIncrements(
  typeOfNumber: string,
  rangeAndIncrements: RangeAndIncrementsType,
  dialType: DialType,
  count: number
): number {
  let countPadding = 0;
  if (typeOfNumber === "dec") {
    const c = +count.toFixed(2);
    countPadding = rangeAndIncrements.find((inc) => c >= inc.start && c <= inc.end)?.increment ?? 0;
  } else {
    countPadding = 1;
  }

  if (dialType === "timax") {
    if (countPadding === 0.05) {
      countPadding = 0.04;
    }
  }

  if (dialType === "ti") {
    if (countPadding === 0.05) {
      countPadding = 0.01;
    }
  }

  return countPadding;
}

/**
 * This class core process is maintain core aspects of the spinner dial such as maintaining the count of a current dial
 */
export class SpinnerActions {
  min: number = 0;
  max: number = 0;
  count: number = 0;
  dialType: string = "";
  alarmOrCommonDial: string = "";
  mode: string = "";
  patientType: PatientAgeCategory = PatientAgeCategory.Adult;
  isModesScreen: boolean = false;
  rangeAndIncrements: RangeAndIncrementsType = [];
  increment = 1;
  typeOfNumber = "";

  private spinForwardsImplementation = this.spinNormalForwards;
  private spinBackwardsImplementation = this.spinNormalBackwards;
  private applyImplementation = this.applyNormalCount;

  /**
   * Start the spinner
   *
   * @param _dialType - the type of dial we are trying to use
   * @param _max - the hard extreme max value of a dial
   * @param _min - the hard extreme min value of a dial
   * @param _startValue - the dials current count
   * @param _typeOfNumber - are we using a decimal or integer number
   * @param _alarmOrCommonDial - are we using dial from the "Alarm" area or the "Other" areas. Alarm dials act differently
   * @param _isModesScreen - is it the modes screen where the dial is being used
   * @param _rangeAndIncrements - Each dial has the potential to have different ranges and increments within their overall range
   *                              Example - Dial XXXX has overall range of 1 - 1000
   *                                        From 1 - 100 we increment dial by 5. From 101 - 500 we increment dial by 20
   *                                        From 501 - 1000 we increment dial by 50. This variable holds these types of settings
   * @param _mode - current mode
   * @param _patientType - current patient type either neonate, child or adult, can affect min/max
   *
   */
  public startSpinner(
    _dialType: string,
    _max: number,
    _min: number,
    _startValue: number,
    _typeOfNumber: string,
    _alarmOrCommonDial: string,
    _mode: string,
    _patientType: PatientAgeCategory,
    _isModesScreen: boolean,
    _rangeAndIncrements?: Array<{
      start: number;
      end: number;
      increment: number;
    }> | null
  ) {
    this.dialType = _dialType;
    this.min = _min;
    this.max = _max;
    this.count = _startValue;
    this.alarmOrCommonDial = _alarmOrCommonDial;
    this.rangeAndIncrements = _rangeAndIncrements!;
    this.typeOfNumber = _typeOfNumber;
    this.mode = _mode;
    this.patientType = _patientType;
    this.isModesScreen = _isModesScreen;
    if (this.alarmOrCommonDial === "alarmDial") {
      this.spinForwardsImplementation = this.spinAlarmForwards;
      this.spinBackwardsImplementation = this.spinAlarmBackwards;
      this.applyImplementation = this.applyAlarmCount;
    }
  }

  private findCountPaddingFromRangeAndIncrementsAlarms(): number {
    let countPadding = 0;
    if (this.typeOfNumber === "dec") {
      for (let i = 0; i < this.rangeAndIncrements.length; i++) {
        if (
          Number(this.count.toFixed(2)) >= this.rangeAndIncrements[i].start &&
          Number(this.count.toFixed(2)) <= this.rangeAndIncrements[i].end
        ) {
          countPadding = this.rangeAndIncrements[i].increment;
        }
      }
    } else {
      countPadding = 1;
    }

    if (this.dialType === "expMinVolumeLow" || this.dialType === "expMinVolumeHigh") {
      if (countPadding === 0.5) {
        countPadding = 0.49;
      }

      if (countPadding === 1) {
        countPadding = 0.99;
      }
    }

    return countPadding;
  }

  public spinForwards() {
    this.spinForwardsImplementation();
  }

  public spinBackwards() {
    this.spinBackwardsImplementation();
  }

  /**
   * Save the updated count value to the store
   */
  public applyCount() {
    this.applyImplementation();
  }

  private spinNormalForwards() {
    this.increment = findIncrementForwards(
      this.typeOfNumber,
      this.rangeAndIncrements,
      this.dialType as DialType,
      this.count
    );

    // now check so that we don't go over "current" max and mins and we are using the correct increment.

    // flowTrigger has an off state that is one increment past the max
    if (
      this.dialType === DialType.FlowTrigger &&
      ((this.patientType === PatientAgeCategory.Adult &&
        (this.mode === HamiltonModeType.PCV_PLUS || this.mode === HamiltonModeType.SCMV_PLUS)) ||
        (this.patientType === PatientAgeCategory.Neonate &&
          (this.mode === HamiltonModeType.PCV_PLUS || this.mode === HamiltonModeType.SCMV_PLUS)))
    ) {
      if (Number(this.count.toFixed(2)) <= Number((this.max + this.increment).toFixed(2)) - this.increment) {
        this.count = this.count + this.increment;
        audioPlayer.play(spinnerTurnSound, false, 0.03);
      }
    } else {
      if (this.dialType === DialType.Ti && this.mode === HamiltonModeType.SIMV_PLUS) {
        if (Number(this.count.toFixed(2)) <= Number((this.max - this.increment).toFixed(2))) {
          this.count = this.count + this.increment;
          audioPlayer.play(spinnerTurnSound, false, 0.03);
        }
      } else if (Number(this.count.toFixed(2)) <= Number(this.max.toFixed(2)) - this.increment) {
        this.count = this.count + this.increment;
        audioPlayer.play(spinnerTurnSound, false, 0.03);
      }
    }
  }

  private spinNormalBackwards() {
    this.increment = findIncrementBackwards(
      this.typeOfNumber,
      this.rangeAndIncrements,
      this.dialType as DialType,
      this.count
    );

    if (Number(this.count.toFixed(2)) >= Number((this.min + this.increment).toFixed(2))) {
      this.count = this.count - this.increment;
      audioPlayer.play(spinnerTurnSound, false, 0.03);
    }
  }

  private applyNormalCount() {
    if (SpinnerSelectionState.isControlActive(this.dialType as DialID)) {
      // TODO refactor to not need this
      const value = Number(this.count.toFixed(2));
      if (this.isModesScreen) {
        SpinnerResultState.setNewModeCount({
          dialType: this.dialType as DialID,
          value: value,
          currentMode: this.mode,
        });
      } else {
        SpinnerResultState.setCount({ dialType: this.dialType as DialID, value: value, alarmOrDial: "normal" });
      }
    }
  }

  private spinAlarmForwards() {
    const countPadding = findCountPaddingFromRangeAndIncrements(
      this.typeOfNumber,
      this.rangeAndIncrements,
      this.dialType as DialType,
      this.count
    );

    //now we need to get the correct max, min range and increment compared to what the "current count" is.
    //the "INCREMENT" is key here.
    //MADE UP EXAMPLE - Dial XXX has extreme top value of 500.
    //                  1 to 100 increments by 10, 101 to 300 increments by 25, 301 to 500 increments by 50
    //                  We have dialed the current count to a value of 125. So from above we need to
    //                  make sure we using the second range (101 to 300) for our max, mins and increments
    this.increment = 1;
    if (this.rangeAndIncrements !== null) {
      for (let i = 0; i < this.rangeAndIncrements.length; i++) {
        if (
          Math.round((Number(this.count.toFixed(2)) + countPadding) * 100) / 100 >= this.rangeAndIncrements[i].start &&
          Number(this.count.toFixed(2)) + this.rangeAndIncrements[i].increment <= this.rangeAndIncrements[i].end
        ) {
          this.increment = this.rangeAndIncrements[i].increment;
        }
      }
    }

    //now check so that we don't go over "current" max and mins and we are using the correct increment.
    if (
      Number(this.count.toFixed(2)) >= Number((Number(this.min.toFixed(2)) - countPadding).toFixed(2)) &&
      Number(this.count.toFixed(2)) <= Number(this.max.toFixed(2)) - this.increment
    ) {
      this.count = this.count + this.increment;
      audioPlayer.play(spinnerTurnSound, false, 0.03);
    }
  }

  private spinAlarmBackwards() {
    const countPadding = findCountPaddingFromRangeAndIncrements(
      this.typeOfNumber,
      this.rangeAndIncrements,
      this.dialType as DialType,
      this.count
    );

    // the below mechanics work very similar to
    if (this.rangeAndIncrements !== null) {
      for (let i = 0; i < this.rangeAndIncrements.length; i++) {
        if (
          Math.round((this.count - countPadding) * 100) / 100 >= this.rangeAndIncrements[i].start &&
          this.count - this.rangeAndIncrements[i].increment <= this.rangeAndIncrements[i].end
        ) {
          this.increment = this.rangeAndIncrements[i].increment;
        }
      }
    }

    if (
      Number(this.count.toFixed(2)) >= Number((Number(this.min.toFixed(2)) + countPadding).toFixed(2)) &&
      Number(this.count.toFixed(2)) <= Number(this.max.toFixed(2)) + this.increment
    ) {
      this.count = this.count - this.increment;
      audioPlayer.play(spinnerTurnSound, false, 0.03);
    }
  }

  private applyAlarmCount() {
    if (
      SpinnerSelectionState.isControlActive(this.dialType as DialID) &&
      parseFloat(this.count.toFixed(2)) >= parseFloat(this.min.toFixed(2))
    ) {
      SpinnerResultState.setCount({
        dialType: this.dialType as DialID,
        value: Number(this.count.toFixed(2)),
        alarmOrDial: "alarm",
      });
    }

    if (parseFloat(this.count.toFixed(2)) >= parseFloat(this.min.toFixed(2))) {
      SpinnerResultState.setDialAlarmMaxMinValue({
        newValue: this.count,
        dialType: this.dialType,
        mode: this.mode,
        patientType: this.patientType,
      });
    }
  }
}
