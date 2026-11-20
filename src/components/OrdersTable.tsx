import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { JSX } from "react"

import { NumberField } from "#/components/NumberField"
import { SortButton } from "#/components/SortButton"
import { Button } from "#/components/ui/button"
import { Checkbox } from "#/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import { getWholeSelectStatus } from "#/domain/order"
import {
  addOrder,
  removeOrder,
  setAllOrdersSelected,
  sortOrders,
  updateOrder,
} from "#/domain/record"
import type { CalculatorRecord } from "#/domain/record"
import type { SortDirection } from "#/lib/array"
import { useCalculatorStore } from "#/store"

type Props = {
  readonly record: CalculatorRecord
}

export const OrdersTable = ({ record }: Props): JSX.Element => {
  const updateRecord = useCalculatorStore((s) => s.updateRecord)
  // 並び順は表示中の操作に過ぎないため、永続化しない
  const [direction, setDirection] = useState<SortDirection | undefined>(
    undefined,
  )

  const update = (updater: (r: CalculatorRecord) => CalculatorRecord): void => {
    updateRecord(record.id, updater)
  }

  const wholeSelectStatus = getWholeSelectStatus(record.orders)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox
                aria-label="全て選択"
                checked={
                  wholeSelectStatus === "indeterminate"
                    ? "indeterminate"
                    : wholeSelectStatus === "all-selected"
                }
                onCheckedChange={(checked) => {
                  update((r) => setAllOrdersSelected(r, checked === true))
                }}
              />
            </TableHead>
            <TableHead>
              <SortButton
                direction={direction}
                label="対象単価"
                onClick={() => {
                  const next = direction === "asc" ? "desc" : "asc"
                  setDirection(next)
                  update((r) => sortOrders(r, next))
                }}
              />
            </TableHead>
            <TableHead>発注数</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {record.orders.map((o, index) => (
            <TableRow className="border-border/60" key={o.id}>
              <TableCell>
                <Checkbox
                  aria-label={`発注 ${index + 1} を選択`}
                  checked={o.selected}
                  onCheckedChange={(checked) => {
                    update((r) =>
                      updateOrder(r, o.id, { selected: checked === true }),
                    )
                  }}
                />
              </TableCell>
              <TableCell>
                <NumberField
                  aria-label={`発注 ${index + 1} の対象単価`}
                  className="w-36"
                  onChange={(v) => {
                    update((r) => updateOrder(r, o.id, { targetUnitPrice: v }))
                  }}
                  value={o.targetUnitPrice}
                />
              </TableCell>
              <TableCell>
                <NumberField
                  aria-label={`発注 ${index + 1} の発注数`}
                  className="w-28"
                  onChange={(v) => {
                    update((r) => updateOrder(r, o.id, { orderQuantity: v }))
                  }}
                  value={o.orderQuantity}
                />
              </TableCell>
              <TableCell>
                <Button
                  aria-label={`発注 ${index + 1} を削除`}
                  disabled={record.orders.length <= 1}
                  onClick={() => {
                    update((r) => removeOrder(r, o.id))
                  }}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Button
          onClick={() => {
            update(addOrder)
          }}
          size="sm"
          variant="outline"
        >
          <Plus />
          発注を追加
        </Button>
      </div>
    </div>
  )
}
