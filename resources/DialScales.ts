export class DialScales {
  MonthScale(currentRotation: number): number {
    if (currentRotation >= 690) {
      return 12;
    }
    if (currentRotation >= 0 && currentRotation <= 60) {
      return 1;
    }
    if (currentRotation >= 61 && currentRotation <= 120) {
      return 2;
    }
    if (currentRotation >= 121 && currentRotation <= 150) {
      return 3;
    }
    if (currentRotation >= 151 && currentRotation <= 210) {
      return 4;
    }
    if (currentRotation >= 211 && currentRotation <= 270) {
      return 5;
    }
    if (currentRotation >= 271 && currentRotation <= 330) {
      return 6;
    }
    if (currentRotation >= 331 && currentRotation <= 390) {
      return 7;
    }
    if (currentRotation >= 391 && currentRotation <= 450) {
      return 8;
    }
    if (currentRotation >= 451 && currentRotation <= 510) {
      return 9;
    }
    if (currentRotation >= 511 && currentRotation <= 570) {
      return 10;
    }
    if (currentRotation >= 571 && currentRotation <= 630) {
      return 11;
    }
    if (currentRotation >= 631 && currentRotation <= 690) {
      return 12;
    }
    return 0;
  }
}
