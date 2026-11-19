import { describe, expect, it } from "vitest"

import { calcAveragePrice, createOrder, getWholeSelectStatus } from "./order"

describe(getWholeSelectStatus, () => {
  it.each([
    { expected: "no-selected", selected: [] },
    { expected: "no-selected", selected: [false, false] },
    { expected: "all-selected", selected: [true, true, true] },
    { expected: "indeterminate", selected: [true, false, true] },
  ])("$selected -> $expected", ({ expected, selected }) => {
    const orders = selected.map((s) => createOrder({ selected: s }))

    expect(getWholeSelectStatus(orders)).toStrictEqual(expected)
  })
})

describe(calcAveragePrice, () => {
  it("weights each price by its quantity", () => {
    const orders = [
      createOrder({ orderQuantity: 1, targetUnitPrice: 100 }),
      createOrder({ orderQuantity: 3, targetUnitPrice: 200 }),
    ]

    expect(calcAveragePrice(orders)).toBe(175)
  })

  it("returns 0 when total quantity is 0", () => {
    expect(calcAveragePrice([])).toBe(0)
    expect(
      calcAveragePrice([createOrder({ orderQuantity: 0, targetUnitPrice: 1 })]),
    ).toBe(0)
  })
})
