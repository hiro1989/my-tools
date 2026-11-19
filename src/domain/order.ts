export type Order = {
  readonly id: string
  /** 発注数 */
  readonly orderQuantity: number
  readonly selected: boolean
  /** 対象単価 (通貨は所属する CalculatorRecord の currency) */
  readonly targetUnitPrice: number
}

/**
 * 全て選択なし | 全て選択あり | ありなし混在
 */
export type WholeSelectStatus = "all-selected" | "indeterminate" | "no-selected"

export const createOrder = (overwrite?: Partial<Omit<Order, "id">>): Order => ({
  orderQuantity: 1,
  selected: true,
  targetUnitPrice: 0,
  ...overwrite,
  id: crypto.randomUUID(),
})

export const getWholeSelectStatus = (
  orders: readonly Order[],
): WholeSelectStatus => {
  const selectedCount = orders.filter((o) => o.selected).length
  if (selectedCount === 0) {
    return "no-selected"
  }
  if (selectedCount === orders.length) {
    return "all-selected"
  }
  return "indeterminate"
}

/**
 * 発注数も考慮した平均単価を返す
 * 発注数の合計が 0 の場合は、平均を定義できないため 0 を返す
 */
export const calcAveragePrice = (orders: readonly Order[]): number => {
  let totalPrice = 0
  let totalQuantity = 0
  for (const o of orders) {
    totalPrice += o.targetUnitPrice * o.orderQuantity
    totalQuantity += o.orderQuantity
  }
  return totalQuantity === 0 ? 0 : totalPrice / totalQuantity
}
