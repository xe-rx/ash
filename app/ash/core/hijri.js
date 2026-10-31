.pragma library
.import "hijri-data.js" as Data
// Umm al-Qura Hijri date from a civil day number, offline, from the embedded month table.
// The date changes at local midnight. Month names are defined here and nowhere else.

var MONTH_NAMES = ["Muharram", "Safar", "Rabi I", "Rabi II", "Jumada I", "Jumada II",
  "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"];

// { day, monthNumber, monthName, year, text } for civil day number + offsetDays, or null
// outside the table (1446-1500 AH, up to 16 November 2077).
function hijriFor(dayNumber, offsetDays) {
  var day = dayNumber + offsetDays - Data.HIJRI_FIRST_DAY;
  if (day < 0) { return null; }
  for (var y = 0; y < Data.HIJRI_YEARS.length; y++) {
    var lengths = Data.HIJRI_YEARS[y];
    for (var m = 0; m < 12; m++) {
      var len = lengths.charAt(m) === "1" ? 30 : 29;
      if (day < len) {
        var year = Data.HIJRI_FIRST_YEAR + y;
        var name = MONTH_NAMES[m];
        return { day: day + 1, monthNumber: m + 1, monthName: name, year: year,
          text: (day + 1) + " " + name + " " + year };
      }
      day -= len;
    }
  }
  return null;
}
