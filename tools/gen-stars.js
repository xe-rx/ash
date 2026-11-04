'use strict';
// One-off generator for app/ash/assets/stars.png (not part of the app, not a dependency).
// Usage: node tools/gen-stars.js [outdir]
// Fixed colours only; geometric shapes only; deterministic (an LCG, no Math.random).
var fs = require('fs'), zlib = require('zlib'), path = require('path');
var CLEAR = [0, 0, 0, 0];
function crcTable() { var t = [], i, k, c; for (i = 0; i < 256; i++) { c = i; for (k = 0; k < 8; k++) { c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; } t.push(c >>> 0); } return t; }
var TABLE = crcTable();
function crc(buf) { var c = 0xffffffff, j; for (j = 0; j < buf.length; j++) { c = TABLE[(c ^ buf[j]) & 255] ^ (c >>> 8); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  var len = Buffer.alloc(4), cb = Buffer.alloc(4), body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  len.writeUInt32BE(data.length, 0); cb.writeUInt32BE(crc(body), 0);
  return Buffer.concat([len, body, cb]);
}
function png(w, h, pixel) { // pixel(x, y) -> [r, g, b] or [r, g, b, a]
  var raw = Buffer.alloc((w * 4 + 1) * h), x, y, p, o;
  for (y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (x = 0; x < w; x++) {
      p = pixel(x, y); o = y * (w * 4 + 1) + 1 + x * 4;
      raw[o] = p[0]; raw[o + 1] = p[1]; raw[o + 2] = p[2]; raw[o + 3] = p.length > 3 ? p[3] : 255;
    }
  }
  var head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// stars.png, 1024 x 360: a dense field of stars in three brightness levels (alpha 0.4, 0.7, 1; 1 and 2 px, a few
// 3 px crosses), thinning out towards the horizon glow (no stars below y 300). Fixed colour #cfd3f0; deterministic LCG.
var starPx = {}, seed = 20261104;
function rnd() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
(function () {
  var n, x, y, level, size, a, dx, dy, k;
  for (n = 0; n < 420; n++) {
    x = Math.floor(rnd() * 1024); y = Math.floor(rnd() * 300);
    if (rnd() > Math.min(1, (320 - y) / 200)) { continue; }
    k = rnd(); level = k < 0.6 ? 0 : (k < 0.9 ? 1 : 2); a = [0.4, 0.7, 1][level] * 255;
    size = level === 2 ? 2 : 1;
    for (dx = 0; dx < size; dx++) { for (dy = 0; dy < size; dy++) { starPx[(x + dx) + ',' + (y + dy)] = a; } }
    if (level === 2 && rnd() < 0.5) { starPx[(x - 1) + ',' + y] = 110; starPx[(x + 2) + ',' + y] = 110; starPx[x + ',' + (y - 1)] = 110; starPx[x + ',' + (y + 2)] = 110; }
  }
})();
function stars(x, y) { var a = starPx[x + ',' + y]; return a ? [207, 211, 240, Math.round(a)] : CLEAR; }

var dir = process.argv[2] || path.join(__dirname, '..', 'app', 'ash', 'assets');
[['stars.png', 1024, 360, stars]].forEach(function (a) {
  var buf = png(a[1], a[2], a[3]), f = path.join(dir, a[0]);
  fs.writeFileSync(f, buf); console.log(f + ': ' + buf.length + ' bytes');
});
