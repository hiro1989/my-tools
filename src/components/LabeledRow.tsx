import type { JSX } from "react"

type Props = {
  readonly children: JSX.Element
  readonly label: string
}

export const LabeledRow = ({ children, label }: Props): JSX.Element => (
  <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] items-center gap-3">
    <div className="text-sm text-muted-foreground">{label}</div>
    {children}
  </div>
)
