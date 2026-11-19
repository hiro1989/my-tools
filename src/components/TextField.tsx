import { useState } from "react"
import type { JSX } from "react"

import { Input } from "#/components/ui/input"

type Props = {
  readonly "aria-label": string
  readonly className?: string
  readonly onCommit: (value: string) => void
  readonly value: string
}

/**
 * 入力中は内部 state のみ更新し、blur か Enter で確定する文字列入力
 */
export const TextField = ({
  "aria-label": ariaLabel,
  className,
  onCommit,
  value,
}: Props): JSX.Element => {
  // undefined = 非編集中。外部の value をそのまま表示する
  const [draft, setDraft] = useState<string | undefined>(undefined)

  const commit = (): void => {
    if (draft === undefined) {
      return
    }
    onCommit(draft)
    setDraft(undefined)
  }

  return (
    <Input
      aria-label={ariaLabel}
      className={className}
      onBlur={commit}
      onChange={(e) => {
        setDraft(e.target.value)
      }}
      onFocus={(e) => {
        setDraft(value)
        e.target.select()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit()
        }
      }}
      value={draft ?? value}
    />
  )
}
