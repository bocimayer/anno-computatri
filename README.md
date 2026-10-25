# anno-computatri

Anno Computatri (AC) is a calendar that counts years from 1970, the Unix epoch used by Unix, Linux, macOS, Android and iOS, so 1970 CE is year 0 AC. Originated by Gabor Mayer in 2023.

This repository holds two small libraries, one for JavaScript (npm) and one for Python (PyPI), that convert between Gregorian (CE) dates, AC dates, and Unix time. Both have no dependencies, share one set of test vectors, and give the same answers.

Status: version 0.1.0, not yet published to npm or PyPI. Anno Computatri is a proposal, not a calendar in official use. Website, FAQ and white papers: <https://annocomputatri.net/>.

## What AC changes, and what it does not

Only the year number changes. Months, days, weekdays, leap years and times of day stay Gregorian. To convert, subtract 1970 from the CE year (add 1970 to go back).

| CE | AC |
|---|---|
| 1969 | -1 |
| 1970 | 0 |
| 2000 | 30 |
| 2026 | 56 |
| 2038 | 68 |

Two details that trip people up:

- Leap years follow the CE year, not the AC year. 52 AC (2022 CE) is divisible by 4 but is not a leap year; 54 AC (2024 CE) is a leap year.
- Before 1970 the AC year is negative (1969 CE is -1 AC). We use astronomical numbering for CE years, so 1 BCE is year 0 CE and -1970 AC. Unix time ignores leap seconds, and so do these libraries.

The universal AC format is `⏀ 56-10-24 14:28:28` (year, month, day, time in UTC). A dual notation, `2026 CE / 56 AC`, is useful where readers may not know AC.

## JavaScript

```js
import { fromUnix, toUnix, fromCe, toCe, format, parse } from "anno-computatri";

const ac = fromUnix(1792852108);   // { year: 56, month: 10, day: 24, hour: 14, minute: 28, second: 28 }
format(ac);                        // "⏀ 56-10-24 14:28:28"
format(ac, { style: "dual" });     // "2026 CE / 56 AC"
toUnix(parse("⏀ 68-01-19 03:14:07")); // 2147483647
```

Command line: `npx anno-computatri` is not set up yet; from a checkout run `node packages/js/bin/ac.js now`.

## Python

```python
from anno_computatri import from_unix, to_unix, parse, format

ac = from_unix(1792852108)         # AcDate(year=56, month=10, day=24, hour=14, minute=28, second=28)
format(ac)                         # '⏀ 56-10-24 14:28:28'
format(ac, "dual")                 # '2026 CE / 56 AC'
to_unix(parse("⏀ 68-01-19 03:14:07"))  # 2147483647
```

Command line, from a checkout: `PYTHONPATH=packages/py/src python -m anno_computatri now`.

## Tests

```bash
cd packages/js && npm test
cd packages/py && PYTHONPATH=src python -m unittest discover -s tests
```

Both suites read `spec/vectors.json`, which holds the conformance vectors (Unix epoch, Apollo 11, year 2000, the 2038 overflow, 1900 and year 0). Both also compare 20,000 random timestamps from 1 CE to 9999 CE against the language's own date library.

## How to cite

Cite the idea with the white paper, and the code with this software entry. A DOI will be added here when the papers and the software are deposited on Zenodo.

```bibtex
@misc{mayer2024anno,
  author = {Mayer, Gabor},
  title  = {Anno Computatri: A Calendar System for the Digital Age},
  year   = {2024},
  month  = dec,
  note   = {White paper, 20 December 2024},
  url    = {https://annocomputatri.net/white-papers/}
}

@software{mayer2026annolib,
  author  = {Mayer, Gabor},
  title   = {anno-computatri: converters between CE, Anno Computatri and Unix time},
  year    = {2026},
  version = {0.1.0},
  url     = {https://annocomputatri.net/}
}
```

In text, write the first mention as "Anno Computatri (AC), a calendar that counts years from 1970, the Unix epoch" and give the date in dual notation, for example "24 October 2026 CE / 56 AC".

## Related and earlier ideas

AC is a proposal in a field with prior art. The Holocene (Human Era) calendar, proposed by Cesare Emiliani in 1993, also changes only the year number (CE plus 10,000). Unix time itself counts seconds, not years, and has no year numbering. Informal suggestions to count years from the Unix epoch have appeared in mailing lists (for example a 2018 TUHS thread), without a defined notation. If you know of other work we should list, please open an issue.

## License

MIT, see `LICENSE`. The text on annocomputatri.net has its own terms.
