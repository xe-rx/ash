.pragma library
.import "geometry.js" as Geo
.import "colour.js" as C
// The sky: a smooth vertical gradient through the nine stops of the palette (skyStops). Stops 0..7 lie above
// and behind the clock and the countdown and are held dark enough for cream ink (palette.js); stop 8 is the
// horizon colour. The sky rectangle runs from SKY_TOP (16 px past the top edge, for the
// burn-in shift) to the horizon. Qt's Gradient mixes linearly in sRGB between stops; skyColorAt does
// the same, so tests and the moon cut-out see the colour the screen shows.

var SKY_TOP = -16, SKY_H = Geo.HORIZON - SKY_TOP;
var STOP_Y = [12, 65, 112, 150, 190, 247, 296, 344, 370];
var STOPS = (function () {
  var out = [];
  for (var i = 0; i < 9; i++) { out.push((STOP_Y[i] - SKY_TOP) / SKY_H); }
  return out;
})();

function skyColorAt(bands, y) {
  var f = (y - SKY_TOP) / SKY_H, i;
  if (f <= STOPS[0]) { return bands[0]; }
  if (f >= STOPS[8]) { return bands[8]; }
  for (i = 1; i < 9; i++) {
    if (f <= STOPS[i]) {
      var t = (f - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]), a = C.hexToRgb(bands[i - 1]), b = C.hexToRgb(bands[i]);
      return C.rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
  }
  return bands[8];
}
