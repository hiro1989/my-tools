import { useId } from "react"
import type { JSX } from "react"

import { Label } from "#/components/ui/label"
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group"

type Option<T extends string> = {
  readonly label: string
  readonly value: T
}

type Props<T extends string> = {
  readonly "aria-label": string
  readonly onChange: (value: T) => void
  readonly options: readonly Option<T>[]
  readonly value: T
}

export const ChoiceRadioGroup = <T extends string>({
  "aria-label": ariaLabel,
  onChange,
  options,
  value,
}: Props<T>): JSX.Element => {
  const id = useId()

  return (
    <RadioGroup
      aria-label={ariaLabel}
      className="flex gap-4"
      onValueChange={(v) => {
        const selected = options.find((o) => o.value === v)
        if (selected) {
          onChange(selected.value)
        }
      }}
      value={value}
    >
      {options.map((o) => (
        <div className="flex items-center gap-1.5" key={o.value}>
          <RadioGroupItem id={`${id}-${o.value}`} value={o.value} />
          <Label className="whitespace-nowrap" htmlFor={`${id}-${o.value}`}>
            {o.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
