'use strict';
// Static guard: Ash's code makes no network calls and stays ES5 and clock free (ADR 0001, 0003).
var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');

var APP = path.join(__dirname, '..', '..', 'app');

function files(dir) {
  return fs.readdirSync(dir).reduce(function (acc, n) {
    var p = path.join(dir, n);
    return acc.concat(fs.statSync(p).isDirectory() ? files(p) : [p]);
  }, []);
}

function code(src) { // drop comments so prose can mention banned words
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
}

var BANNED = [
  ['network: XMLHttpRequest', /XMLHttpRequest/], ['network: WebSocket', /WebSocket/],
  ['network: fetch', /\bfetch\s*\(/], ['network: URL literal', /\b(https?|wss?|ftp):\/\//i],
  ['network: Qt Network', /QtNetwork|NetworkAccessManager/], ['eval', /\beval\s*\(/],
  ['Function constructor', /\bnew\s+Function\b|\bFunction\s*\(/],
  ['clock: Date.now', /Date\.now/], ['clock: new Date()', /new\s+Date\s*\(\s*\)/],
  ['local time getters', /\.(getHours|getMinutes|getSeconds|getDate|getDay|getMonth|getFullYear|getTimezoneOffset)\s*\(/],
  ['ES6: arrow function', /=>/], ['ES6: let/const', /\b(let|const)\s+[\w{[]/], ['ES6: template string', /`/],
  ['ES6: class', /\bclass\s+\w+/], ['I/O: require/import()', /\brequire\s*\(|\bimport\s*\(/]
];

test('app/ has code files to check', function () {
  assert.ok(files(APP).filter(function (f) { return /\.(js|qml)$/.test(f); }).length >= 7);
});

BANNED.forEach(function (rule) {
  test('app/ has no ' + rule[0], function () {
    files(APP).filter(function (f) { return /\.(js|qml)$/.test(f); }).forEach(function (f) {
      var lines = code(fs.readFileSync(f, 'utf8')).split('\n');
      lines.forEach(function (line, i) {
        assert.ok(!rule[1].test(line), path.basename(f) + ':' + (i + 1) + ' ' + rule[0]);
      });
    });
  });
});

test('the static scan catches what it should', function () {
  assert.ok(BANNED[0][1].test('new XMLHttpRequest()'));
  assert.ok(/=>/.test('x => 1') && /\beval\s*\(/.test('eval("1")'));
});
