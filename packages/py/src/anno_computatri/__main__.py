"""Command line: python -m anno_computatri now | ce DATE | ac DATE | unix SECONDS"""
import sys

from . import format, from_ce, from_unix, now, parse, parse_ce, to_ce, to_unix

USAGE = """usage:
  python -m anno_computatri now                       current moment
  python -m anno_computatri ce 2026-10-24 [HH:MM:SS] CE date to AC
  python -m anno_computatri ac 56-10-24 [HH:MM:SS]    AC date to CE and Unix time
  python -m anno_computatri unix 1792852108           Unix seconds to AC and CE"""


def show(ac) -> None:
    ce = to_ce(ac)
    print(f"AC:   {format(ac)}  ({format(ac, 'dual')})")
    print(f"CE:   {ce.year}-{ce.month:02d}-{ce.day:02d} {ce.hour:02d}:{ce.minute:02d}:{ce.second:02d} UTC")
    print(f"Unix: {to_unix(ac)}")


def main(argv: list[str]) -> int:
    if not argv:
        print(USAGE)
        return 0
    mode, value = argv[0], " ".join(argv[1:])
    try:
        if mode == "now":
            show(now())
        elif mode == "ce":
            show(from_ce(parse_ce(value)))
        elif mode == "ac":
            show(parse(value))
        elif mode == "unix":
            show(from_unix(int(value)))
        else:
            print(USAGE, file=sys.stderr)
            return 1
    except (ValueError, TypeError) as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    return 0


def main_cli() -> None:
    sys.exit(main(sys.argv[1:]))


if __name__ == "__main__":
    main_cli()
