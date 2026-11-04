'use strict';
// Tiny SVG string helpers: only geometric primitives are produced by the art modules.
const f = n => (Math.round(n * 10) / 10).toString();
const pts = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
function attrs(o) { return Object.keys(o || {}).map(k => ` ${k.replace(/_/g, '-')}="${o[k]}"`).join(''); }
const el = (tag, o, inner) => inner === undefined ? `<${tag}${attrs(o)}/>` : `<${tag}${attrs(o)}>${inner}</${tag}>`;
const poly = (p, o) => el('polygon', Object.assign({ points: pts(p) }, o));
const line = (a, b, o) => el('line', Object.assign({ x1: f(a[0]), y1: f(a[1]), x2: f(b[0]), y2: f(b[1]) }, o));
const rect = (x, y, w, h, o) => el('rect', Object.assign({ x: f(x), y: f(y), width: f(w), height: f(h) }, o));
const circ = (x, y, r, o) => el('circle', Object.assign({ cx: f(x), cy: f(y), r: f(r) }, o));
const g = (o, inner) => el('g', o, inner);
let uid = 0;
function mkCtx() { return { defs: [], id: p => `${p}${++uid}` }; }
function lin(ctx, stops, o) {
  const id = ctx.id('lg'); o = Object.assign({ x1: 0, y1: 0, x2: 0, y2: 1 }, o);
  ctx.defs.push(el('linearGradient', Object.assign({ id }, o), stops.map(s => el('stop', { offset: s[0], stop_color: s[1], stop_opacity: s[2] === undefined ? 1 : s[2] })).join('')));
  return `url(#${id})`;
}
function rad(ctx, stops, o) {
  const id = ctx.id('rg');
  ctx.defs.push(el('radialGradient', Object.assign({ id }, o), stops.map(s => el('stop', { offset: s[0], stop_color: s[1], stop_opacity: s[2] === undefined ? 1 : s[2] })).join('')));
  return `url(#${id})`;
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function star(cx, cy, R, r, n, rot) {
  const out = []; n = n || 8; rot = rot || 0;
  for (let i = 0; i < n * 2; i++) { const a = rot + Math.PI * i / n - Math.PI / 2, d = i % 2 ? r : R; out.push([cx + d * Math.cos(a), cy + d * Math.sin(a)]); }
  return out;
}
const diamond = (cx, cy, hw, hh) => [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]];
function document(ctx, body, W, H, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n<defs>${ctx.defs.join('\n')}</defs>\n${bg ? rect(0, 0, W, H, { fill: bg }) : ''}\n${body}\n</svg>\n`;
}
module.exports = { f, pts, el, poly, line, rect, circ, g, lin, rad, rng, star, diamond, mkCtx, document };
