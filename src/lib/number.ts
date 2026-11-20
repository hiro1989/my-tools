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
 * 桁区切りの "," と "_"、空白を取り除く
 */
const stripSeparators = (v: string): string => v.replaceAll(/[,_\s]/gu, "")

/**
 * 数値に変換できないものは undefined を返す
 * 桁区切りの "," と "_" は無視する
 */
export const parseNumber = (v: string): number | undefined => {
  const trimmed = stripSeparators(v)
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

/**
 * 編集中の入力文字列の整数部に桁区切りを付け直す
 * - 末尾の "." や小数部の末尾の 0 など、入力途中の形はそのまま残す
 * - 数値の形でない文字列は変更しない
 *
 * @example
 * formatDraft("1234567.50") // => "1,234,567.50"
 * formatDraft("-12,34.") // => "-1,234."
 */
export const formatDraft = (input: string): string => {
  const match = /^(-?)(\d*)(\.\d*)?$/u.exec(stripSeparators(input))
  if (match === null) {
    return input
  }
  const [, sign = "", integer = "", fraction = ""] = match
  return `${sign}${integer.replaceAll(/\B(?=(?:\d{3})+$)/gu, ",")}${fraction}`
}

/**
 * caret より前にある、桁区切りを除いた文字数を返す
 * - 桁区切りを付け直した後に caret を同じ位置へ戻すために使う
 */
export const countBeforeCaret = (input: string, caret: number): number =>
  stripSeparators(input.slice(0, caret)).length

/**
 * 桁区切りを除いて count 文字目の直後にあたる、formatted 上の caret 位置を返す
 *
 * @example
 * locateCaret("1,234", 2) // => 3
 */
export const locateCaret = (formatted: string, count: number): number => {
  if (count <= 0) {
    return 0
  }
  let remaining = count
  for (let index = 0; index < formatted.length; index += 1) {
    if (stripSeparators(formatted.charAt(index)) !== "") {
      remaining -= 1
      if (remaining === 0) {
        return index + 1
      }
    }
  }
  return formatted.length
}
