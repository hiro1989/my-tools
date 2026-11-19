import type { JSX } from "react"

import { Amount } from "#/components/Amount"

type Props = {
  readonly signed?: boolean
  readonly value: number
}

/**
 * 計算結果 (入力不可) の表示枠
 */
export const OutputCell = ({ signed = false, value }: Props): JSX.Element => (
  <div className="w-full max-w-48 rounded-md bg-muted px-2.5 py-1 text-right text-sm">
    <Amount signed={signed} value={value} />
  </div>
)
