.pragma library
.import "clock.js" as Clock
// The prayer table sits in the dark field of the baked lattice panel (assets/lattice.png, art scene C): a date
// strip on top, five evenly spaced rows below it. The numbers are measured on that art; the rows and text are live.
// Times sit in fixed digit cells so the columns line up although the digits are proportional.
var QATA = { x: 704, y: 0, w: 320, h: 600 };           // the lattice panel on the right edge (wash and image)
var FIELD = { x: 718, w: 292 };                        // the dark field inside the lattice frame
var DATE_Y = 36, DATE_H = 58;                          // the date strip
var ROWS_Y = 124, ROW_H = 68;                          // five rows; thin rules between them are baked
var END_Y = ROWS_Y + 5 * ROW_H;                        // 464
var PAD = 24;                                          // text inset from the field's edges
var NAME_X = FIELD.x + PAD, TIME_RIGHT = FIELD.x + FIELD.w - PAD;
var NAME_PX = 26, TIME_PX = 30;

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
  return { qata: QATA, rows: rows, header: { x: FIELD.x, y: DATE_Y, w: FIELD.w, h: DATE_H } };
}
