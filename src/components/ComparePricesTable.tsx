import { Plus, X } from "lucide-react"
import type { JSX } from "react"

import { NumberField } from "#/components/NumberField"
import { OutputCell } from "#/components/OutputCell"
import { SortButton } from "#/components/SortButton"
import { Button } from "#/components/ui/button"
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import { calcProfitOrLossJpy } from "#/domain/calculator"
import {
  addComparePrice,
  removeComparePrice,
  selectComparePrice,
  toggleComparePricesSort,
  updateComparePrice,
} from "#/domain/record"
import type { CalculatorRecord } from "#/domain/record"
import { useCalculatorStore } from "#/store"

type Props = {
  readonly record: CalculatorRecord
}

export const ComparePricesTable = ({ record }: Props): JSX.Element => {
  const accountBalanceJpy = useCalculatorStore((s) => s.accountBalanceJpy)
  const usdJpy = useCalculatorStore((s) => s.usdJpy)
  const updateRecord = useCalculatorStore((s) => s.updateRecord)

  const update = (updater: (r: CalculatorRecord) => CalculatorRecord): void => {
    updateRecord(record.id, updater)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
      {/* 想定目標の選択は 1 つだけなので、表全体を 1 つの RadioGroup にする */}
      <RadioGroup
        aria-label="想定目標"
        className="block"
        onValueChange={(id) => {
          update((r) => selectComparePrice(r, id))
        }}
        value={record.selectedComparePriceId ?? ""}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>
                <SortButton
                  direction={record.comparePricesSortDirection}
                  label={`対象単価 (${record.currency})`}
                  onClick={() => {
                    update(toggleComparePricesSort)
                  }}
                />
              </TableHead>
              <TableHead>損益 (JPY)</TableHead>
              <TableHead>証拠金残高 (JPY)</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {record.comparePrices.map((p, index) => {
              const profitOrLossJpy = calcProfitOrLossJpy(
                record,
                p.price,
                usdJpy,
              )

              return (
                <TableRow className="border-border/60" key={p.id}>
                  <TableCell>
                    <RadioGroupItem
                      aria-label={`価格比較 ${index + 1} を想定目標にする`}
                      value={p.id}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberField
                      aria-label={`価格比較 ${index + 1} の対象単価`}
                      className="w-36"
                      onChange={(v) => {
                        update((r) => updateComparePrice(r, p.id, v))
                      }}
                      value={p.price}
                    />
                  </TableCell>
                  <TableCell>
                    <OutputCell signed value={profitOrLossJpy} />
                  </TableCell>
                  <TableCell>
                    <OutputCell value={accountBalanceJpy + profitOrLossJpy} />
                  </TableCell>
                  <TableCell>
                    <Button
                      aria-label={`価格比較 ${index + 1} を削除`}
                      onClick={() => {
                        update((r) => removeComparePrice(r, p.id))
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <X />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </RadioGroup>
      <div>
        <Button
          onClick={() => {
            update(addComparePrice)
          }}
          size="sm"
          variant="outline"
        >
          <Plus />
          価格比較を追加
        </Button>
      </div>
    </div>
  )
}
