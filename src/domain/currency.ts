/**
 * この App で使える通貨
 */
export const currencies = ["JPY", "USD"] as const

export type Currency = (typeof currencies)[number]

export const currencyLabelMap: Record<Currency, string> = {
  JPY: "￥",
  USD: "＄",
}

/**
 * 指定通貨の金額を JPY に換算する
 */
export const toJpy = (
  amount: number,
  currency: Currency,
  usdJpy: number,
): number => (currency === "JPY" ? amount : amount * usdJpy)
