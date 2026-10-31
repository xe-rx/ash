.pragma library
.import "clock.js" as Clock
// The prayer table on the right: one flat panel with the Hijri date as its header, then five rows
// (name left, time right) and a thin rail on the left edge whose dot shows where now falls between
// the rows. Times sit in fixed digit cells so the columns line up although the digits are proportional.

var PANEL = { x: 724, y: 28, w: 276, h: 344 };
var HEADER_H = 64, ROW_H = 52, ROWS_Y = PANEL.y + 76;
var RAIL_X = PANEL.x + 16;
var FILL_X = PANEL.x + 30, FILL_W = PANEL.w - 30 - 12;
var NAME_X = PANEL.x + 44, TIME_RIGHT = PANEL.x + PANEL.w - 26;
var TIME_PX = 27;

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

// Everything the table draws, from a scene.
function tableLayout(scene) {
  var rows = [], i, p;
  for (i = 0; i < scene.prayers.length; i++) {
    p = scene.prayers[i];
    rows.push({ y: rowTop(i), name: p.name, isNext: p.isNext, glyphs: timeGlyphs(p.timeText) });
  }
  var first = rowTop(0) + ROW_H / 2, last = rowTop(4) + ROW_H / 2;
  return { panel: PANEL, rows: rows, header: { x: PANEL.x + 30, y: PANEL.y + 14, w: PANEL.w - 42 },
    rail: { x: RAIL_X, y1: first, y2: last, dotY: first + scene.railRow * ROW_H } };
}
