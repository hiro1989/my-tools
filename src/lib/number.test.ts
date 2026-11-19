import { describe, expect, it } from "vitest"

import { calc10PerStep, parseNumber, splitFixed3 } from "./number"

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

describe(splitFixed3, () => {
  it.each([
    { expected: { decimal: "500", integer: "-1,234" }, value: -1234.5 },
    { expected: { decimal: "235", integer: "10,000" }, value: 10_000.2345 },
    { expected: { decimal: "", integer: "∞" }, value: Infinity },
  ])("$value", ({ expected, value }) => {
    expect(splitFixed3(value)).toStrictEqual(expected)
  })
})
