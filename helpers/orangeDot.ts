import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { MainModeState, SpinnerResultState } from "@/store";
import { DialType } from "@/store/SpinnerSelection";

export function getOrangeDotMaxValueForPramp(currentMode: HamiltonModeType, screenType: string) {
  let currentTICount = 0;
  if (currentMode === HamiltonModeType.PCV_PLUS || currentMode === HamiltonModeType.SCMV_PLUS) {
    currentTICount = Number(MainModeState.TILabel);
  } else {
    currentTICount =
      screenType === "modes"
        ? SpinnerResultState.currentCountForNewMode(DialType.Ti)
        : SpinnerResultState.currentCount(DialType.Ti);
  }

  return createMaxOrangeDotValueForPramp(currentTICount, currentMode);
}

function createMaxOrangeDotValueForPramp(currentTICount: number, currentMode: HamiltonModeType): number {
  let maxOrangeDotValue = 0;
  maxOrangeDotValue = Number(((currentTICount / 3) * 1000).toFixed());
  let roundDownValue = maxOrangeDotValue <= 100 ? 10 : 25;
  let roundDownCheck = false;
  if (currentMode === HamiltonModeType.SPONT) {
    maxOrangeDotValue = 200;
  } else {
    roundDownCheck = maxOrangeDotValue % roundDownValue == 0 ? false : true;
    if (roundDownCheck) {
      maxOrangeDotValue = Math.floor(maxOrangeDotValue / roundDownValue) * roundDownValue;
    }
  }

  return maxOrangeDotValue;
}
