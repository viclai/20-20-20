/*
 * Creates a new Timer.
 * @class
 * @param {number} iDuration - duration, in seconds
 */
function Timer(iDuration = 0) {
  this.setDuration(iDuration);
}

/*
 * Sets the duration of the timer.
 * @param {number} iDuration - duration, in seconds
 */
Timer.prototype.setDuration = function(iDuration) {
  this.hours = parseInt(Math.floor(iDuration / (60 * 60)));
  this.minutes = parseInt(Math.floor((iDuration % (60 * 60)) / 60));
  this.seconds = parseInt(Math.floor(iDuration % 60));
}

Timer.prototype.decrement = function(iAmt) {
  let hours = parseInt(Math.floor(iAmt / (60 * 60)));
  let minutes = parseInt(Math.floor((iAmt % (60 * 60)) / 60));
  let seconds = parseInt(Math.floor(iAmt % 60));

  if (hours > this.hours) {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    return;
  } else
    this.hours -= hours;

  if (minutes > this.minutes) {
    this.minutes = 0;
    this.seconds = 0;
    return;
  } else
    this.minutes -= minutes;

  if (seconds > this.seconds) {
    if (this.minutes > 0) {
      this.minutes -= 1;
      this.seconds = 60 - seconds;
    } else {
      if (this.hours > 0) {
        this.hours -= 1;
        this.minutes = 59;
        this.seconds = 60 - seconds;
      } else {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
      }
    }
  } else
    this.seconds -= seconds;
}

Timer.prototype.toString = function() {
  let str = "Time Remaining: ";

  if (this.hours < 10)
    str += "0";
  str += this.hours;

  str += ":";

  if (this.minutes < 10)
    str += "0";
  str += this.minutes;

  str += ":";

  if (this.seconds < 10)
    str += "0";
  str += this.seconds;

  return str;
}

module.exports = Timer;
