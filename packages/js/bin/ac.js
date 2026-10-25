#!/usr/bin/env node
import { now, format, fromUnix, toUnix, parse, parseCe, fromCe, toCe } from "../src/index.js";

const [mode, ...rest] = process.argv.slice(2);
const value = rest.join(" ");

const usage = `usage:
  ac now                       current moment
  ac ce 2026-10-24 [HH:MM:SS]  CE date to AC
  ac ac 56-10-24 [HH:MM:SS]    AC date to CE and Unix time
  ac unix 1792852108           Unix seconds to AC and CE`;

function show(ac) {
  const ce = toCe(ac);
  const p = (n) => String(n).padStart(2, "0");
  console.log(`AC:   ${format(ac)}  (${format(ac, { style: "dual" })})`);
  console.log(`CE:   ${ce.year}-${p(ce.month)}-${p(ce.day)} ${p(ce.hour)}:${p(ce.minute)}:${p(ce.second)} UTC`);
  console.log(`Unix: ${toUnix(ac)}`);
}

try {
  if (mode === "now") show(now());
  else if (mode === "ce") {
    show(fromCe(parseCe(value)));
  } else if (mode === "ac") show(parse(value));
  else if (mode === "unix") show(fromUnix(Number(value)));
  else {
    console.error(usage);
    process.exit(mode ? 1 : 0);
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
