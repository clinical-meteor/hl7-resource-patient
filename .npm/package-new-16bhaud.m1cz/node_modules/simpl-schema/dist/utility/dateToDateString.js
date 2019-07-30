"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dateToDateString;
/**
 * Given a Date instance, returns a date string of the format YYYY-MM-DD
 */
function dateToDateString(date) {
  var m = date.getUTCMonth() + 1;
  if (m < 10) m = "0" + m;
  var d = date.getUTCDate();
  if (d < 10) d = "0" + d;
  return date.getUTCFullYear() + "-" + m + "-" + d;
}