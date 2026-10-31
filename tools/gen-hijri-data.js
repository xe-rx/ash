'use strict';
// One-off generator for app/ash/core/hijri-data.js (not part of the app, not a dependency).
// Usage: node tools/gen-hijri-data.js <dir of the unpacked @tabby_ai/hijri-converter 1.0.5 package>
// Reads its MONTH_STARTS (Reduced Julian Days of every Umm al-Qura month start, 1343-1500 AH)
// and keeps 1446-1500 AH as month lengths. RJD r is the civil day (r - 40588) since 1970-01-01.
var path = require('path');
var dir = process.argv[2];
if (!dir) { console.error('usage: node tools/gen-hijri-data.js <unpacked package dir>'); process.exit(1); }
var table = require(path.resolve(dir, 'dist/_lib/ummalqura.js')).MONTH_STARTS;
var FIRST = 1446, LAST = 1500, BASE_YEAR = 1343;
var days = table.map(function (r) { return r - 40588; });
var rows = [];
for (var y = FIRST; y <= LAST; y++) {
  var s = '';
  for (var m = 1; m <= 12; m++) {
    var i = (y - BASE_YEAR) * 12 + m - 1;
    var len = (i + 1 < days.length ? days[i + 1] : days[i] + 30) - days[i];
    if (len !== 29 && len !== 30) { throw new Error('month length ' + len + ' at ' + y + '-' + m); }
    s += len === 30 ? '1' : '0';
  }
  rows.push('  "' + s + '"');
}
var last = (LAST - BASE_YEAR) * 12 + 11;
console.log('firstYear=' + FIRST + ' firstDay=' + days[(FIRST - BASE_YEAR) * 12] + ' lastMonthStart=' + days[last]);
console.log(rows.join(',\n'));
