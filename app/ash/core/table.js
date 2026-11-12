.pragma library
.import "clock.js" as Clock
// The times card (the cel stills, tools/art/cel/ui.js): a rounded card at the right over a hard shadow, the
// Hijri date on top, five rows below it, the next prayer on an accent pill. Everything is live (card, inks and
// accent from the palette). Text is placed by its baseline, as the stills were authored: a Poppins Text item's
// baseline sits BASELINE_EM below its top. Times sit in fixed digit cells so the columns line up although
// the digits are proportional.
var CARD = { x: 724, y: 28, w: 276, h: 344, r: 22 };
var SHADOW = { x: 726, y: 34, w: 274, h: 344 };     // the card's shadow: 2 px right, 6 px down, same radius
var BASELINE_EM = 1.05;
var DATE_PX = 20, DATE_BASE = 72;                    // the date line's size and baseline
var ROW_BASE = 128, ROW_STEP = 52;                   // baselines of the five rows
var NAME_X = 760, NAME_PX = 24;
var TIME_RIGHT = 963, TIME_PX = 26;
var PILL = { x: 744, dy: -33, w: 236, h: 46, r: 12 }; // the next prayer's pill, its top dy from the row's baseline
var TEXT_W = CARD.x + CARD.w - 20 - NAME_X;          // the width a date line may take (220)

function textTop(baseline, px) { return baseline - BASELINE_EM * px; }

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

function rowBaseline(i) { return ROW_BASE + i * ROW_STEP; }

// Everything the card draws, from a scene. A prayer is past when it comes before the next one in the list.
function tableLayout(scene) {
  var rows = [], i, p, b, nextAt = 0;
  for (i = 0; i < scene.prayers.length; i++) { if (scene.prayers[i].isNext) { nextAt = i; } }
  for (i = 0; i < scene.prayers.length; i++) {
    p = scene.prayers[i]; b = rowBaseline(i);
    rows.push({ baseline: b, nameY: textTop(b, NAME_PX), timeY: textTop(b, TIME_PX), pillY: b + PILL.dy,
      name: p.name, isNext: p.isNext, isPast: i < nextAt, glyphs: timeGlyphs(p.timeText) });
  }
  return { card: CARD, shadow: SHADOW, date: { x: NAME_X, y: textTop(DATE_BASE, DATE_PX), w: TEXT_W }, rows: rows };
}
