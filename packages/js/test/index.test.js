import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  ceYearToAc, acYearToCe, isLeapYear, fromUnix, toUnix, fromCe, toCe, fromDate, toDate, format, parse, parseCe, daysInMonth,
} from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const vectors = JSON.parse(readFileSync(join(here, "..", "..", "..", "spec", "vectors.json"), "utf8"));

test("year offset", () => {
  assert.equal(ceYearToAc(1970), 0);
  assert.equal(ceYearToAc(2026), 56);
  assert.equal(ceYearToAc(1969), -1);
  assert.equal(acYearToCe(68), 2038);
});

test("unix <-> AC vectors", () => {
  for (const v of vectors.unix) {
    assert.deepEqual(fromUnix(v.unix), v.ac, `fromUnix ${v.unix} (${v.note})`);
    assert.equal(toUnix(v.ac), v.unix, `toUnix ${v.unix} (${v.note})`);
    assert.equal(toCe(v.ac).year, v.ce_year);
  }
});

test("leap years follow the CE year", () => {
  for (const v of vectors.leap_years) {
    assert.equal(isLeapYear(v.ac_year), v.leap, `${v.ac_year} AC = ${v.ce_year} CE`);
    assert.equal(acYearToCe(v.ac_year), v.ce_year);
  }
  assert.equal(daysInMonth(54, 2), 29);
  assert.equal(daysInMonth(52, 2), 28);
});

test("format", () => {
  for (const v of vectors.format) {
    assert.equal(format(v.ac), v.universal);
    assert.equal(format(v.ac, { style: "dual" }), v.dual);
  }
});

test("parse", () => {
  for (const v of vectors.parse) assert.deepEqual(parse(v.text), v.ac, v.text);
  for (const v of vectors.format) assert.deepEqual(parse(v.universal), v.ac);
});

test("invalid input throws", () => {
  for (const text of vectors.invalid) assert.throws(() => parse(text), undefined, JSON.stringify(text));
  assert.throws(() => fromUnix(1.5), TypeError);
  assert.throws(() => toUnix({ year: 56, month: 2, day: 30 }), RangeError);
});

test("parseCe validates with CE leap rules", () => {
  assert.deepEqual(parseCe("2024-02-29"), { year: 2024, month: 2, day: 29, hour: 0, minute: 0, second: 0 });
  assert.throws(() => parseCe("2023-02-29"), RangeError);
  assert.deepEqual(fromCe(parseCe("2026-10-24 14:28:28")), { year: 56, month: 10, day: 24, hour: 14, minute: 28, second: 28 });
});

test("CE and AC dates differ only in the year", () => {
  const ac = fromCe({ year: 2026, month: 10, day: 24, hour: 14, minute: 28, second: 28 });
  assert.deepEqual(ac, { year: 56, month: 10, day: 24, hour: 14, minute: 28, second: 28 });
  assert.deepEqual(toCe(ac), { year: 2026, month: 10, day: 24, hour: 14, minute: 28, second: 28 });
});

test("agrees with JavaScript Date across 1 CE to 9999 CE", () => {
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const lo = Date.UTC(2000, 0, 1) / 1000 - 4000 * 365.2425 * 86400;
  const hi = 253402300799;
  for (let i = 0; i < 20000; i++) {
    const unix = Math.floor(lo + rnd() * (hi - lo));
    const d = new Date(unix * 1000);
    const ac = fromUnix(unix);
    assert.equal(acYearToCe(ac.year), d.getUTCFullYear(), `year at ${unix}`);
    assert.equal(ac.month, d.getUTCMonth() + 1);
    assert.equal(ac.day, d.getUTCDate());
    assert.equal(ac.hour, d.getUTCHours());
    assert.equal(toUnix(ac), unix);
    assert.equal(fromDate(toDate(ac)).year, ac.year);
  }
});
