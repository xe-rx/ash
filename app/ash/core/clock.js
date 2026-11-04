.pragma library
// The clock and the countdown, placed in the open sky under the sun's arc, centred on it.
// Poppins digits are proportional and Qt 5.11 cannot switch on tabular figures, so each character
// is placed by its ink: every visible gap is the same (a "1" gets no extra air) and the colon stays
// at the centre, so it never moves between minutes. Metrics are the advance and the left/right ink
// bearings at 140 px of Poppins SemiBold (what Font.Medium resolves to), read in Qt 5.11 with
// QFontMetricsF; they scale linearly with the size (tests/qt/font_metrics.py checks the sizes in use).

var CLOCK_CX = 365;
var CLOCK_PX = 120, CLOCK_GAP_EM = 0.08;
var CLOCK_INK_TOP = 192;                 // y of the top of the digits (a multiple of the 8 px unit)
var INK_TOP_EM = 0.30, INK_BOTTOM_EM = 1.07; // digit ink relative to the Text item's top, per px
var COLON_RAISE_EM = 0.057;              // Poppins' colon sits low; raised to the digits' middle
var COUNTDOWN_PX = 24, COUNTDOWN_Y = 304, COUNTDOWN_H = 40, COUNTDOWN_EM_PER_CHAR = 0.55; // the tag + text line; width bound, measured 0.50
var TAG_PAD = 12;                        // tag padding left and right
var BASE_PX = 140;
var GLYPH_METRICS = {
  "0": [90.4, 7, 6.4], "1": [50.7, 5, 11.7], "2": [80.4, 6, 4.4], "3": [83.9, 6, 7.9], "4": [92.5, 6, 4.5],
  "5": [90.2, 11, 7.2], "6": [89.6, 9, 7.6], "7": [76.7, 4, 3.7], "8": [90.0, 8, 8.0], "9": [87.6, 9, 7.6],
  ":": [36.8, 6, 5.8]
};

// [advance, left bearing, right bearing] of a character at px
function glyphMetrics(ch, px) {
  var m = GLYPH_METRICS[ch] || GLYPH_METRICS["0"], f = px / BASE_PX;
  return [m[0] * f, m[1] * f, m[2] * f];
}

// One entry per character: ch, x of the Text item (its glyph origin), colon flag, and the ink
// extent inkLeft..inkRight, all in screen pixels. The colon's ink is centred on CLOCK_CX.
function clockGlyphs(text) {
  var px = CLOCK_PX, gap = CLOCK_GAP_EM * px;
  var n = text.length, colonAt = text.indexOf(":");
  if (colonAt < 0) { colonAt = n; }
  var out = [], i, m, ink;
  for (i = 0; i < n; i++) {
    m = glyphMetrics(text.charAt(i), px);
    out.push({ ch: text.charAt(i), colon: i === colonAt, x: 0, inkLeft: 0, inkRight: m[0] - m[1] - m[2] });
  }
  if (colonAt < n) {
    ink = out[colonAt].inkRight;
    out[colonAt].inkLeft = CLOCK_CX - ink / 2; out[colonAt].inkRight = CLOCK_CX + ink / 2;
  }
  var edge = colonAt < n ? out[colonAt].inkLeft : CLOCK_CX;
  for (i = colonAt - 1; i >= 0; i--) { // hours grow leftwards from the colon
    ink = out[i].inkRight;
    out[i].inkRight = edge - gap; out[i].inkLeft = out[i].inkRight - ink; edge = out[i].inkLeft;
  }
  edge = colonAt < n ? out[colonAt].inkRight : CLOCK_CX;
  for (i = colonAt + 1; i < n; i++) { // minutes grow rightwards
    ink = out[i].inkRight;
    out[i].inkLeft = edge + gap; out[i].inkRight = out[i].inkLeft + ink; edge = out[i].inkRight;
  }
  for (i = 0; i < n; i++) { out[i].x = out[i].inkLeft - glyphMetrics(out[i].ch, px)[1]; }
  return out;
}

// y of the Text item of a clock character
function clockTextY(isColon) { return CLOCK_INK_TOP - INK_TOP_EM * CLOCK_PX - (isColon ? COLON_RAISE_EM * CLOCK_PX : 0); }

// Boxes the sun must stay clear of: the digits' ink and a width bound for the countdown line.
function clockBox(text) {
  var g = clockGlyphs(text);
  return { x: g[0].inkLeft, y: CLOCK_INK_TOP, w: g[g.length - 1].inkRight - g[0].inkLeft, h: (INK_BOTTOM_EM - INK_TOP_EM) * CLOCK_PX };
}
function countdownBox(text) {
  var w = text.length * COUNTDOWN_EM_PER_CHAR * COUNTDOWN_PX + 2 * TAG_PAD;
  return { x: CLOCK_CX - w / 2, y: COUNTDOWN_Y, w: w, h: COUNTDOWN_H };
}
