import {
  IdealBodyWeightAdult,
  WeightNeonatal,
  IdealBodyWeightAdultTiDial,
  WeightNeonatalTiDail,
} from "@/types/IdealBodyWeight";

export function checkForRateNumber(adultOrNeo: boolean, IDBOrWeightValue: number) {
  let rateResult = 0;
  let rangesToUse = adultOrNeo ? IdealBodyWeightAdult : WeightNeonatal;

  rangesToUse.forEach((ele) => {
    if (IDBOrWeightValue >= ele.min && IDBOrWeightValue <= ele.max) {
      rateResult = ele.rate;
    }
  });

  return rateResult;
}

export function checkForVTNumber(
  adultOrNeo: boolean,
  IBWOrWeightValue: number,
  range: { start: number; end: number; increment: number }[]
) {
  let rateResult = 0;
  let roundDownValue = 0;
  let multiplier = adultOrNeo ? 8 : 5;
  let rangeMin = 0;
  let rangeMax = 0;
  range.forEach((ele) => {
    if (Math.ceil(IBWOrWeightValue * multiplier) >= ele.start && Math.ceil(IBWOrWeightValue * multiplier) <= ele.end) {
      roundDownValue = ele.increment;
      rangeMin = ele.start;
      rangeMax = ele.end;
    }
  });
  if (roundDownValue == 0 && range[0].start > Math.ceil(IBWOrWeightValue * multiplier)) {
    roundDownValue = range[0].increment;
    rangeMin = range[0].start;
    rangeMax = range[0].end;
  }
  if (adultOrNeo) {
    rateResult = Math.round((IBWOrWeightValue * multiplier) / roundDownValue) * roundDownValue;
  } else {
    if (!Number.isInteger(IBWOrWeightValue)) {
      IBWOrWeightValue = Number(parseFloat(IBWOrWeightValue.toString()).toFixed(1));
    }
    if (IBWOrWeightValue * multiplier == rangeMax) {
      rateResult = IBWOrWeightValue * multiplier;
    } else {
      rateResult = Math.round((IBWOrWeightValue * multiplier) / roundDownValue) * roundDownValue;
    }
    if (rateResult < 2) rateResult = 2;
  }

  return rateResult;
}

export function checkForTINumber(adultOrNeo: boolean, IDBOrWeightValue: number) {
  let rateResult = 0;
  let rangesToUse = adultOrNeo ? IdealBodyWeightAdultTiDial : WeightNeonatalTiDail;

  rangesToUse.forEach((ele) => {
    if (IDBOrWeightValue >= ele.min && IDBOrWeightValue <= ele.max) {
      rateResult = ele.rate;
    }
  });

  return rateResult;
}
