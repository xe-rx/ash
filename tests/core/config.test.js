'use strict';
var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var Config = require('./load-core').load('config.js');

function bad(cfg) {
  var r = Config.validate(cfg);
  assert.strictEqual(r.ok, false);
  assert.ok(typeof r.error === 'string' && r.error.length > 10);
  return r.error;
}

test('the example config is valid', function () {
  var cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ash.example.json'), 'utf8'));
  var r = Config.validate(cfg);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.lat, 52.09);
  assert.strictEqual(r.lon, 5.12);
  assert.strictEqual(r.hijriOffsetDays, 0);
});

test('boundary coordinates are valid', function () {
  [[90, 180], [-90, -180], [0, 0]].forEach(function (p) {
    assert.strictEqual(Config.validate({ lat: p[0], lon: p[1], hijriOffsetDays: 0 }).ok, true);
  });
});

test('out of range, non-finite, wrong type and 3-decimal coordinates are rejected', function () {
  [90.01, -90.01, NaN, Infinity, '52.09', null, undefined, 52.091].forEach(function (v) {
    bad({ lat: v, lon: 5.12, hijriOffsetDays: 0 });
  });
  [180.01, -181, NaN, '5.12', undefined, 5.123].forEach(function (v) {
    bad({ lat: 52.09, lon: v, hijriOffsetDays: 0 });
  });
});

test('hijriOffsetDays must be -1, 0 or 1; missing means 0', function () {
  [-2, 2, 0.5, '1', NaN, null].forEach(function (v) {
    bad({ lat: 52.09, lon: 5.12, hijriOffsetDays: v });
  });
  assert.strictEqual(Config.validate({ lat: 52.09, lon: 5.12 }).hijriOffsetDays, 0);
  assert.strictEqual(Config.validate({ lat: 52.09, lon: 5.12, hijriOffsetDays: -1 }).hijriOffsetDays, -1);
});

test('non-objects are rejected and errors never echo config values', function () {
  [null, undefined, 5, 'x', [1]].forEach(bad);
  var e = bad({ lat: 91.37, lon: 0, hijriOffsetDays: 0 });
  assert.ok(e.indexOf('91') === -1);
});
