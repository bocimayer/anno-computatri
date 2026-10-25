export interface AcDate {
  /** AC year (CE year minus 1970; negative before 1970 CE). */
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export type PartialDate = { year: number; month: number; day: number; hour?: number; minute?: number; second?: number };

export const EPOCH_YEAR: 1970;
export const SYMBOL: "⏀";

export function ceYearToAc(ceYear: number): number;
export function acYearToCe(acYear: number): number;
export function isLeapYear(acYear: number): boolean;
export function daysInMonth(acYear: number, month: number): number;
export function fromUnix(unix: number): AcDate;
export function toUnix(ac: PartialDate): number;
export function fromCe(ce: PartialDate): AcDate;
export function toCe(ac: PartialDate): AcDate;
export function fromDate(date: Date): AcDate;
export function toDate(ac: PartialDate): Date;
export function now(): AcDate;
export function format(ac: PartialDate, options?: { style?: "universal" | "dual" }): string;
export function parse(text: string): AcDate;
export function parseCe(text: string): AcDate;
