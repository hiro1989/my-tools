import { describe, expect, it } from "vitest"

import {
  calcLeverage,
  calcOrderPriceJpy,
  calcProfitOrLossJpy,
  calcSummary,
} from "./calculator"
import { createOrder } from "./order"
import { addComparePrice, createRecord, updateComparePrice } from "./record"
import type { CalculatorRecord } from "./record"

const usdRecord = (overwrite: Partial<CalculatorRecord>): CalculatorRecord => ({
  ...createRecord("test"),
  currency: "USD",
  ...overwrite,
})

describe(calcLeverage, () => {
  it("divides price by account balance", () => {
    expect(calcLeverage(1000, 1_000_000)).toBe(0.001)
    expect(calcLeverage(100 * 200, 1000)).toBe(20)
  })
})

describe(calcOrderPriceJpy, () => {
  it("sums selected orders converted into JPY", () => {
    const record = usdRecord({
      orders: [
        createOrder({ orderQuantity: 2, targetUnitPrice: 10 }),
        createOrder({ orderQuantity: 1, targetUnitPrice: 5 }),
        createOrder({
          orderQuantity: 100,
          selected: false,
          targetUnitPrice: 1,
        }),
      ],
    })

    expect(calcOrderPriceJpy(record, 150)).toBe((2 * 10 + 5) * 150)
  })

  it("does not convert JPY", () => {
    const record = usdRecord({
      currency: "JPY",
      orders: [createOrder({ orderQuantity: 3, targetUnitPrice: 1000 })],
    })

    expect(calcOrderPriceJpy(record, 150)).toBe(3000)
  })
})

describe(calcProfitOrLossJpy, () => {
  const orders = [createOrder({ orderQuantity: 10, targetUnitPrice: 100 })]

  it("is positive when the price rises on a long position", () => {
    expect(
      calcProfitOrLossJpy(usdRecord({ isLong: true, orders }), 110, 150),
    ).toBe(10 * 10 * 150)
  })

  it("is negative when the price rises on a short position", () => {
    expect(
      calcProfitOrLossJpy(usdRecord({ isLong: false, orders }), 110, 150),
    ).toBe(-10 * 10 * 150)
  })
})

describe(calcSummary, () => {
  it("aggregates all records, counting profit or loss only for records with a selected compare price", () => {
    const withTarget = (() => {
      const r = addComparePrice(
        usdRecord({
          orders: [createOrder({ orderQuantity: 1, targetUnitPrice: 100 })],
        }),
      )
      return updateComparePrice(r, r.selectedComparePriceId ?? "", 120)
    })()
    const withoutTarget = usdRecord({
      currency: "JPY",
      orders: [createOrder({ orderQuantity: 1, targetUnitPrice: 50_000 })],
    })

    const summary = calcSummary([withTarget, withoutTarget], 100_000, 100)

    expect(summary).toStrictEqual({
      totalAccountBalanceJpy: 100_000 + 2000,
      totalLeverage: (100 * 100 + 50_000) / 100_000,
      totalProfitOrLossJpy: 20 * 100,
    })
  })
})
