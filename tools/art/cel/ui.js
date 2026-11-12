'use strict';
// The UI mock: clock with its hard offset shadow, the next-prayer line, and the times card tinted into the
// moment's hue. Text inks are pulled until they read at 4.5:1; the ratios go into the render report.
const { mix, contrast, ensureContrast } = require('./colour');
const { ROWS } = require('./moments');

const MIN = 4.5;
const CARD = { x: 724, y: 28, w: 276, h: 344, rx: 22 };

// Card colours for a moment: paper mixed toward the key, inks checked against it.
function cardColours(m) {
  const card = mix(m.paper, m.key, m.cardTint), dark = m.moon ? '#ffffff' : '#000000';
  const ink = ensureContrast(m.cardInk, card, MIN, dark);
  const past = ensureContrast(mix(ink, card, 0.42), card, MIN, ink);
  const date = ensureContrast(mix(ink, card, 0.3), card, MIN, ink);
  // The next-prayer row: white, the card ink or a near-black, whichever reads best on the accent.
  const onAccent = ['#ffffff', ink, '#1a1a1a'].sort((a, b) => contrast(b, m.accent) - contrast(a, m.accent))[0];
  const accentInk = ensureContrast(onAccent, m.accent, MIN, onAccent === '#ffffff' ? '#ffffff' : '#000000');
  return { card, ink, past, date, accentInk };
}

function contrastReport(m, c) {
  return [['date line', c.date, c.card], ['row', c.ink, c.card], ['past row', c.past, c.card], ['next-prayer row', c.accentInk, m.accent]]
    .map(([what, fg, bg]) => ({ what, fg, bg, ratio: contrast(fg, bg) }));
}

function clock(m) {
  return `<text x="371" y="285" text-anchor="middle" font-size="112" font-weight="600" fill="${m.inkShadow}">${m.clock}</text>` +
    `<text x="368" y="282" text-anchor="middle" font-size="112" font-weight="600" fill="${m.ink}">${m.clock}</text>` +
    `<text x="368" y="330" text-anchor="middle" font-size="27" font-weight="500" fill="${m.ink}">${m.next[0]} ${m.next[1]}</text>`;
}

function card(m, c) {
  const shadow = mix(m.skyMid, m.amb, 0.5);
  let out = `<rect x="${CARD.x + 2}" y="${CARD.y + 6}" width="${CARD.w - 2}" height="${CARD.h}" rx="${CARD.rx}" fill="${shadow}"/>` +
    `<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.rx}" fill="${c.card}"/>` +
    `<text x="760" y="72" font-size="20" fill="${c.date}">6 Muharram 1448</text>`;
  ROWS.forEach(([name, time], i) => {
    const y = 128 + i * 52, now = i === m.row, colour = now ? c.accentInk : i < m.row ? c.past : c.ink;
    if (now) out += `<rect x="744" y="${y - 33}" width="236" height="46" rx="12" fill="${m.accent}"/>`;
    out += `<text x="760" y="${y}" font-size="24" font-weight="${now ? 600 : 400}" fill="${colour}">${name}</text>` +
      `<text x="963" y="${y}" text-anchor="end" font-size="26" font-weight="600" fill="${colour}">${time}</text>`;
  });
  return out;
}

// Returns the UI markup and the contrast report for the render log.
function ui(m) {
  const c = cardColours(m);
  return { svg: `<g font-family="Poppins">${clock(m)}${card(m, c)}</g>`, report: contrastReport(m, c) };
}

module.exports = { ui, CARD, cardColours };
