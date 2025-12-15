import { IERatio } from "isimulate-screen-builder";

export class HamiltonIERatio extends IERatio {
  /** diplay single decimal unless 1 */
  override toString(): string {
    return (this.i == 1 ? 1 : this.i.toFixed(1)) + ":" + (this.e == 1 ? 1 : this.e.toFixed(1));
  }

  static fromRatio(ratio: IERatio): HamiltonIERatio {
    return new HamiltonIERatio(ratio.i, ratio.e);
  }

  static formatRatioE(eRatio: number): string {
    let ratioEResult = "";
    if (eRatio < 10) {
      ratioEResult =
        eRatio % 1 === 0
          ? Math.ceil((eRatio * 10) / 10)
              .toString()
              .replace(/(\.0+)$/, "")
          : eRatio.toFixed(1).replace(/(\.0+)$/, "");
    } else {
      ratioEResult = Math.ceil((eRatio * 10) / 10)
        .toString()
        .replace(/(\.0+)$/, "");
    }

    return ratioEResult;
  }

  static formatRatioI(ratioI: number): string {
    return ratioI % 1 === 0 ? Math.ceil((ratioI * 10) / 10).toString() : ratioI.toFixed(1).toString();
  }
}

function createRatioOptions(): Array<IERatio> {
  const ieOptions: Array<IERatio> = [];

  const start = new HamiltonIERatio(1, 9.0);
  const end = new HamiltonIERatio(4.0, 1);

  //TODO abstract this and put in IERatio

  // 1:9.0 - 1:4.0

  ieOptions.push(start);
  let current = start;
  let interval = -1;
  while (!current.isEqual(new HamiltonIERatio(1, 4.0))) {
    const ratio = new HamiltonIERatio(1, Math.floor((current.e + interval) * 10) / 10);
    ieOptions.push(ratio);
    current = ratio;
  }

  // 1:4.0 - 1:1

  interval = -0.1;
  while (!current.isEqual(new HamiltonIERatio(1, 1))) {
    const ratio = new HamiltonIERatio(1, Math.floor((current.e + interval) * 10) / 10);
    ieOptions.push(ratio);
    current = ratio;
  }

  // 1:1 - 4.0:1

  interval = 0.1;
  while (!current.isEqual(end)) {
    const ratio = new HamiltonIERatio(Math.floor((current.i + interval) * 10) / 10, 1);
    ieOptions.push(ratio);
    current = ratio;
  }

  return ieOptions;
}

export const HamiltonIERatioOptions = createRatioOptions();
export const HamiltonIERatioOptionStrings = HamiltonIERatioOptions.map((ie) => ie.toString());
