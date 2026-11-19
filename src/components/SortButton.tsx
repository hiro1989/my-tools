import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type { JSX } from "react"

import { Button } from "#/components/ui/button"
import type { SortDirection } from "#/lib/array"

type Props = {
  readonly direction: SortDirection | undefined
  readonly label: string
  readonly onClick: () => void
}

const icons = {
  asc: ArrowUp,
  desc: ArrowDown,
  none: ArrowUpDown,
} as const

export const SortButton = ({
  direction,
  label,
  onClick,
}: Props): JSX.Element => {
  const Icon = icons[direction ?? "none"]

  return (
    <Button className="-ml-2.5" onClick={onClick} size="sm" variant="ghost">
      {label}
      <Icon />
    </Button>
  )
}
