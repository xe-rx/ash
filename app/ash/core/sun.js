.pragma library
// Low-precision solar position (Meeus, "Astronomical Algorithms", ch. 12, 13, 15, 25, 28):
// good to a few seconds for sunrise/sunset and well under a degree for altitude.
// Pure math: no clock, no Date. Angles in degrees unless a name says otherwise.

var RAD = Math.PI / 180;
var JD_UNIX_EPOCH = 2440587.5;
var SUN_HORIZON_DEG = -50 / 60; // centre of the sun at sunrise/sunset: refraction + radius

function norm(x, max) { return x - max * Math.floor(x / max); }
function unwind(a) { return norm(a, 360); }
function sin(deg) { return Math.sin(deg * RAD); }
function cos(deg) { return Math.cos(deg * RAD); }

function julianDayOfDay(dayNumber) { return dayNumber + JD_UNIX_EPOCH; } // 0h UT of that civil day
function julianDayOfMs(ms) { return ms / 86400000 + JD_UNIX_EPOCH; }

// Apparent solar coordinates at a Julian day:
// { decl, ra (degrees), sidereal (apparent sidereal time at Greenwich, degrees) }.
function solarCoordinates(jd) {
  var t = (jd - 2451545.0) / 36525;
  var l0 = unwind(280.4664567 + 36000.76983 * t + 0.0003032 * t * t);
  var moonL = unwind(218.3165 + 481267.8813 * t);
  var node = unwind(125.04452 - 1934.136261 * t + 0.0020708 * t * t + t * t * t / 450000);
  var m = unwind(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  var centre = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(m) +
    (0.019993 - 0.000101 * t) * sin(2 * m) + 0.000289 * sin(3 * m);
  var omega = 125.04 - 1934.136 * t;
  var lambda = unwind(l0 + centre - 0.00569 - 0.00478 * sin(omega));
  var theta0 = unwind(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t * t * t / 38710000);
  var dPsi = -17.2 / 3600 * sin(node) - 1.32 / 3600 * sin(2 * l0) - 0.23 / 3600 * sin(2 * moonL) + 0.21 / 3600 * sin(2 * node);
  var dEps = 9.2 / 3600 * cos(node) + 0.57 / 3600 * cos(2 * l0) + 0.1 / 3600 * cos(2 * moonL) - 0.09 / 3600 * cos(2 * node);
  var eps0 = 23.439291 - 0.013004167 * t - 0.0000001639 * t * t + 0.0000005036 * t * t * t;
  var eps = eps0 + 0.00256 * cos(omega);
  return {
    decl: Math.asin(sin(eps) * sin(lambda)) / RAD,
    ra: unwind(Math.atan2(cos(eps) * sin(lambda), cos(lambda)) / RAD),
    sidereal: theta0 + dPsi * cos(eps0 + dEps)
  };
}

// Altitude and azimuth (degrees; azimuth clockwise from north) of the sun at an instant.
function position(ms, lat, lon) {
  var s = solarCoordinates(julianDayOfMs(ms));
  var h = unwind(s.sidereal + lon - s.ra); // local hour angle, west positive
  var sinAlt = sin(lat) * sin(s.decl) + cos(lat) * cos(s.decl) * cos(h);
  var alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD;
  var az = Math.atan2(sin(h), cos(h) * sin(lat) - Math.tan(s.decl * RAD) * cos(lat)) / RAD + 180;
  return { altitudeDeg: alt, azimuthDeg: unwind(az) };
}

function interpolate(y2, y1, y3, n) {
  var a = y2 - y1;
  var b = y3 - y2;
  return y2 + n / 2 * (a + b + n * (b - a));
}

function interpolateAngles(y2, y1, y3, n) {
  var a = unwind(y2 - y1);
  var b = unwind(y3 - y2);
  return y2 + n / 2 * (a + b + n * (b - a));
}

// Solar events for one civil day number at a place. Times are hours of UT counted from 0h UT
// of that day (they can fall below 0 or above 24 far from Greenwich). NaN when the event
// does not occur (sun never reaches that altitude).
function solarDay(dayNumber, lat, lon) {
  var jd = julianDayOfDay(dayNumber);
  var today = solarCoordinates(jd);
  var prev = solarCoordinates(jd - 1);
  var next = solarCoordinates(jd + 1);
  var lw = -lon;
  var m0 = norm((today.ra + lw - today.sidereal) / 360, 1);
  var expected = norm((12 - lon / 15) / 24, 1); // keeps m0 on the right side of the date line
  if (m0 - expected > 0.5) { m0 -= 1; } else if (expected - m0 > 0.5) { m0 += 1; }

  function transit() {
    var theta = unwind(today.sidereal + 360.985647 * m0);
    var a = unwind(interpolateAngles(today.ra, prev.ra, next.ra, m0));
    var h = theta - lw - a;
    if (h < -180 || h > 180) { h -= 360 * Math.round(h / 360); }
    return (m0 - h / 360) * 24;
  }

  // Hours of UT when the sun's centre is at altitude `angle`, after or before the transit.
  function atAltitude(angle, afterTransit) {
    var cosH0 = (sin(angle) - sin(lat) * sin(today.decl)) / (cos(lat) * cos(today.decl));
    var h0 = Math.acos(cosH0) / RAD; // NaN when |cosH0| > 1
    var m = afterTransit ? m0 + h0 / 360 : m0 - h0 / 360;
    var theta = unwind(today.sidereal + 360.985647 * m);
    var a = unwind(interpolateAngles(today.ra, prev.ra, next.ra, m));
    var delta = interpolate(today.decl, prev.decl, next.decl, m);
    var h = theta - lw - a;
    var alt = Math.asin(sin(lat) * sin(delta) + cos(lat) * cos(delta) * cos(h)) / RAD;
    return (m + (alt - angle) / (360 * cos(delta) * cos(lat) * sin(h))) * 24;
  }

  return {
    transit: transit(),
    sunrise: atAltitude(SUN_HORIZON_DEG, false),
    sunset: atAltitude(SUN_HORIZON_DEG, true),
    atAltitude: atAltitude,
    afternoon: function (shadowLength) { // Asr: shadow = shadowLength x object + noon shadow
      var tangent = Math.abs(lat - today.decl);
      var angle = Math.atan(1 / (shadowLength + Math.tan(tangent * RAD))) / RAD;
      return atAltitude(angle, true);
    }
  };
}
