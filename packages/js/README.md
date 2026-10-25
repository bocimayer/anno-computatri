# anno-computatri (JavaScript)

Anno Computatri (AC) is a calendar that counts years from 1970, the Unix epoch used by Unix, Linux, macOS, Android and iOS, so 1970 CE is year 0 AC. Originated by Gabor Mayer in 2023.

Convert between Gregorian (CE) dates, AC dates and Unix time. No dependencies; Node 18 or newer.

```js
import { fromUnix, toUnix, parse, format } from "anno-computatri";

const ac = fromUnix(1792852108);      // { year: 56, month: 10, day: 24, hour: 14, minute: 28, second: 28 }
format(ac);                           // "⏀ 56-10-24 14:28:28"
format(ac, { style: "dual" });        // "2026 CE / 56 AC"
toUnix(parse("⏀ 68-01-19 03:14:07")); // 2147483647
```

Functions: `ceYearToAc`, `acYearToCe`, `isLeapYear`, `daysInMonth`, `fromUnix`, `toUnix`, `fromCe`, `toCe`, `fromDate`, `toDate`, `now`, `format`, `parse`, `parseCe`. Leap years follow the CE year (52 AC is not a leap year, 54 AC is). Unix time ignores leap seconds.

Anno Computatri is a proposal, not a calendar in official use. Documentation, citation block and the Python twin: see the repository README. Website: <https://annocomputatri.net/>.

License: MIT.
