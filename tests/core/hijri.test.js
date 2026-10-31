'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var Civil = load('civil.js');
var Hijri = load('hijri.js');

function at(y, m, d, off) { return Hijri.hijriFor(Civil.daysFromCivil(y, m, d), off || 0); }
function key(h) { return h.day + ' ' + h.monthName + ' ' + h.year; }

// Month starts of the Umm al-Qura calendar. These agree with two independent tables
// (.NET UmAlQuraCalendar, ICU 78.3 umalqura). UNVERIFIED against the official KACST
// site (ummulqura.org.sa is a script-rendered page that could not be read offline).
test('known Umm al-Qura month starts', function () {
  assert.strictEqual(key(at(2025, 3, 1)), '1 Ramadan 1446');
  assert.strictEqual(key(at(2025, 3, 30)), '1 Shawwal 1446');
  assert.strictEqual(key(at(2025, 6, 6)), '10 Dhu al-Hijjah 1446');
  assert.strictEqual(key(at(2025, 6, 26)), '1 Muharram 1447');
  assert.strictEqual(key(at(2026, 2, 18)), '1 Ramadan 1447');
  assert.strictEqual(key(at(2026, 6, 16)), '1 Muharram 1448');
});

test('the day before a month start is the last day of the previous month', function () {
  assert.strictEqual(key(at(2025, 2, 28)), '29 Shaban 1446');
  assert.strictEqual(key(at(2026, 6, 15)), '29 Dhu al-Hijjah 1447');
});

test('hijriOffsetDays shifts the date by one day either way', function () {
  assert.strictEqual(key(at(2025, 3, 1, 1)), '2 Ramadan 1446');
  assert.strictEqual(key(at(2025, 3, 1, -1)), '29 Shaban 1446');
});

test('text is "<day> <month> <year>" and months use the single list of names', function () {
  var h = at(2026, 10, 31);
  assert.strictEqual(h.text, h.day + ' ' + h.monthName + ' ' + h.year);
  assert.strictEqual(Hijri.MONTH_NAMES.length, 12);
  assert.strictEqual(Hijri.MONTH_NAMES[4], 'Jumada I');
});

test('every day 2025-2077 converts, advancing one day at a time', function () {
  var prev = null;
  for (var z = Civil.daysFromCivil(2025, 1, 1); z <= Civil.daysFromCivil(2077, 11, 16); z++) {
    var h = Hijri.hijriFor(z, 0);
    assert.ok(h && h.day >= 1 && h.day <= 30, 'day ' + z);
    if (prev) {
      var same = h.year === prev.year && h.monthNumber === prev.monthNumber;
      assert.ok(same ? h.day === prev.day + 1 : (h.day === 1 && prev.day >= 29), 'step ' + z);
    }
    prev = h;
  }
});

test('outside the table range gives null', function () {
  assert.strictEqual(Hijri.hijriFor(Civil.daysFromCivil(2024, 7, 6), 0), null);
  assert.strictEqual(Hijri.hijriFor(Civil.daysFromCivil(2077, 11, 17), 0), null);
  assert.strictEqual(Hijri.hijriFor(Civil.daysFromCivil(2077, 11, 16), 1), null);
});
