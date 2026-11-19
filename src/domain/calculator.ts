import { toJpy } from "#/domain/currency"
import type { CalculatorRecord } from "#/domain/record"
import { getSelectedComparePrice } from "#/domain/record"
import { sum } from "#/lib/array"

/**
 * 選択中 orders の "発注価格" の合計 (JPY)
 */
export const calcOrderPriceJpy = (
  record: CalculatorRecord,
  usdJpy: number,
): number =>
  sum(
    record.orders
      .filter((o) => o.selected)
      .map((o) =>
        toJpy(o.targetUnitPrice * o.orderQuantity, record.currency, usdJpy),
      ),
  )

/**
 * "レバレッジ" = 発注価格 / 証拠金残高
 */
export const calcLeverage = (
  priceJpy: number,
  accountBalanceJpy: number,
): number => priceJpy / accountBalanceJpy

/**
 * 比較価格になった場合の、選択中 orders の "損益" の合計 (JPY)
 */
export const calcProfitOrLossJpy = (
  record: CalculatorRecord,
  comparePrice: number,
  usdJpy: number,
): number => {
  const sign = record.isLong ? 1 : -1
  return sum(
    record.orders
      .filter((o) => o.selected)
      .map((o) =>
        toJpy(
          (comparePrice - o.targetUnitPrice) * o.orderQuantity * sign,
          record.currency,
          usdJpy,
        ),
      ),
  )
}

export type Summary = {
  /** 全合計証拠金残高 (JPY) = 証拠金残高 + 全合計価格比較損益 */
  readonly totalAccountBalanceJpy: number
  /** 全注文合計レバレッジ */
  readonly totalLeverage: number
  /** 全合計価格比較損益 (JPY)。想定目標が選択された record のみ対象 */
  readonly totalProfitOrLossJpy: number
}

export const calcSummary = (
  records: readonly CalculatorRecord[],
  accountBalanceJpy: number,
  usdJpy: number,
): Summary => {
  const totalPriceJpy = sum(records.map((r) => calcOrderPriceJpy(r, usdJpy)))

  const totalProfitOrLossJpy = sum(
    records.map((r) => {
      const selected = getSelectedComparePrice(r)
      return selected ? calcProfitOrLossJpy(r, selected.price, usdJpy) : 0
    }),
  )

  return {
    totalAccountBalanceJpy: accountBalanceJpy + totalProfitOrLossJpy,
    totalLeverage: calcLeverage(totalPriceJpy, accountBalanceJpy),
    totalProfitOrLossJpy,
  }
}
