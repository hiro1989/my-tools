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
  readonly onChange: (value: number) => void
  readonly value: number
}

/**
 * 入力のたびに値を onChange へ渡す数値入力
 * - 編集中は入力途中の文字列 ("1." など) を保ち、blur か Enter で value の表示に戻す
 * - 編集中も含めて常に桁区切りで表示する
 * - 数値として読めない入力は 0 として扱う
 * - ↑↓キーで、値の桁数に応じた幅で増減する
 */
export const NumberField = ({
  allowNegative = false,
  "aria-label": ariaLabel,
  className,
  onChange,
  value,
}: Props): JSX.Element => {
  // undefined = 非編集中。外部の value をそのまま表示する
  const [draft, setDraft] = useState<string | undefined>(undefined)

  const clamp = (v: number): number => (allowNegative ? v : Math.max(0, v))

  const applyDraft = (next: string): void => {
    setDraft(next)
    onChange(clamp(parseNumber(next) ?? 0))
  }

  const step = (direction: 1 | -1): void => {
    const current = parseNumber(draft ?? String(value)) ?? 0
    applyDraft(
      formatForInput(clamp(current + calc10PerStep(current) * direction)),
    )
  }

  return (
    <Input
      aria-label={ariaLabel}
      className={className}
      inputMode="decimal"
      onBlur={() => {
        setDraft(undefined)
      }}
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
        applyDraft(next)
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
            setDraft(undefined)
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
