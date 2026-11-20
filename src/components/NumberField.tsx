import { useState } from "react"
import type { JSX } from "react"

import { Input } from "#/components/ui/input"
import {
  calc10PerStep,
  countBeforeCaret,
  formatDraft,
  formatForInput,
  locateCaret,
  parseNumber,
} from "#/lib/number"

type Props = {
  readonly allowNegative?: boolean
  readonly "aria-label": string
  readonly className?: string
  readonly onCommit: (value: number) => void
  readonly value: number
}

/**
 * 入力中は内部 state のみ更新し、blur か Enter で確定する数値入力
 * - 編集中も含めて常に桁区切りで表示する
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
    setDraft(
      formatForInput(clamp(current + calc10PerStep(current) * direction)),
    )
  }

  return (
    <Input
      aria-label={ariaLabel}
      className={className}
      inputMode="decimal"
      onBlur={commit}
      onChange={(e) => {
        // 桁区切りを付け直した値と caret 位置を DOM に先に反映し、再描画で caret が末尾へ飛ばないようにする
        const { target } = e
        const input = target.value
        const next = formatDraft(input)
        const caret = locateCaret(
          next,
          countBeforeCaret(input, target.selectionStart ?? input.length),
        )
        target.value = next
        target.setSelectionRange(caret, caret)
        setDraft(next)
      }}
      onFocus={(e) => {
        setDraft(formatForInput(value))
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
