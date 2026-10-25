import json
import random
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from anno_computatri import (
    AcDate, CeDate, ac_year_to_ce, ce_year_to_ac, days_in_month, format, from_ce, from_datetime, from_unix,
    is_leap_year, parse, parse_ce, to_ce, to_datetime, to_unix,
)

VECTORS = json.loads((Path(__file__).resolve().parents[3] / "spec" / "vectors.json").read_text(encoding="utf-8"))


def ac(d):
    return AcDate(d["year"], d["month"], d["day"], d["hour"], d["minute"], d["second"])


class CoreTests(unittest.TestCase):
    def test_year_offset(self):
        self.assertEqual(ce_year_to_ac(1970), 0)
        self.assertEqual(ce_year_to_ac(2026), 56)
        self.assertEqual(ce_year_to_ac(1969), -1)
        self.assertEqual(ac_year_to_ce(68), 2038)

    def test_unix_vectors(self):
        for v in VECTORS["unix"]:
            with self.subTest(unix=v["unix"], note=v["note"]):
                self.assertEqual(from_unix(v["unix"]), ac(v["ac"]))
                self.assertEqual(to_unix(ac(v["ac"])), v["unix"])
                self.assertEqual(to_ce(ac(v["ac"])).year, v["ce_year"])

    def test_leap_years_follow_ce_year(self):
        for v in VECTORS["leap_years"]:
            with self.subTest(ac_year=v["ac_year"]):
                self.assertEqual(is_leap_year(v["ac_year"]), v["leap"])
                self.assertEqual(ac_year_to_ce(v["ac_year"]), v["ce_year"])
        self.assertEqual(days_in_month(54, 2), 29)
        self.assertEqual(days_in_month(52, 2), 28)

    def test_format(self):
        for v in VECTORS["format"]:
            with self.subTest(universal=v["universal"]):
                self.assertEqual(format(ac(v["ac"])), v["universal"])
                self.assertEqual(format(ac(v["ac"]), "dual"), v["dual"])

    def test_parse(self):
        for v in VECTORS["parse"]:
            with self.subTest(text=v["text"]):
                self.assertEqual(parse(v["text"]), ac(v["ac"]))
        for v in VECTORS["format"]:
            self.assertEqual(parse(v["universal"]), ac(v["ac"]))

    def test_invalid_input(self):
        for text in VECTORS["invalid"]:
            with self.subTest(text=text):
                with self.assertRaises(ValueError):
                    parse(text)
        with self.assertRaises(TypeError):
            from_unix(1.5)

    def test_ce_conversion(self):
        self.assertEqual(from_ce(CeDate(2026, 10, 24, 14, 28, 28)), AcDate(56, 10, 24, 14, 28, 28))
        self.assertEqual(to_ce(AcDate(56, 10, 24, 14, 28, 28)), CeDate(2026, 10, 24, 14, 28, 28))
        self.assertEqual(parse_ce("2024-02-29"), CeDate(2024, 2, 29, 0, 0, 0))
        with self.assertRaises(ValueError):
            parse_ce("2023-02-29")

    def test_agrees_with_datetime(self):
        rnd = random.Random(12345)
        lo, hi = -62135596800, 253402300799
        for _ in range(20000):
            unix = rnd.randint(lo, hi)
            dt = datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=unix)
            a = from_unix(unix)
            self.assertEqual((ac_year_to_ce(a.year), a.month, a.day, a.hour, a.minute, a.second),
                             (dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second))
            self.assertEqual(to_unix(a), unix)
            self.assertEqual(to_datetime(a), dt)
            self.assertEqual(from_datetime(dt), a)


if __name__ == "__main__":
    unittest.main()
