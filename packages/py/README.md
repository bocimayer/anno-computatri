# anno-computatri (Python)

Anno Computatri (AC) is a calendar that counts years from 1970, the Unix epoch used by Unix, Linux, macOS, Android and iOS, so 1970 CE is year 0 AC. Originated by Gabor Mayer in 2023.

Convert between Gregorian (CE) dates, AC dates and Unix time. No dependencies; Python 3.9 or newer.

```python
from anno_computatri import from_unix, to_unix, parse, format

ac = from_unix(1792852108)             # AcDate(year=56, month=10, day=24, hour=14, minute=28, second=28)
format(ac)                             # '⏀ 56-10-24 14:28:28'
format(ac, "dual")                     # '2026 CE / 56 AC'
to_unix(parse("⏀ 68-01-19 03:14:07"))  # 2147483647
```

Functions: `ce_year_to_ac`, `ac_year_to_ce`, `is_leap_year`, `days_in_month`, `from_unix`, `to_unix`, `from_ce`, `to_ce`, `from_datetime`, `to_datetime`, `now`, `format`, `parse`, `parse_ce`. Leap years follow the CE year (52 AC is not a leap year, 54 AC is). Unix time ignores leap seconds. Unlike `datetime`, `from_unix` and `to_unix` work for any year.

Command line: `python -m anno_computatri now`.

Anno Computatri is a proposal, not a calendar in official use. Documentation, citation block and the JavaScript twin: see the repository README. Website: <https://annocomputatri.net/>.

License: MIT.
