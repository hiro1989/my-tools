/**
 * 矢印キーでの増減幅を、値の桁数に応じて返す
 *
 * @example
 * calc10PerStep(12) // => 1
 * calc10PerStep(123) // => 10
 * calc10PerStep(1234) // => 100
 */
export const calc10PerStep = (value: number): number => {
  const digits = String(Math.floor(Math.abs(value) / 10)).length
  return 10 ** (digits - 1)
}

/**
 * 数値に変換できないものは undefined を返す
 * 桁区切りの "," と "_" は無視する
 */
export const parseNumber = (v: string): number | undefined => {
  const trimmed = v.replaceAll(/[,_\s]/gu, "")
  if (trimmed === "") {
    return undefined
  }
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

const fixed3Formatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
})

/**
 * 小数点以下 3 桁で丸め、整数部と小数部に分けて返す
 *
 * @example
 * splitFixed3(-1234.5) // => { decimal: "500", integer: "-1,234" }
 */
export const splitFixed3 = (
  value: number,
): { decimal: string; integer: string } => {
  const [integer = "", decimal = ""] = fixed3Formatter.format(value).split(".")
  return { decimal, integer }
}

const inputFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 20,
})

/**
 * 入力欄の非編集時の表示用。桁区切りのみ付与する
 */
export const formatForInput = (value: number): string =>
  inputFormatter.format(value)
