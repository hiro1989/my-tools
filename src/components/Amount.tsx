import type { JSX } from "react"

import { splitFixed3 } from "#/lib/number"
import { cn } from "#/lib/utils"

type Props = {
  /** true の場合、正の値に "+" を付けて緑色にする (損益表示用) */
  readonly signed?: boolean
  readonly value: number
}

/**
 * 小数部を薄く表示することで、正確性を保ちつつ些事が目に付かないようにする
 */
export const Amount = ({ signed = false, value }: Props): JSX.Element => {
  const { decimal, integer } = splitFixed3(value)
  const isLoss = value < 0
  const isProfit = signed && !isLoss

  return (
    <span className="font-mono tabular-nums">
      <span
        className={cn(
          isLoss && "text-red-700 dark:text-red-400",
          isProfit && "text-green-700 dark:text-green-400",
        )}
      >
        {isProfit ? "+" : ""}
        {integer}
      </span>
      {/* Infinity 等は小数部を持たない */}
      {decimal !== "" && (
        <span className="text-muted-foreground">.{decimal}</span>
      )}
    </span>
  )
}
