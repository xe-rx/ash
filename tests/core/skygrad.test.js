'use strict';
// Sky B: the smooth gradient is the nine band colours as stops at the band centres, mixed linearly
// in sRGB (what Rectangle's Gradient does). These tests hold what the poster-band tests held for it.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var Grad = load('skygrad.js'), P = load('palette.js'), C = load('colour.js'), G = load('geometry.js'), K = load('clock.js');
function pal(alt, rising) { return JSON.parse(JSON.stringify(P.paletteAt(alt, rising))); }

test('stops rise in order inside the sky rectangle (top edge -16, horizon 380); the text stops (0..7) end below the countdown', function () {
  var s = JSON.parse(JSON.stringify(Grad.STOPS));
  assert.strictEqual(s.length, 9);
  for (var i = 0; i < 9; i++) {
    var y = Grad.SKY_TOP + s[i] * Grad.SKY_H;
    assert.ok(y > 0 && y < G.HORIZON, 'stop ' + i + ' at ' + y);
    if (i) { assert.ok(s[i] > s[i - 1]); }
  }
  assert.ok(Grad.SKY_TOP + s[7] * Grad.SKY_H >= K.COUNTDOWN_Y + K.COUNTDOWN_H, 'stop 7 is above the end of the countdown');
});

test('the gradient has exactly the band colour at every stop, and the end bands beyond', function () {
  var p = pal(20, true);
  for (var i = 0; i < 9; i++) {
    assert.strictEqual(Grad.skyColorAt(p.skyStops, Grad.SKY_TOP + Grad.STOPS[i] * Grad.SKY_H), p.skyStops[i]);
  }
  assert.strictEqual(Grad.skyColorAt(p.skyStops, -16), p.skyStops[0]);
  assert.strictEqual(Grad.skyColorAt(p.skyStops, 380), p.skyStops[8]);
});

test('text keeps 4.5:1 on the gradient wherever it lies (every 3 px behind the clock and the countdown, every altitude, rising and setting)', function () {
  var worst = 99;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 0.5) {
      var p = pal(alt, rising);
      for (var y = K.CLOCK_INK_TOP; y <= K.COUNTDOWN_Y + K.COUNTDOWN_H; y += 3) {
        var bg = Grad.skyColorAt(p.skyStops, y);
        var c = C.contrast(p.inkSky, bg);
        worst = Math.min(worst, c);
        assert.ok(c >= 4.5, 'contrast ' + c.toFixed(2) + ' at y ' + y + ', alt ' + alt + (rising ? ' rising' : ' setting'));
      }
    }
  });
  console.log('# worst text contrast on the gradient ' + worst.toFixed(2));
});

test('the gradient never steps: neighbouring pixel rows differ by less than 0.02 in OKLab (the steepest part is the short run from the text sky to the horizon colour)', function () {
  var worst = 0;
  [true, false].forEach(function (rising) {
    for (var alt = -90; alt <= 90; alt += 3) {
      var p = pal(alt, rising);
      for (var y = -16; y < 380; y++) { worst = Math.max(worst, C.distance(Grad.skyColorAt(p.skyStops, y), Grad.skyColorAt(p.skyStops, y + 1))); }
    }
  });
  console.log('# largest step between pixel rows ' + worst.toFixed(4));
  assert.ok(worst < 0.02, 'step ' + worst.toFixed(4));
});
