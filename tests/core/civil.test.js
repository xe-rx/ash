'use strict';
var test = require('node:test');
var assert = require('node:assert');
var C = require('./load-core').load('civil.js');

test('daysFromCivil and civilFromDays round trip over 1970-2100', function () {
  for (var z = 0; z < 130 * 366; z += 7) {
    var c = C.civilFromDays(z);
    assert.strictEqual(C.daysFromCivil(c.y, c.m, c.d), z);
    var d = new Date(z * 86400000);
    assert.deepStrictEqual([c.y, c.m, c.d], [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]);
  }
});

test('civilFromDays handles leap days', function () {
  assert.strictEqual(JSON.stringify(C.civilFromDays(C.daysFromCivil(2028, 2, 29))), '{"y":2028,"m":2,"d":29}');
  assert.strictEqual(C.daysFromCivil(2028, 3, 1) - C.daysFromCivil(2028, 2, 28), 2);
  assert.strictEqual(C.daysFromCivil(2100, 3, 1) - C.daysFromCivil(2100, 2, 28), 1);
});

test('formatClock gives zero padded 24h text in the local offset', function () {
  var ms = Date.UTC(2026, 5, 20, 22, 7);
  assert.strictEqual(C.formatClock(ms, 120), '00:07');
  assert.strictEqual(C.formatClock(ms, 0), '22:07');
  assert.strictEqual(C.formatClock(Date.UTC(2026, 0, 1, 9, 5), 60), '10:05');
  assert.strictEqual(C.formatClock(-60000, 0), '23:59');
});

test('localDay floors to the civil day with the offset applied', function () {
  assert.strictEqual(C.localDay(Date.UTC(2026, 5, 20, 22, 30), 120), C.daysFromCivil(2026, 6, 21));
  assert.strictEqual(C.localDay(Date.UTC(2026, 5, 20, 21, 59), 120), C.daysFromCivil(2026, 6, 20));
});
