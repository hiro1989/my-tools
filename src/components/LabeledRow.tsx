import type { JSX } from "react"

import { cn } from "#/lib/utils"

type Props = {
  readonly children: JSX.Element
  readonly className?: string
  readonly label: string
  /** label の下に置く補助 UI (例: 通貨の切り替え) */
  readonly labelExtra?: JSX.Element
}

/**
 * 親で `divide-y` を指定すると、行ごとに罫線で区切られる
 */
export const LabeledRow = ({
  children,
  className,
  label,
  labelExtra,
}: Props): JSX.Element => (
  <div
    className={cn(
      "grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] items-center gap-3 py-2.5 first:pt-0 last:pb-0",
      className,
    )}
  >
    <div className="grid gap-2">
      <div className="text-sm font-medium">{label}</div>
      {labelExtra}
    </div>
    {children}
  </div>
)
