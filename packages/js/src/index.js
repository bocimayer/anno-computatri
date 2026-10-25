// Anno Computatri (AC) is a calendar that counts years from 1970, the Unix epoch used by Unix, Linux, macOS, Android and iOS, so 1970 CE is year 0 AC.
// Originated by Gabor Mayer in 2023.
//
// AC keeps Gregorian months, days and leap years; only the year number changes.
// CE years use astronomical numbering here: 1 CE = 1, 1 BCE = 0, 2 BCE = -1.
// Unix time ignores leap seconds. All times are UTC.

export const EPOCH_YEAR = 1970;
export const SYMBOL = "⏀";

const DAY = 86400;

export function ceYearToAc(ceYear) {
  assertInteger(ceYear, "ceYear");
  return ceYear - EPOCH_YEAR;
}

export function acYearToCe(acYear) {
  assertInteger(acYear, "acYear");
  return acYear + EPOCH_YEAR;
}

// Leap years follow the CE year, not the AC year: 52 AC (2022 CE) is divisible by 4 but is not a leap year.
export function isLeapYear(acYear) {
  const y = acYearToCe(acYear);
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(acYear, month) {
  assertRange(month, 1, 12, "month");
  if (month === 2) return isLeapYear(acYear) ? 29 : 28;
  return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

// Days since 1970-01-01 for a proleptic Gregorian date (y is the CE year, astronomical).
function daysFromCivil(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(z) {
  z += 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}

/** Convert Unix seconds (integer, may be negative) to an AC date. */
export function fromUnix(unix) {
  assertInteger(unix, "unix");
  const days = Math.floor(unix / DAY);
  const rem = unix - days * DAY;
  const { y, m, d } = civilFromDays(days);
  return {
    year: ceYearToAc(y),
    month: m,
    day: d,
    hour: Math.floor(rem / 3600),
    minute: Math.floor((rem % 3600) / 60),
    second: rem % 60,
  };
}

/** Convert an AC date { year, month, day, hour?, minute?, second? } to Unix seconds. */
export function toUnix(ac) {
  const { year, month, day, hour, minute, second } = normalize(ac);
  return daysFromCivil(acYearToCe(year), month, day) * DAY + hour * 3600 + minute * 60 + second;
}

/** Convert a CE date { year, month, day, ... } to an AC date. Only the year changes. */
export function fromCe(ce) {
  const ac = { ...ce, year: ceYearToAc(ce.year) };
  return normalize(ac);
}

/** Convert an AC date to a CE date. Only the year changes. */
export function toCe(ac) {
  const n = normalize(ac);
  return { ...n, year: acYearToCe(n.year) };
}

/** Convert a JavaScript Date (read in UTC) to an AC date. */
export function fromDate(date) {
  return fromUnix(Math.floor(date.getTime() / 1000));
}

/** Convert an AC date to a JavaScript Date. Throws RangeError if outside the Date range. */
export function toDate(ac) {
  const d = new Date(toUnix(ac) * 1000);
  if (Number.isNaN(d.getTime())) throw new RangeError("AC date is outside the JavaScript Date range");
  return d;
}

/** Current AC date (UTC). */
export function now() {
  return fromDate(new Date());
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Format an AC date.
 *   "universal" (default): "⏀ 56-10-24 14:28:28"
 *   "dual": "2026 CE / 56 AC"
 */
export function format(ac, { style = "universal" } = {}) {
  const n = normalize(ac);
  if (style === "dual") {
    const ce = acYearToCe(n.year);
    const label = ce >= 1 ? `${ce} CE` : `${1 - ce} BCE`;
    return `${label} / ${n.year} AC`;
  }
  if (style !== "universal") throw new RangeError(`unknown style ${style}`);
  return `${SYMBOL} ${n.year}-${pad(n.month)}-${pad(n.day)} ${pad(n.hour)}:${pad(n.minute)}:${pad(n.second)}`;
}

const DATE_RE = /^\s*(?:⏀\s*)?(-?\d+)-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*$/;

/** Parse "56-10-24", "⏀ 56-10-24 14:28:28" or "-1-07-20T20:17:40" into an AC date. Throws on bad input. */
export function parse(text) {
  return normalize(fields(text));
}

/** Parse a CE date such as "2026-10-24 14:28:28" and return it as a validated CE date. */
export function parseCe(text) {
  const f = fields(text);
  return toCe(normalize({ ...f, year: ceYearToAc(f.year) }));
}

function fields(text) {
  const m = DATE_RE.exec(String(text));
  if (!m) throw new SyntaxError(`cannot parse date ${JSON.stringify(text)}; use YEAR-MM-DD [HH:MM[:SS]]`);
  const [year, month, day, hour, minute, second] = m.slice(1).map((g) => (g === undefined ? 0 : Number(g)));
  return { year, month, day, hour, minute, second };
}

function normalize(ac) {
  const n = {
    year: ac.year,
    month: ac.month,
    day: ac.day,
    hour: ac.hour ?? 0,
    minute: ac.minute ?? 0,
    second: ac.second ?? 0,
  };
  assertInteger(n.year, "year");
  assertRange(n.month, 1, 12, "month");
  assertRange(n.day, 1, daysInMonth(n.year, n.month), "day");
  assertRange(n.hour, 0, 23, "hour");
  assertRange(n.minute, 0, 59, "minute");
  assertRange(n.second, 0, 59, "second");
  return n;
}

function assertInteger(v, name) {
  if (!Number.isInteger(v)) throw new TypeError(`${name} must be an integer`);
}

function assertRange(v, lo, hi, name) {
  assertInteger(v, name);
  if (v < lo || v > hi) throw new RangeError(`${name} must be between ${lo} and ${hi}`);
}
