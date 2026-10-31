.pragma library
.import "civil.js" as Civil
.import "sun.js" as Sun
.import "prayer.js" as Prayer
.import "hijri.js" as Hijri
.import "config.js" as Config
// sceneAt(nowMs, offsetAt, config): everything the view draws, as plain values.
// offsetAt(ms) returns the local UTC offset in minutes at that instant, so a DST change
// between now and a later prayer comes out right. The clock is passed in; nothing here reads it.
//
// Prayer day rule: the current prayer day is the first civil day (searching from yesterday)
// whose Isha has not yet passed. Its five prayers are the list and the next one is the first
// still to come. So at 00:03 on 21 June, 20 June's Isha (00:07) is next; once it has passed
// the list rolls to the 21st and Fajr is next. After Isha on a normal evening, tomorrow's
// Fajr is next and tomorrow's list is shown.

var MIN_MS = 946684800000;   // 2000-01-01
var MAX_MS = 4102444800000;  // 2100-01-01
var NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
var KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

var NO_SUN = "There is no sunrise or sunset at this location around today. Check lat and lon in ash.json.";

function fail(message) { return { ok: false, error: message }; }

function offsetFor(offsetAt, ms) {
  var off = offsetAt(ms);
  if (typeof off !== "number" || !isFinite(off) || off < -720 || off > 840) { throw "offset"; }
  return off;
}

function countdownText(name, minutes) {
  if (minutes < 60) { return name + " in " + minutes + " min"; }
  var m = minutes % 60;
  return name + " in " + Math.floor(minutes / 60) + " h " + (m < 10 ? "0" : "") + m + " min";
}

// Position of the sun between sunrise (0) and sunset (1) of the day whose window holds `ms`.
// Window of day k runs from the middle of the night before it to the middle of the night after,
// so the value is continuous at sunrise, sunset and civil midnight.
function dayProgress(ms, days, times) {
  var chosen = days[days.length - 1];
  for (var i = 1; i < days.length; i++) {
    var mid = (times(days[i - 1]).sunset + times(days[i]).sunrise) / 2;
    if (ms < mid) { chosen = days[i - 1]; break; }
  }
  var t = times(chosen);
  return (ms - t.sunrise) / (t.sunset - t.sunrise);
}

// Position of the sun on the full sun path: 0..1 from sunrise to sunset, then 1..2 from sunset
// through solar midnight to the next sunrise (the night half of the loop). Continuous in time.
function pathProgress(ms, today, times) {
  for (var k = today - 3; k <= today + 3; k++) {
    var t = times(k);
    if (ms >= t.sunrise && ms <= t.sunset) { return (ms - t.sunrise) / (t.sunset - t.sunrise); }
    var next = times(k + 1);
    if (ms > t.sunset && ms < next.sunrise) { return 1 + (ms - t.sunset) / (next.sunrise - t.sunset); }
  }
  return 1.5;
}

function sceneAt(nowMs, offsetAt, config) {
  var cfg = Config.validate(config);
  if (!cfg.ok) { return cfg; }
  if (typeof nowMs !== "number" || !isFinite(nowMs) || nowMs < MIN_MS || nowMs >= MAX_MS) {
    return fail("The time given to Ash is not a valid moment between 2000 and 2100.");
  }
  if (typeof offsetAt !== "function") { return fail("Ash needs a function that gives the local UTC offset."); }
  try {
    return build(nowMs, offsetAt, cfg);
  } catch (e) {
    // A polar day within the days Ash looks at (yesterday to three days ahead) is a sun problem.
    if (e === "polar") { return fail(NO_SUN); }
    return fail("Ash could not read the local time zone offset.");
  }
}

function build(nowMs, offsetAt, cfg) {
  var off = offsetFor(offsetAt, nowMs);
  var today = Civil.localDay(nowMs, off);
  var cache = {};
  function times(day) {
    if (!(day in cache)) { cache[day] = Prayer.dayTimes(cfg.lat, cfg.lon, day); }
    if (cache[day] === null) { throw "polar"; }
    return cache[day];
  }

  var prayerDay = null;
  var t;
  try {
    for (var k = today - 1; k <= today + 1 && prayerDay === null; k++) {
      if (times(k).isha > nowMs) { prayerDay = k; }
    }
    t = times(today);
    times(today - 1); times(today + 1);
  } catch (e) {
    if (e === "polar") { return fail(NO_SUN); }
    throw e;
  }
  if (prayerDay === null) { return fail("Ash could not work out the next prayer."); }

  var day = times(prayerDay);
  var nowMinute = Math.floor(nowMs / 60000) * 60000;
  var prayers = [];
  var next = null;
  for (var i = 0; i < 5; i++) {
    var ms = day[KEYS[i]];
    var isNext = next === null && ms > nowMs;
    var p = { name: NAMES[i], ms: ms, timeText: Civil.formatClock(ms, offsetFor(offsetAt, ms)), isNext: isNext,
      pathProgress: pathProgress(ms, today, times) };
    if (isNext) {
      var minutes = (ms - nowMinute) / 60000;
      next = { name: p.name, ms: ms, timeText: p.timeText, minutesUntil: minutes, countdownText: countdownText(p.name, minutes) };
    }
    prayers.push(p);
  }

  var progress = dayProgress(nowMs, [today - 1, today, today + 1], times);
  var pos = Sun.position(nowMs, cfg.lat, cfg.lon);
  var hijri = Hijri.hijriFor(today, cfg.hijriOffsetDays);
  return {
    ok: true,
    clockText: Civil.formatClock(nowMs, off),
    sun: { altitudeDeg: pos.altitudeDeg, azimuthDeg: pos.azimuthDeg, dayProgress: progress,
      isUp: progress >= 0 && progress <= 1, pathProgress: pathProgress(nowMs, today, times) },
    sunrise: { ms: t.sunrise, timeText: Civil.formatClock(t.sunrise, offsetFor(offsetAt, t.sunrise)) },
    sunset: { ms: t.sunset, timeText: Civil.formatClock(t.sunset, offsetFor(offsetAt, t.sunset)) },
    prayers: prayers,
    next: next,
    hijri: hijri === null ? null : { day: hijri.day, monthName: hijri.monthName, year: hijri.year, text: hijri.text }
  };
}
