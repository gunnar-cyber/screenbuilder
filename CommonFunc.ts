import { SpinnerResultState } from "@/store";

export class CommonFunc {
  hour = SpinnerResultState.currentCount("hoursystem");
  min = SpinnerResultState.currentCount("minsystem");
  year = SpinnerResultState.currentCount("yearsystem");
  month = SpinnerResultState.currentCount("monthsystem");
  day = SpinnerResultState.currentCount("daysystem");
  public getTime() {
    const endTime = new Date(this.year, this.month, this.day, this.hour, this.min).toTimeString().substr(0, 8);
    return endTime;
  }

  public getDate() {
    let month = this.month.toString();
    month = month.length < 2 ? "0" + month : month;
    let day = this.day.toString();
    day = day.length < 2 ? "0" + day : day;
    return [this.year.toString(), month, day].join("-");
  }
}

export function getFormattedDateForScreenshot() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
