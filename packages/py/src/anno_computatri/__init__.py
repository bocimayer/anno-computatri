"""Convert between Gregorian (CE), Anno Computatri (AC) and Unix time.

Anno Computatri (AC) is a calendar that counts years from 1970, the Unix epoch used by Unix, Linux, macOS, Android and iOS, so 1970 CE is year 0 AC.
Originated by Gabor Mayer in 2023.

AC keeps Gregorian months, days and leap years; only the year number changes. CE years use astronomical
numbering here: 1 CE = 1, 1 BCE = 0, 2 BCE = -1. Unix time ignores leap seconds. All times are UTC.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import NamedTuple

__all__ = [
    "EPOCH_YEAR", "SYMBOL", "AcDate", "CeDate", "ce_year_to_ac", "ac_year_to_ce", "is_leap_year", "days_in_month",
    "from_unix", "to_unix", "from_ce", "to_ce", "from_datetime", "to_datetime", "now", "format", "parse", "parse_ce",
]

__version__ = "0.1.0"

EPOCH_YEAR = 1970
SYMBOL = "⏀"

_DAY = 86400


@dataclass(frozen=True)
class AcDate:
    """An Anno Computatri date and time in UTC. `year` is the AC year (CE year minus 1970)."""

    year: int
    month: int
    day: int
    hour: int = 0
    minute: int = 0
    second: int = 0

    def __post_init__(self) -> None:
        for name in ("year", "month", "day", "hour", "minute", "second"):
            if not isinstance(getattr(self, name), int) or isinstance(getattr(self, name), bool):
                raise TypeError(f"{name} must be an int")
        _check(self.month, 1, 12, "month")
        _check(self.hour, 0, 23, "hour")
        _check(self.minute, 0, 59, "minute")
        _check(self.second, 0, 59, "second")
        _check(self.day, 1, days_in_month(self.year, self.month), "day")


class CeDate(NamedTuple):
    """A Gregorian date and time in UTC. `year` is the CE year (astronomical: 1 BCE = 0)."""

    year: int
    month: int
    day: int
    hour: int = 0
    minute: int = 0
    second: int = 0


def _check(value: int, lo: int, hi: int, name: str) -> None:
    if not lo <= value <= hi:
        raise ValueError(f"{name} must be between {lo} and {hi}")


def ce_year_to_ac(ce_year: int) -> int:
    return ce_year - EPOCH_YEAR


def ac_year_to_ce(ac_year: int) -> int:
    return ac_year + EPOCH_YEAR


def is_leap_year(ac_year: int) -> bool:
    """Leap years follow the CE year: 52 AC (2022 CE) is divisible by 4 but is not a leap year."""
    y = ac_year_to_ce(ac_year)
    return (y % 4 == 0 and y % 100 != 0) or y % 400 == 0


def days_in_month(ac_year: int, month: int) -> int:
    _check(month, 1, 12, "month")
    if month == 2:
        return 29 if is_leap_year(ac_year) else 28
    return (31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)[month - 1]


def _days_from_civil(y: int, m: int, d: int) -> int:
    y -= 1 if m <= 2 else 0
    era = y // 400
    yoe = y - era * 400
    doy = (153 * (m + (-3 if m > 2 else 9)) + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468


def _civil_from_days(z: int) -> tuple[int, int, int]:
    z += 719468
    era = z // 146097
    doe = z - era * 146097
    yoe = (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365
    doy = doe - (365 * yoe + yoe // 4 - yoe // 100)
    mp = (5 * doy + 2) // 153
    d = doy - (153 * mp + 2) // 5 + 1
    m = mp + 3 if mp < 10 else mp - 9
    return yoe + era * 400 + (1 if m <= 2 else 0), m, d


def from_unix(unix: int) -> AcDate:
    """Convert Unix seconds (an int, may be negative) to an AC date."""
    if not isinstance(unix, int) or isinstance(unix, bool):
        raise TypeError("unix must be an int")
    days, rem = divmod(unix, _DAY)
    y, m, d = _civil_from_days(days)
    return AcDate(ce_year_to_ac(y), m, d, rem // 3600, (rem % 3600) // 60, rem % 60)


def to_unix(ac: AcDate) -> int:
    """Convert an AC date to Unix seconds."""
    return _days_from_civil(ac_year_to_ce(ac.year), ac.month, ac.day) * _DAY + ac.hour * 3600 + ac.minute * 60 + ac.second


def from_ce(ce: CeDate) -> AcDate:
    """Convert a CE date to an AC date. Only the year changes."""
    ce = CeDate(*ce)
    return AcDate(ce_year_to_ac(ce.year), ce.month, ce.day, ce.hour, ce.minute, ce.second)


def to_ce(ac: AcDate) -> CeDate:
    """Convert an AC date to a CE date. Only the year changes."""
    return CeDate(ac_year_to_ce(ac.year), ac.month, ac.day, ac.hour, ac.minute, ac.second)


def from_datetime(dt: datetime) -> AcDate:
    """Convert a datetime to an AC date. Naive datetimes are read as UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return from_unix(int(dt.timestamp()) if dt.microsecond == 0 else int(dt.replace(microsecond=0).timestamp()))


def to_datetime(ac: AcDate) -> datetime:
    """Convert an AC date to an aware UTC datetime. Raises ValueError outside CE years 1 to 9999."""
    ce = ac_year_to_ce(ac.year)
    if not 1 <= ce <= 9999:
        raise ValueError("datetime supports CE years 1 to 9999; use to_unix instead")
    return datetime(ce, ac.month, ac.day, ac.hour, ac.minute, ac.second, tzinfo=timezone.utc)


def now() -> AcDate:
    """Current AC date (UTC)."""
    return from_datetime(datetime.now(timezone.utc))


def format(ac: AcDate, style: str = "universal") -> str:  # noqa: A001
    """Format an AC date: "universal" gives "⏀ 56-10-24 14:28:28", "dual" gives "2026 CE / 56 AC"."""
    if style == "dual":
        ce = ac_year_to_ce(ac.year)
        label = f"{ce} CE" if ce >= 1 else f"{1 - ce} BCE"
        return f"{label} / {ac.year} AC"
    if style != "universal":
        raise ValueError(f"unknown style {style!r}")
    return f"{SYMBOL} {ac.year}-{ac.month:02d}-{ac.day:02d} {ac.hour:02d}:{ac.minute:02d}:{ac.second:02d}"


_DATE_RE = re.compile(r"^\s*(?:⏀\s*)?(-?\d+)-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*$")


def _fields(text: str) -> tuple[int, ...]:
    m = _DATE_RE.match(str(text))
    if not m:
        raise ValueError(f"cannot parse date {text!r}; use YEAR-MM-DD [HH:MM[:SS]]")
    return tuple(int(g) if g is not None else 0 for g in m.groups())


def parse(text: str) -> AcDate:
    """Parse "56-10-24", "⏀ 56-10-24 14:28:28" or "-1-07-20T20:17:40" into an AC date. Raises ValueError."""
    return AcDate(*_fields(text))


def parse_ce(text: str) -> CeDate:
    """Parse a CE date such as "2026-10-24 14:28:28" and validate it with the CE leap rules."""
    ce = CeDate(*_fields(text))
    from_ce(ce)  # raises ValueError for impossible dates such as 2023-02-29
    return ce
