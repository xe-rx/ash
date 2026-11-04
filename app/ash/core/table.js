.pragma library
.import "clock.js" as Clock
// The prayer table is a woven band (qata) on the right edge: pattern bands, the Hijri date, five rows (name
// left, time right) and a fringe. Times sit in fixed digit cells so the columns line up although the digits
// are proportional.

// UNIT is the one pick of the weave: every row, band and gap of the table is a multiple of it.
var UNIT = 8;
var QATA = { x: 720, y: 0, w: 304, h: 600 };           // the woven band, full height on the right edge
// vertical sections, top to bottom (in px): pattern band 24, stripe 8, date 64, stripe 8, five rows of 88, stripe 8, band 24, fringe 24
var BAND_H = 3 * UNIT, STRIPE_H = UNIT, DATE_H = 8 * UNIT, ROW_H = 11 * UNIT, FRINGE_H = 3 * UNIT;
var DATE_Y = BAND_H + STRIPE_H;                        // 32
var ROWS_Y = DATE_Y + DATE_H + STRIPE_H;               // 104
var END_Y = ROWS_Y + 5 * ROW_H;                        // 544: where the closing stripe starts
var PAD = 3 * UNIT;                                    // text inset from the band's edges
var NAME_X = QATA.x + PAD, TIME_RIGHT = QATA.x + QATA.w - PAD;
var NAME_PX = 3 * UNIT, TIME_PX = 4 * UNIT;

// widest digit advance at TIME_PX: every digit gets a cell this wide, ink centred in it
function digitCell() { return Clock.glyphMetrics("4", TIME_PX)[0]; }

// "13:42" -> one entry per character with the x of its Text item, right-aligned at TIME_RIGHT
function timeGlyphs(text) {
  var cell = digitCell(), colon = Clock.glyphMetrics(":", TIME_PX), out = [], i, ch, m, w = 0, widths = [];
  for (i = 0; i < text.length; i++) { widths.push(text.charAt(i) === ":" ? colon[0] : cell); w += widths[i]; }
  var x = TIME_RIGHT - w;
  for (i = 0; i < text.length; i++) {
    ch = text.charAt(i); m = Clock.glyphMetrics(ch, TIME_PX);
    out.push({ ch: ch, x: x + (widths[i] - (m[0] - m[1] - m[2])) / 2 - m[1], inkLeft: x + (widths[i] - (m[0] - m[1] - m[2])) / 2,
      inkRight: x + (widths[i] + (m[0] - m[1] - m[2])) / 2 });
    x += widths[i];
  }
  return out;
}

function rowTop(i) { return ROWS_Y + i * ROW_H; }

// Everything the table draws, from a scene. A prayer is passed when it comes before the next one in the list.
function tableLayout(scene) {
  var rows = [], i, p, nextAt = 0;
  for (i = 0; i < scene.prayers.length; i++) { if (scene.prayers[i].isNext) { nextAt = i; } }
  for (i = 0; i < scene.prayers.length; i++) {
    p = scene.prayers[i];
    rows.push({ y: rowTop(i), name: p.name, isNext: p.isNext, isPast: i < nextAt, glyphs: timeGlyphs(p.timeText) });
  }
  return { qata: QATA, rows: rows, header: { x: NAME_X, y: DATE_Y, w: QATA.w - 2 * PAD, h: DATE_H } };
}
