export class StandBy {
  public setStartTime() {
    const startTime = new Date();

    startTime.setHours(startTime.getHours());
    startTime.setMinutes(startTime.getMinutes());
    startTime.setSeconds(startTime.getSeconds());

    return startTime;
  }
  public getElapsedTime(startTime: Date) {
    const endTime = new Date();
    let timeDiff = endTime.getTime() - startTime.getTime();
    timeDiff = timeDiff / 1000;
    const seconds = Math.floor(timeDiff % 60);
    const secondsAsString = seconds < 10 ? "0" + seconds : seconds + "";
    timeDiff = Math.floor(timeDiff / 60);
    const minutes = timeDiff % 60;
    const minutesAsString = minutes < 10 ? "0" + minutes : minutes + "";
    timeDiff = Math.floor(timeDiff / 60);
    const hours = timeDiff % 24;
    timeDiff = Math.floor(timeDiff / 24);
    const days = timeDiff;
    const totalHours = hours + days * 24;
    const totalHoursAsString = totalHours < 10 ? "0" + totalHours : totalHours + "";

    return totalHoursAsString + ":" + minutesAsString + ":" + secondsAsString;
  }

  public getElapsedTimeForVent(startTime: Date): {days: string, hours: string, min: string} {
    const endTime = new Date();
    let timeDiff = endTime.getTime() - startTime.getTime();
    timeDiff = timeDiff / 1000;
    timeDiff = Math.floor(timeDiff / 60);
    const minutes = timeDiff % 60;
    const minutesAsString = minutes < 10 ? "0" + minutes : minutes + "";
    timeDiff = Math.floor(timeDiff / 60);
    const hours = timeDiff % 24;
    timeDiff = Math.floor(timeDiff / 24);
    const days = timeDiff;
    const totalHours = hours + days * 24;
    const totalHoursAsString = totalHours < 10 ? "0" + totalHours.toString() : totalHours.toString();
    const totalDaysAsString = days < 10 ? "0" + days.toString() : days.toString();

    return {days: totalDaysAsString , hours: totalHoursAsString, min: minutesAsString };
  }
}
