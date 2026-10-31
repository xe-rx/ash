'use strict';
// The sun's halos are translucent circles over the sky, so the clock and the countdown can sit on
// a halo. Here the real composite is computed (band colour, then each halo at its own radius and
// alpha, largest first as Sun.qml draws them) and the text must still read at 4.5:1.
var test = require('node:test');
var assert = require('node:assert');
var load = require('./load-core').load;
var H = require('./helpers');
var G = load('geometry.js'), K = load('clock.js'), P = load('palette.js'), C = load('colour.js'), Scene = load('scene.js');

var STEP_DAYS = +process.env.HALO_DAYS || 5, STEP_MIN = +process.env.HALO_MIN || 12;
function blend(under, over, a) { // over at alpha a on under, in sRGB like the renderer
  var u = C.hexToRgb(under), o = C.hexToRgb(over);
  return C.rgbToHex([u[0] + (o[0] - u[0]) * a, u[1] + (o[1] - u[1]) * a, u[2] + (o[2] - u[2]) * a]);
}
function bandAt(pal, y) {
  for (var i = 0; i < 9; i++) { if (y < G.BANDS[i + 1]) { return pal.skyBands[i]; } }
  return pal.skyBands[8];
}
function backgroundAt(pal, view, x, y) {
  var bg = bandAt(pal, y);
  for (var k = 4; k >= 0; k--) {
    var dx = x - view.x, dy = y - view.y;
    if (view.look.glowVisible && dx * dx + dy * dy <= view.look.haloR[k] * view.look.haloR[k]) { bg = blend(bg, k >= 3 ? pal.glow : pal.halo, view.look.haloAlpha[k]); }
  }
  return bg;
}

test('clock and countdown keep 4.5:1 over the sun halos, every sample of the year in 3 places', function () {
  var worst = 99, where = '', n = 0;
  [H.PLACES.utrecht, H.PLACES.maastricht, H.PLACES.groningen].forEach(function (place) {
    for (var day = 0; day < 365; day += STEP_DAYS) {
      for (var m = 0; m < 1440; m += STEP_MIN) {
        var s = Scene.sceneAt(H.ams(2026, 1, 1 + day, 0, 0) + m * 60000 + 3600000, H.amsterdamOffset, place);
        var view = G.sunView(s);
        if (!view.look.glowVisible) { continue; }
        var pal = P.paletteAt(s.sun.altitudeDeg, s.sun.azimuthDeg < 180);
        [[K.clockBox(s.clockText), pal.inkSky], [K.countdownBox(s.next.countdownText), pal.accentSky]].forEach(function (t) {
          var b = t[0];
          for (var i = 0; i <= 12; i++) {
            for (var j = 0; j <= 4; j++) {
              var bg = backgroundAt(pal, view, b.x + b.w * i / 12, b.y + b.h * j / 4), c = C.contrast(t[1], bg);
              n++;
              if (c < worst) { worst = c; where = 'day ' + day + ' min ' + m + ' alt ' + s.sun.altitudeDeg.toFixed(1); }
            }
          }
        });
      }
    }
  });
  console.log('# worst text contrast over halos ' + worst.toFixed(2) + ' (' + where + '), ' + n + ' samples');
  assert.ok(n > 10000);
  assert.ok(worst >= 4.5, 'contrast over a halo ' + worst.toFixed(2) + ' at ' + where);
});
