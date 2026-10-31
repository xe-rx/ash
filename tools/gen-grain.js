'use strict';
// One-off generator for app/ash/assets/grain.png (not part of the app, not a dependency).
// Usage: node tools/gen-grain.js [outfile]
// A 128 x 128 tile (a power of two, so it also repeats on GLES2) of paper grain for sky B: each pixel is
// white or black with a random alpha, mixing fine noise with a softer 3 x 3 noise so it reads as
// fibres rather than static. White and black are balanced, so laid over the sky at 3-6% opacity it
// shifts neither its lightness nor its colour on average. Grey + alpha, 8 bit; deterministic.
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');

var N = 128, seed = 20261031;
function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }

var fine = [], x, y;
for (y = 0; y < N; y++) { fine.push([]); for (x = 0; x < N; x++) { fine[y].push(rand()); } }
function at(xx, yy) { return fine[(yy + N) % N][(xx + N) % N]; }

var raw = Buffer.alloc((N * 2 + 1) * N); // each row: filter byte 0, then grey + alpha per pixel
for (y = 0; y < N; y++) {
  raw[y * (N * 2 + 1)] = 0;
  for (x = 0; x < N; x++) {
    var soft = 0, dx, dy;
    for (dy = -1; dy <= 1; dy++) { for (dx = -1; dx <= 1; dx++) { soft += at(x + dx, y + dy); } }
    var n = 0.6 * at(x, y) + 0.4 * (soft / 9) * 2.2;
    n = Math.max(-1, Math.min(1, n));
    var o = y * (N * 2 + 1) + 1 + x * 2;
    raw[o] = n >= 0 ? 255 : 0;
    raw[o + 1] = Math.round(255 * Math.min(1, Math.abs(n) * 1.5));
  }
}

var table = [];
for (var i = 0; i < 256; i++) { var c = i; for (var k = 0; k < 8; k++) { c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; } table.push(c >>> 0); }
function crc(buf) { var c = 0xffffffff; for (var j = 0; j < buf.length; j++) { c = table[(c ^ buf[j]) & 255] ^ (c >>> 8); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  var len = Buffer.alloc(4), crcBuf = Buffer.alloc(4), body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  len.writeUInt32BE(data.length, 0); crcBuf.writeUInt32BE(crc(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}
var head = Buffer.alloc(13);
head.writeUInt32BE(N, 0); head.writeUInt32BE(N, 4); head[8] = 8; head[9] = 4; // 8 bit, grey + alpha
var png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
var out = process.argv[2] || path.join(__dirname, '..', 'app', 'ash', 'assets', 'grain.png');
fs.writeFileSync(out, png);
console.log(out + ': ' + png.length + ' bytes');
