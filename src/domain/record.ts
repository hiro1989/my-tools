import type { Currency } from "#/domain/currency"
import { calcAveragePrice, createOrder } from "#/domain/order"
import type { Order } from "#/domain/order"
import { sortByNumber } from "#/lib/array"
import type { SortDirection } from "#/lib/array"

export type ComparePrice = {
  readonly id: string
  /** 価格比較用の対象単価 (通貨は所属する CalculatorRecord の currency) */
  readonly price: number
}

/**
 * 1 つの銘柄についての計算機
 */
export type CalculatorRecord = {
  /** 価格比較用の価格 */
  readonly comparePrices: readonly ComparePrice[]
  /** 価格比較の並び順。undefined は未 sort */
  readonly comparePricesSortDirection: SortDirection | undefined
  /** 1 record 内の orders, comparePrices は全てこの通貨 */
  readonly currency: Currency
  readonly id: string
  /** L or S */
  readonly isLong: boolean
  readonly name: string
  /**
   * 発注。ナンピン計画のために配列。
   * 型で表現し切れていないが、必ず 1 要素以上ある。
   */
  readonly orders: readonly Order[]
  /** 想定目標として選択中の価格比較 */
  readonly selectedComparePriceId: string | undefined
}

export const createRecord = (name: string): CalculatorRecord => ({
  // 初期値 0 より、「追加」ボタンで追加した基準値の方が便利なため、初期値は空にしておく
  comparePrices: [],
  comparePricesSortDirection: undefined,
  currency: "USD",
  id: crypto.randomUUID(),
  isLong: true,
  name,
  orders: [createOrder()],
  selectedComparePriceId: undefined,
})

export const setName = (
  record: CalculatorRecord,
  name: string,
): CalculatorRecord => ({ ...record, name })

/**
 * 金額は換算せず、通貨だけを切り替える
 */
export const setCurrency = (
  record: CalculatorRecord,
  currency: Currency,
): CalculatorRecord => ({ ...record, currency })

export const setIsLong = (
  record: CalculatorRecord,
  isLong: boolean,
): CalculatorRecord => ({ ...record, isLong })

/**
 * 近い価格で発注することが多いはずなので、直近の order を複製して追加する
 */
export const addOrder = (record: CalculatorRecord): CalculatorRecord => {
  const last = record.orders.at(-1)
  return {
    ...record,
    orders: [
      ...record.orders,
      createOrder(
        last && {
          orderQuantity: last.orderQuantity,
          selected: last.selected,
          targetUnitPrice: last.targetUnitPrice,
        },
      ),
    ],
  }
}

/**
 * orders は必ず 1 要素以上あるため、最後の 1 つは削除しない
 */
export const removeOrder = (
  record: CalculatorRecord,
  orderId: string,
): CalculatorRecord => {
  if (record.orders.length <= 1) {
    return record
  }
  return { ...record, orders: record.orders.filter((o) => o.id !== orderId) }
}

export const updateOrder = (
  record: CalculatorRecord,
  orderId: string,
  patch: Partial<Omit<Order, "id">>,
): CalculatorRecord => ({
  ...record,
  orders: record.orders.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
})

export const setAllOrdersSelected = (
  record: CalculatorRecord,
  selected: boolean,
): CalculatorRecord => ({
  ...record,
  orders: record.orders.map((o) => ({ ...o, selected })),
})

export const sortOrders = (
  record: CalculatorRecord,
  direction: SortDirection,
): CalculatorRecord => ({
  ...record,
  orders: sortByNumber(record.orders, (o) => o.targetUnitPrice, direction),
})

/**
 * 入力の基準になるよう、選択中 orders の平均単価 (= 損益 ±0 の近似値) で追加する
 * 未選択の状態なら、追加した価格比較を想定目標として選択する
 */
export const addComparePrice = (record: CalculatorRecord): CalculatorRecord => {
  const added: ComparePrice = {
    id: crypto.randomUUID(),
    price: Math.round(
      calcAveragePrice(record.orders.filter((o) => o.selected)),
    ),
  }
  return {
    ...record,
    comparePrices: [...record.comparePrices, added],
    selectedComparePriceId: record.selectedComparePriceId ?? added.id,
  }
}

export const removeComparePrice = (
  record: CalculatorRecord,
  comparePriceId: string,
): CalculatorRecord => ({
  ...record,
  comparePrices: record.comparePrices.filter((p) => p.id !== comparePriceId),
  selectedComparePriceId:
    record.selectedComparePriceId === comparePriceId
      ? undefined
      : record.selectedComparePriceId,
})

export const updateComparePrice = (
  record: CalculatorRecord,
  comparePriceId: string,
  price: number,
): CalculatorRecord => ({
  ...record,
  comparePrices: record.comparePrices.map((p) =>
    p.id === comparePriceId ? { ...p, price } : p,
  ),
})

export const selectComparePrice = (
  record: CalculatorRecord,
  comparePriceId: string,
): CalculatorRecord => ({ ...record, selectedComparePriceId: comparePriceId })

/**
 * 未 sort -> asc -> desc -> asc ... の順に切り替えて sort する
 */
export const toggleComparePricesSort = (
  record: CalculatorRecord,
): CalculatorRecord => {
  const direction: SortDirection =
    record.comparePricesSortDirection === "asc" ? "desc" : "asc"
  return {
    ...record,
    comparePrices: sortByNumber(
      record.comparePrices,
      (p) => p.price,
      direction,
    ),
    comparePricesSortDirection: direction,
  }
}

export const getSelectedComparePrice = (
  record: CalculatorRecord,
): ComparePrice | undefined =>
  record.comparePrices.find((p) => p.id === record.selectedComparePriceId)
