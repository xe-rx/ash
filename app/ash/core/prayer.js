.pragma library
.import "sun.js" as Sun
// Prayer times per ADR 0002: Muslim World League (Fajr 18 deg, Isha 17 deg, Dhuhr +1 min as
// the method publishes it), Standard Asr (shadow 1x), Maghrib = sunset, and the twilight-angle
// high-latitude rule (night portions 18/60 and 17/60) when an angle is never reached or would
// fall outside its portion of the night. Rounded to the nearest whole minute (30 s rounds up),
// like the reference implementation adhan-js, which tests/core compares against.

var FAJR_ANGLE = 18;
var ISHA_ANGLE = 17;
var DHUHR_ADJUST_MIN = 1;
var ASR_SHADOW = 1;
var MS_PER_DAY = 86400000;

// Instant for "hours of UT counted from 0h UT of the day", truncated to whole seconds.
function instant(dayNumber, hours) {
  var h = Math.floor(hours);
  var min = Math.floor((hours - h) * 60);
  var sec = Math.floor((hours - (h + min / 60)) * 3600);
  return dayNumber * MS_PER_DAY + ((h * 60 + min) * 60 + sec) * 1000;
}

function roundMinute(ms) {
  var s = Math.floor(ms / 1000);
  var sec = s - Math.floor(s / 60) * 60;
  return (s + (sec >= 30 ? 60 - sec : -sec)) * 1000;
}

// All times of one civil day number at a place, as UTC instants in ms:
// { fajr, sunrise, dhuhr, asr, sunset, maghrib, isha }. Isha can fall after midnight of the
// next civil date. Returns null when the sun does not rise and set on that day or the day after.
function dayTimes(lat, lon, dayNumber) {
  var today = Sun.solarDay(dayNumber, lat, lon);
  var tomorrow = Sun.solarDay(dayNumber + 1, lat, lon);
  var sunrise = instant(dayNumber, today.sunrise);
  var sunset = instant(dayNumber, today.sunset);
  var nextSunrise = instant(dayNumber + 1, tomorrow.sunrise);
  if (!isFinite(sunrise) || !isFinite(sunset) || !isFinite(nextSunrise)) { return null; }
  var night = nextSunrise - sunset;

  var fajr = instant(dayNumber, today.atAltitude(-FAJR_ANGLE, false));
  var safeFajr = sunrise - night * FAJR_ANGLE / 60;
  if (!isFinite(fajr) || safeFajr > fajr) { fajr = safeFajr; }
  var isha = instant(dayNumber, today.atAltitude(-ISHA_ANGLE, true));
  var safeIsha = sunset + night * ISHA_ANGLE / 60;
  if (!isFinite(isha) || safeIsha < isha) { isha = safeIsha; }

  var asr = instant(dayNumber, today.afternoon(ASR_SHADOW));
  var dhuhr = instant(dayNumber, today.transit) + DHUHR_ADJUST_MIN * 60000;
  var out = {
    fajr: roundMinute(fajr), sunrise: roundMinute(sunrise), dhuhr: roundMinute(dhuhr),
    asr: roundMinute(asr), sunset: roundMinute(sunset), maghrib: roundMinute(sunset), isha: roundMinute(isha)
  };
  for (var k in out) {
    if (!isFinite(out[k])) { return null; }
  }
  return out;
}
