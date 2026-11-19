import { useState } from "react"
import type { JSX } from "react"

import { Input } from "#/components/ui/input"
import { calc10PerStep, formatForInput, parseNumber } from "#/lib/number"

type Props = {
  readonly allowNegative?: boolean
  readonly "aria-label": string
  readonly className?: string
  readonly onCommit: (value: number) => void
  readonly value: number
}

/**
 * 入力中は内部 state のみ更新し、blur か Enter で確定する数値入力
 * - 非編集時は桁区切りで表示する
 * - ↑↓キーで、値の桁数に応じた幅で増減する
 */
export const NumberField = ({
  allowNegative = false,
  "aria-label": ariaLabel,
  className,
  onCommit,
  value,
}: Props): JSX.Element => {
  // undefined = 非編集中。外部の value をそのまま表示する
  const [draft, setDraft] = useState<string | undefined>(undefined)

  const clamp = (v: number): number => (allowNegative ? v : Math.max(0, v))

  const commit = (): void => {
    if (draft === undefined) {
      return
    }
    onCommit(clamp(parseNumber(draft) ?? 0))
    setDraft(undefined)
  }

  const step = (direction: 1 | -1): void => {
    const current = parseNumber(draft ?? String(value)) ?? 0
    setDraft(String(clamp(current + calc10PerStep(current) * direction)))
  }

  return (
    <Input
      aria-label={ariaLabel}
      className={className}
      inputMode="decimal"
      onBlur={commit}
      onChange={(e) => {
        setDraft(e.target.value)
      }}
      onFocus={(e) => {
        setDraft(String(value))
        e.target.select()
      }}
      onKeyDown={(e) => {
        switch (e.key) {
          case "ArrowUp": {
            e.preventDefault()
            step(1)
            break
          }
          case "ArrowDown": {
            e.preventDefault()
            step(-1)
            break
          }
          case "Enter": {
            commit()
            break
          }
          default: {
            break
          }
        }
      }}
      value={draft ?? formatForInput(value)}
    />
  )
}
