import { Range, WaveformType } from "isimulate-screen-builder";

export class WaveformRanges {
  /*
  [unlabeled on axis]
  [-5,] 0, [5,] 10, [15,] 20
  0, [10,] 20, [30,] 40
  0, [20,] 40, [60,] 80
  */
  pressureAirway = [
    [-5, 0, 10, 20],
    [-10, 0, 20, 40],
    [-30, 0, 40, 80],
  ];

  // a workaround because the ranges
  // isn't the ends of the axis labels
  pressureAirwayYAxis = [
    [0, 10, 20],
    [0, 20, 40],
    [0, 40, 80],
  ];

  //[unlabeled on axis]
  //[-2.5,] -2, [-1.5,] -1, [-0.5,] 0, [0.5,] 1, [1.5,] 2, [2.5]
  //[-5,] -4, [-3,], -2. [-1,] 0, [1,] 2, [3,] 4, [5]
  //[-10,] -8, [-6,] -4, [-2,] 0, [2,] 4, [6,] 8, [10]
  //[-25,] -20, [-15,] -10, [-5,] 0, [5,] 10, [15,] 20, [25]
  flow = [
    // some are meant to have end numbers excluded but doesnt work with waveform range properly
    // and must be same increments
    [-3, -2, -1, 0, 1, 2, 3], // meant to be [-2, -1, 0, 1, 2]
    [-6, -4, -2, 0, 2, 4, 6], // meant to be [-4, -2, 0, 2, 4]
    [-12, -8, -4, 0, 4, 8, 12], // meant to be [-10, -8, -6, -4, 0, 4, 6, 8, 10]
    [-15, -10, -5, 0, 5, 10, 15],
    [-30, -20, -10, 0, 10, 20, 30], // meant to be [-20, -10, 0, 10, 20],
    [-45, -30, -15, 0, 15, 30, 45],
    [-75, -50, -25, 0, 25, 50, 75],
    [-150, -100, -50, 0, 50, 100, 150],
    [-300, -200, -100, 0, 100, 200, 300],
  ];

  /* puts extra notches instead of one missing at ends,
    WaveformPanel could be edited to move the 5 length but then it doesn't space the labels properly
  flowYAxis = [
    [-2, -1, 0, 1, 2],
    [-4, -2, 0, 2, 4],
    [-12, -8, -4, 0, 4, 8, 12], // meant to be [-10, -8, -6, -4, 0, 4, 6, 8, 10]
    [-15, -10, -5, 0, 5, 10, 15],
    [-20, -10, 0, 10, 20],
    [-45, -30, -15, 0, 15, 30, 45],
    [-75, -50, -25, 0, 25, 50, 75],
    [-150, -100, -50, 0, 50, 100, 150],
    [-300, -200, -100, 0, 100, 200, 300]
  ];*/

  volume = [
    [0, 2, 4, 6, 8, 10],
    [0, 5, 10, 15, 20, 25],
    [0, 10, 20, 30, 40, 50],
    [0, 25, 50, 75, 100],
    [0, 50, 100, 150, 200],
    [0, 100, 200, 300, 400],
    [0, 200, 400, 600, 800],
    [0, 400, 800, 1200, 1600],
    [0, 800, 1600, 2400, 3200],
  ];

  indexOfAxis(range: Range, set: number[][]): number | -1 {
    for (let i = 0; i < set.length; ++i) {
      const item = set[i];
      if (item[0] === range.min && item[item.length - 1] === range.max) {
        return i;
      }
    }

    return -1;
  }

  axisSetForType(type: WaveformType): number[][] {
    switch (type) {
      case WaveformType.VentFlow:
        return this.flow;
      case WaveformType.VentPressure:
        return this.pressureAirwayYAxis;
      case WaveformType.VentVolume:
        return this.volume;
    }
    return [];
  }

  setForType(type: WaveformType): number[][] {
    switch (type) {
      case WaveformType.VentFlow:
        return this.flow;
      case WaveformType.VentPressure:
        return this.pressureAirway;
      case WaveformType.VentVolume:
        return this.volume;
    }
    return [];
  }

  nextIndex(currentIndex: number, set: number[][]): number {
    if (currentIndex + 1 < set.length) {
      return currentIndex + 1;
    }
    return currentIndex;
  }

  previousIndex(currentIndex: number): number {
    if (currentIndex - 1 >= 0) {
      return currentIndex - 1;
    }
    return currentIndex;
  }

  rangeFromAxis(axis: number[]): Range {
    return { min: axis[0], max: axis[axis.length - 1] };
  }

  axisForType(type: WaveformType, range: Range) {
    // TODO this could probably be done better,
    // axisSetForType is a workaround because the range
    // isn't the ends of the axis labels

    const axisSet = this.axisSetForType(type);
    const set = this.setForType(type);

    console.log("axis", type, range, axisSet, set);
    return axisSet[this.indexOfAxis(range, set)];
  }

  rangeForCurrentDataRange(type: WaveformType, range: Range, dataRange: Range): Range {
    // Special handling for VentVolume based on VTE value ranges
    if (type === WaveformType.VentVolume) {
      const maxValue = dataRange.max;

      // VTE value is around 100 between 199, the scale should be 0 - 200
      if (maxValue >= 0 && maxValue <= 199) {
        return { min: 0, max: 200 };
      }
      // VTE value is around 200 between 399, the scale should be 0 - 400
      if (maxValue >= 200 && maxValue <= 399) {
        return { min: 0, max: 400 };
      }
      // VTE value is around 400 between 799, the scale should be 0 - 800
      if (maxValue >= 400 && maxValue <= 799) {
        return { min: 0, max: 800 };
      }
      // VTE value is 800-1599, the scale should be 0 - 1600
      if (maxValue >= 800 && maxValue <= 1599) {
        return { min: 0, max: 1600 };
      }
      // VTE value is 1600-3200, the scale should be 0 - 3200
      if (maxValue >= 1600 && maxValue <= 3200) {
        return { min: 0, max: 3200 };
      }

      // If value is greater than 3200, use larger scale
      if (maxValue > 3200) {
        const set = this.setForType(type);
        const currentIndex = this.indexOfAxis(range, set);
        const newAxis = set[this.nextIndex(currentIndex, set)];
        return this.rangeFromAxis(newAxis);
      }
    }

    const set = this.setForType(type);
    const currentIndex = this.indexOfAxis(range, set);

    if (dataRange.min < range.min || dataRange.max > range.max) {
      // either is outside of range
      const newAxis = set[this.nextIndex(currentIndex, set)];
      return this.rangeFromAxis(newAxis);
    } else {
      const previousIndex = this.previousIndex(currentIndex);
      if (previousIndex == currentIndex) {
        return range;
      }

      const previousAxis = set[previousIndex];
      const previousAxisRange = this.rangeFromAxis(previousAxis);
      const leeway = ((previousAxisRange.max - previousAxisRange.min) / 100) * 5;

      // note min doesn't have leeway because most of them have 0 as min and doesn't go much higher
      if (dataRange.min > previousAxisRange.min && dataRange.max < previousAxisRange.max - leeway) {
        // both is inside the smaller range
        return previousAxisRange;
      }
    }

    // keep the same range
    return range;
  }
}
