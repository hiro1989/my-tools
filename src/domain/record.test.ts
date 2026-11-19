import { describe, expect, it } from "vitest"

import { createOrder } from "./order"
import {
  addComparePrice,
  addOrder,
  createRecord,
  getSelectedComparePrice,
  removeComparePrice,
  removeOrder,
  toggleComparePricesSort,
  updateComparePrice,
} from "./record"
import type { CalculatorRecord } from "./record"

const recordWithOrders = (
  orders: CalculatorRecord["orders"],
): CalculatorRecord => ({ ...createRecord("test"), orders })

describe(addOrder, () => {
  it("copies the last order with a new id", () => {
    const last = createOrder({
      orderQuantity: 5,
      selected: false,
      targetUnitPrice: 123,
    })
    const record = recordWithOrders([createOrder(), last])

    const added = addOrder(record).orders.at(-1)

    expect(added).toMatchObject({
      orderQuantity: 5,
      selected: false,
      targetUnitPrice: 123,
    })
    expect(added?.id).not.toBe(last.id)
  })
})

describe(removeOrder, () => {
  it("removes the order", () => {
    const [a, b] = [createOrder(), createOrder()]

    expect(removeOrder(recordWithOrders([a, b]), a.id).orders).toStrictEqual([
      b,
    ])
  })

  it("keeps the last order", () => {
    const record = createRecord("test")
    const [only] = record.orders

    expect(removeOrder(record, only?.id ?? "")).toBe(record)
  })
})

describe(addComparePrice, () => {
  it("adds the rounded average price of selected orders and selects it if none is selected", () => {
    const record = recordWithOrders([
      createOrder({ orderQuantity: 1, targetUnitPrice: 100 }),
      createOrder({ orderQuantity: 2, targetUnitPrice: 101 }),
      createOrder({ orderQuantity: 9, selected: false, targetUnitPrice: 999 }),
    ])

    const result = addComparePrice(record)

    expect(result.comparePrices.map((p) => p.price)).toStrictEqual([101])
    expect(getSelectedComparePrice(result)?.price).toBe(101)
  })

  it("keeps the current selection", () => {
    const first = addComparePrice(createRecord("test"))

    const result = addComparePrice(first)

    expect(result.comparePrices).toHaveLength(2)
    expect(result.selectedComparePriceId).toBe(first.selectedComparePriceId)
  })
})

describe(removeComparePrice, () => {
  it("clears the selection when the selected one is removed", () => {
    const record = addComparePrice(createRecord("test"))

    const result = removeComparePrice(
      record,
      record.selectedComparePriceId ?? "",
    )

    expect(result.comparePrices).toStrictEqual([])
    expect(result.selectedComparePriceId).toBeUndefined()
  })
})

describe(toggleComparePricesSort, () => {
  it("sorts asc then desc, keeping the selection on the same price", () => {
    let record = addComparePrice(createRecord("test"))
    record = addComparePrice(record)
    record = addComparePrice(record)
    const [p1, p2, p3] = record.comparePrices
    record = updateComparePrice(record, p1?.id ?? "", 20)
    record = updateComparePrice(record, p2?.id ?? "", 10)
    record = updateComparePrice(record, p3?.id ?? "", 30)

    const asc = toggleComparePricesSort(record)
    const desc = toggleComparePricesSort(asc)

    expect(asc.comparePrices.map((p) => p.price)).toStrictEqual([10, 20, 30])
    expect(asc.comparePricesSortDirection).toBe("asc")
    expect(desc.comparePrices.map((p) => p.price)).toStrictEqual([30, 20, 10])
    expect(desc.comparePricesSortDirection).toBe("desc")
    expect(getSelectedComparePrice(desc)?.price).toBe(20)
  })
})
