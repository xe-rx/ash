'use strict';
var test = require('node:test');
var assert = require('node:assert');
var h = require('./helpers');

test('test helper: amsterdam offsets match Intl at the DST instants', function () {
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' });
  [Date.UTC(2026, 2, 29, 0, 59), Date.UTC(2026, 2, 29, 1, 0), Date.UTC(2026, 9, 25, 0, 59),
    Date.UTC(2026, 9, 25, 1, 0), Date.UTC(2028, 2, 26, 1, 0), Date.UTC(2028, 9, 29, 0, 59)].forEach(function (ms) {
    var want = fmt.format(new Date(ms));
    var got = h.fmtLocal(ms, h.amsterdamOffset(ms)).slice(0, 2);
    assert.strictEqual(got, want);
  });
});
