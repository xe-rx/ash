'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var C = load('clock.js');

function text(minute) {
  var h = Math.floor(minute / 60), m = minute % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
function digitGaps(glyphs) { // visible ink gaps between neighbouring digits (colon excluded)
  var out = [];
  for (var i = 1; i < glyphs.length; i++) {
    if (glyphs[i].colon || glyphs[i - 1].colon) { continue; }
    out.push(glyphs[i].inkLeft - glyphs[i - 1].inkRight);
  }
  return out;
}

test('the colon never moves between minutes (all 1440, with the wrap)', function () {
  var worst = 0, prev = null;
  for (var minute = 0; minute <= 1440; minute++) {
    var glyphs = C.clockGlyphs(text(minute % 1440));
    assert.ok(glyphs[2].colon, 'third character is the colon');
    if (prev !== null) { worst = Math.max(worst, Math.abs(glyphs[2].x - prev)); }
    prev = glyphs[2].x;
  }
  assert.strictEqual(worst, 0, 'colon moved ' + worst + ' px');
});

test('the colon sits in the middle between hours and minutes, with equal ink gaps', function () {
  for (var minute = 0; minute < 1440; minute++) {
    var g = C.clockGlyphs(text(minute));
    assert.ok(Math.abs(g[2].inkLeft - g[1].inkRight - (g[3].inkLeft - g[2].inkRight)) < 0.01, text(minute));
  }
});

test('ink gaps between digits are even, around a 1 as everywhere else', function () {
  var lo = 1e9, hi = -1e9;
  for (var minute = 0; minute < 1440; minute++) {
    digitGaps(C.clockGlyphs(text(minute))).forEach(function (d) { lo = Math.min(lo, d); hi = Math.max(hi, d); });
  }
  assert.ok(hi - lo < 1, 'digit gaps range ' + lo + '..' + hi);
  assert.ok(lo > 6 && hi < 18);
});

test('the colon sits on the arc centre and the clock is centred on it within 40 px, every minute', function () {
  for (var minute = 0; minute < 1440; minute++) {
    var g = C.clockGlyphs(text(minute)), mid = (g[0].inkLeft + g[4].inkRight) / 2;
    assert.ok(Math.abs((g[2].inkLeft + g[2].inkRight) / 2 - C.CLOCK_CX) < 0.01);
    assert.ok(Math.abs(mid - C.CLOCK_CX) < 40, text(minute) + ' centre ' + mid);
  }
});

test('glyph metrics scale linearly with the size', function () {
  assert.ok(Math.abs(C.glyphMetrics('4', 70)[0] - C.glyphMetrics('4', 140)[0] / 2) < 1e-9);
});
