'use strict';
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var G = load('geometry.js');

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

test('the colon never moves more than 12 px between two consecutive minutes (all 1440)', function () {
  var worst = 0, prev = null;
  for (var minute = 0; minute <= 1440; minute++) {
    var glyphs = G.clockGlyphs(text(minute % 1440));
    var colon = glyphs[2];
    assert.ok(colon.colon, 'third character is the colon');
    if (prev !== null) { worst = Math.max(worst, Math.abs(colon.x - prev)); }
    prev = colon.x;
  }
  assert.strictEqual(worst, 0, 'colon moved ' + worst + ' px'); // stricter than the 12 px bound
});

test('the colon sits in the middle between hours and minutes, with equal ink gaps', function () {
  for (var minute = 0; minute < 1440; minute++) {
    var g = G.clockGlyphs(text(minute));
    assert.ok(Math.abs(g[2].inkLeft - g[1].inkRight - (g[3].inkLeft - g[2].inkRight)) < 0.01, text(minute));
  }
});

test('ink gaps between digits are even, around a 1 as everywhere else', function () {
  var lo = 1e9, hi = -1e9;
  for (var minute = 0; minute < 1440; minute++) {
    digitGaps(G.clockGlyphs(text(minute))).forEach(function (d) { lo = Math.min(lo, d); hi = Math.max(hi, d); });
  }
  assert.ok(hi - lo < 1, 'digit gaps range ' + lo + '..' + hi);
  assert.ok(lo > 8 && hi < 24);
});

test('the clock fits between the labels and in the sun arc for every minute', function () {
  var box = G.OBSTACLES[1];
  for (var minute = 0; minute < 1440; minute++) {
    var g = G.clockGlyphs(text(minute));
    assert.ok(g[0].inkLeft >= box.x && g[4].inkRight <= box.x + box.w, text(minute) + ' wider than its box');
  }
});
