'use strict';
// One-off generator for app/ash/assets/weave.png and rug.png (not part of the app, not a dependency).
// Usage: node tools/gen-weave.js [outdir]
// weave.png, 304 x 64, the pattern bands of the prayer table (core/table.js, one unit = 8 px), top to bottom:
//   y 0..7   stripe: madder and cream pick, 8 px each
//   y 8..31  band: eight-point stars (two squares) on goat-hair black, fine cream rules top and bottom
//   y 32..39 stripe again
//   y 40..63 fringe: cream threads, 4 px wide every 8 px, uneven lengths, transparent between
// rug.png, 48 x 16: the border of the family's rug, a row of nested diamonds between two rules.
// Fixed colours only; geometric shapes only; deterministic (no random numbers).
var fs = require('fs'), zlib = require('zlib'), path = require('path');
var GROUND = [29, 23, 21], CREAM = [239, 228, 207], MADDER = [168, 50, 42], CLEAR = [0, 0, 0, 0];

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

function stripe(x) { return x % 16 < 8 ? MADDER : CREAM; }
function band(x, y) { // 24 x 24 repeat
  if (y === 1 || y === 22) { return CREAM; }
  var dx = Math.abs((x % 24) - 11.5), dy = Math.abs(y - 11.5);
  var square = dx <= 7 && dy <= 7, diamond = dx + dy <= 10.5;
  if (dx <= 3 && dy <= 3) { return MADDER; }
  if (dx <= 5 && dy <= 5 && dx >= 4) { return GROUND; }
  if (square || diamond) { return CREAM; }
  return GROUND;
}
function weave(x, y) {
  if (y < 8 || (y >= 32 && y < 40)) { return stripe(x); }
  if (y < 32) { return band(x, y - 8); }
  var col = Math.floor(x / 8), len = 16 + (col * 7) % 9; // 16..24
  return x % 8 < 4 && y - 40 < len ? CREAM : CLEAR;
}
function rug(x, y) { // 48 x 16
  if (y === 1 || y === 14) { return CREAM; }
  var dx = Math.abs((x % 48 % 24) - 11.5), dy = Math.abs(y - 7.5), d = dx + dy;
  if (d <= 2.5) { return MADDER; }
  if (d <= 4.5) { return GROUND; }
  if (d <= 7) { return CREAM; }
  return GROUND;
}

var dir = process.argv[2] || path.join(__dirname, '..', 'app', 'ash', 'assets');
[['weave.png', 304, 64, weave], ['rug.png', 48, 16, rug]].forEach(function (a) {
  var buf = png(a[1], a[2], a[3]), f = path.join(dir, a[0]);
  fs.writeFileSync(f, buf); console.log(f + ': ' + buf.length + ' bytes');
});
