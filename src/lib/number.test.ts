import { describe, expect, it } from "vitest"

import {
  calc10PerStep,
  countBeforeCaret,
  formatDraft,
  locateCaret,
  parseNumber,
  splitFixed3,
} from "./number"

describe(calc10PerStep, () => {
  it.each([
    { expected: 1, value: 0 },
    { expected: 1, value: 12 },
    { expected: 10, value: 123 },
    { expected: 100, value: 1234 },
    { expected: 100, value: -1234 },
  ])("$value -> $expected", ({ expected, value }) => {
    expect(calc10PerStep(value)).toBe(expected)
  })
})

describe(parseNumber, () => {
  it.each([
    { expected: 1234.5, input: "1,234.5" },
    { expected: 1_000_000, input: "1_000_000" },
    { expected: -3, input: " -3 " },
    { expected: undefined, input: "" },
    { expected: undefined, input: "abc" },
  ])("$input -> $expected", ({ expected, input }) => {
    expect(parseNumber(input)).toBe(expected)
  })
})

describe(formatDraft, () => {
  it.each([
    { expected: "1,234,567.50", input: "1234567.50" },
    { expected: "-1,234.", input: "-12,34." },
    { expected: "100", input: "100" },
    { expected: "10,000", input: "1,0000" },
    { expected: ".5", input: ".5" },
    { expected: "-", input: "-" },
    { expected: "", input: "" },
    { expected: "1e5", input: "1e5" },
  ])("$input -> $expected", ({ expected, input }) => {
    expect(formatDraft(input)).toBe(expected)
  })
})

describe(countBeforeCaret, () => {
  it.each([
    { caret: 0, expected: 0, input: "1,234" },
    { caret: 2, expected: 1, input: "1,234" },
    { caret: 5, expected: 4, input: "1,234" },
  ])("$input @ $caret -> $expected", ({ caret, expected, input }) => {
    expect(countBeforeCaret(input, caret)).toBe(expected)
  })
})

describe(locateCaret, () => {
  it.each([
    { count: 0, expected: 0, formatted: "1,234" },
    { count: 1, expected: 1, formatted: "1,234" },
    { count: 2, expected: 3, formatted: "1,234" },
    { count: 4, expected: 5, formatted: "1,234" },
    { count: 9, expected: 5, formatted: "1,234" },
  ])("$formatted # $count -> $expected", ({ count, expected, formatted }) => {
    expect(locateCaret(formatted, count)).toBe(expected)
  })
})

describe(splitFixed3, () => {
  it.each([
    { expected: { decimal: "500", integer: "-1,234" }, value: -1234.5 },
    { expected: { decimal: "235", integer: "10,000" }, value: 10_000.2345 },
    { expected: { decimal: "", integer: "∞" }, value: Infinity },
  ])("$value", ({ expected, value }) => {
    expect(splitFixed3(value)).toStrictEqual(expected)
  })
})
