.pragma library
// Civil-date arithmetic on plain integers (proleptic Gregorian). No Date object is used,
// so results never depend on the machine's time zone.

var MS_PER_DAY = 86400000;

// Days since 1970-01-01 for a civil date (month 1-12).
function daysFromCivil(y, m, d) {
  var yy = m <= 2 ? y - 1 : y;
  var era = Math.floor(yy / 400);
  var yoe = yy - era * 400;
  var doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

// Inverse of daysFromCivil: { y, m, d }.
function civilFromDays(z) {
  var zz = z + 719468;
  var era = Math.floor(zz / 146097);
  var doe = zz - era * 146097;
  var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  var mp = Math.floor((5 * doy + 2) / 153);
  var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  var m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m: m, d: d };
}

// Civil day number (days since 1970-01-01) of an instant at a local UTC offset in minutes.
function localDay(ms, offsetMin) {
  return Math.floor((ms + offsetMin * 60000) / MS_PER_DAY);
}

function pad2(n) { return (n < 10 ? "0" : "") + n; }

// "HH:MM" (24h) of an instant at a local UTC offset in minutes.
function formatClock(ms, offsetMin) {
  var local = ms + offsetMin * 60000;
  var minuteOfDay = Math.floor((local - Math.floor(local / MS_PER_DAY) * MS_PER_DAY) / 60000);
  return pad2(Math.floor(minuteOfDay / 60)) + ":" + pad2(minuteOfDay % 60);
}
