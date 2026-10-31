'use strict';
// Shared test helpers: EU/Amsterdam offsets from the rule (no ICU needed), civil time.
var DAY = 86400000;

function lastSundayUtcDay(year, month) { // month 1-based; day-of-epoch of the last Sunday
  var d = Date.UTC(year, month, 0) / DAY; // last day of that month
  var dow = new Date(d * DAY).getUTCDay();
  return d - dow;
}

// Europe/Amsterdam: +60, or +120 from the last Sunday of March 01:00 UTC to that of October 01:00 UTC
function amsterdamOffset(ms) {
  var y = new Date(ms).getUTCFullYear();
  var start = lastSundayUtcDay(y, 3) * DAY + 3600000;
  var end = lastSundayUtcDay(y, 10) * DAY + 3600000;
  return ms >= start && ms < end ? 120 : 60;
}

// ms of a local Amsterdam wall-clock time (not valid inside the skipped hour)
function ams(y, mo, d, h, mi, s) {
  var guess = Date.UTC(y, mo - 1, d, h, mi, s || 0);
  var ms = guess - 120 * 60000;
  if (amsterdamOffset(ms) === 120) { return ms; }
  return guess - 60 * 60000;
}

function pad(n) { return (n < 10 ? '0' : '') + n; }
function fmtLocal(ms, offsetMin) {
  var d = new Date(ms + offsetMin * 60000);
  return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
}

var PLACES = {
  utrecht: { lat: 52.09, lon: 5.12, hijriOffsetDays: 0 },
  maastricht: { lat: 50.85, lon: 5.69, hijriOffsetDays: 0 },
  groningen: { lat: 53.22, lon: 6.57, hijriOffsetDays: 0 }
};

module.exports = { DAY: DAY, amsterdamOffset: amsterdamOffset, ams: ams, fmtLocal: fmtLocal, PLACES: PLACES };
