'use strict';
const { P, contrast } = require('./palette');
const S = require('./svg');
const L = require('./layout');

const ROWS = [['Fajr', '06:39'], ['Dhuhr', '12:39'], ['Asr', '14:14'], ['Maghrib', '18:26'], ['Isha', '20:01']];
const NEXT = 3;
const T = (x, y, s, o, txt) => S.el('text', Object.assign({ x, y, font_family: 'Poppins', font_size: s }, o), txt);

// Live text layer: clock, tag, Hijri header, five rows with the next one in madder. x0..x1 is the table column.
function text(x0, x1) {
  const out = [], cx = 350;
  out.push(T(cx, 290, 176, { text_anchor: 'middle', font_weight: 600, fill: P.cream }, '18:12'));
  out.push(S.rect(206, 318, 150, 40, { fill: P.cream }));
  out.push(T(281, 347, 24, { text_anchor: 'middle', font_weight: 600, fill: P.ground }, 'Maghrib'));
  out.push(T(374, 347, 24, { font_weight: 400, fill: P.cream }, 'in 14 min'));
  out.push(T((x0 + x1) / 2, L.HDR.y + 38, 21, { text_anchor: 'middle', font_weight: 400, fill: P.cream, letter_spacing: 3.5 }, '12 RAJAB 1448'));
  ROWS.forEach((r, i) => {
    const y = L.ROWS.y + i * L.ROWS.h, base = y + L.ROWS.h / 2 + 10, next = i === NEXT, past = i < NEXT;
    if (next) out.push(S.rect(x0, y, x1 - x0, L.ROWS.h, { fill: P.madder }));
    const col = next ? P.cream : past ? P.passed : P.cream;
    out.push(T(x0 + 24, base, 27, { font_weight: next ? 600 : 400, fill: col }, r[0]));
    out.push(T(x1 - 24, base + 1, 31, { text_anchor: 'end', font_weight: next ? 600 : 300, fill: col }, r[1]));
  });
  return out.join('\n');
}
function report() {
  return { cream_on_ground: contrast(P.cream, P.ground), passed_on_ground: contrast(P.passed, P.ground), cream_on_madder: contrast(P.cream, P.madder), ground_on_cream: contrast(P.ground, P.cream) };
}
module.exports = { text, report };
