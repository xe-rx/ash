'use strict';
// Reference prayer times from adhan-js (devDependency, tests only): MWL, TwilightAngle, Standard Asr.
var adhan = require('adhan');

function reference(lat, lon, y, m, d) {
  var params = adhan.CalculationMethod.MuslimWorldLeague();
  params.highLatitudeRule = adhan.HighLatitudeRule.TwilightAngle;
  params.madhab = adhan.Madhab.Shafi;
  var pt = new adhan.PrayerTimes(new adhan.Coordinates(lat, lon), new Date(y, m - 1, d), params);
  return {
    fajr: pt.fajr.getTime(), sunrise: pt.sunrise.getTime(), dhuhr: pt.dhuhr.getTime(),
    asr: pt.asr.getTime(), sunset: pt.sunset.getTime(), maghrib: pt.maghrib.getTime(), isha: pt.isha.getTime()
  };
}

module.exports = { reference: reference };
