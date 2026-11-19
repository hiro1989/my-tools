import { Trash2 } from "lucide-react"
import type { JSX } from "react"

import { ChoiceRadioGroup } from "#/components/ChoiceRadioGroup"
import { ComparePricesTable } from "#/components/ComparePricesTable"
import { LabeledRow } from "#/components/LabeledRow"
import { OrdersTable } from "#/components/OrdersTable"
import { OutputCell } from "#/components/OutputCell"
import { TextField } from "#/components/TextField"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { calcLeverage, calcOrderPriceJpy } from "#/domain/calculator"
import { currencies, currencyLabelMap } from "#/domain/currency"
import type { Currency } from "#/domain/currency"
import { setCurrency, setIsLong, setName } from "#/domain/record"
import type { CalculatorRecord } from "#/domain/record"
import { cn } from "#/lib/utils"
import { useCalculatorStore } from "#/store"

type Props = {
  readonly index: number
  readonly record: CalculatorRecord
}

const currencyOptions = currencies.map((c) => ({
  label: `${currencyLabelMap[c]} ${c}`,
  value: c,
}))

const lsOptions = [
  { label: "買", value: "L" },
  { label: "売", value: "S" },
] as const

export const RecordCard = ({ index, record }: Props): JSX.Element => {
  const accountBalanceJpy = useCalculatorStore((s) => s.accountBalanceJpy)
  const recordCount = useCalculatorStore((s) => s.records.length)
  const usdJpy = useCalculatorStore((s) => s.usdJpy)
  const removeRecord = useCalculatorStore((s) => s.removeRecord)
  const resetRecord = useCalculatorStore((s) => s.resetRecord)
  const updateRecord = useCalculatorStore((s) => s.updateRecord)

  const update = (updater: (r: CalculatorRecord) => CalculatorRecord): void => {
    updateRecord(record.id, updater)
  }

  const handleDelete = (): void => {
    // 最後の 1 件は削除せず、初期状態に戻す
    if (recordCount === 1) {
      if (globalThis.confirm("Reset ?")) {
        resetRecord(record.id)
      }
      return
    }
    if (globalThis.confirm("Delete ?")) {
      removeRecord(record.id)
    }
  }

  const orderPriceJpy = calcOrderPriceJpy(record, usdJpy)

  return (
    <Card
      className={cn(
        "shadow-lg ring-foreground/15",
        index % 2 === 1 && "bg-record-alt",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="flex size-7 items-center justify-center rounded-full border text-sm">
          {index + 1}
        </CardTitle>
        <Button
          aria-label={`${record.name} を削除`}
          className="text-destructive"
          onClick={handleDelete}
          size="icon-sm"
          variant="ghost"
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] divide-y">
        <LabeledRow label="名前">
          <TextField
            aria-label="名前"
            className="w-full max-w-64"
            onCommit={(v) => {
              update((r) => setName(r, v))
            }}
            value={record.name}
          />
        </LabeledRow>
        <LabeledRow
          className="max-sm:grid-cols-1"
          label="発注"
          labelExtra={
            <ChoiceRadioGroup<Currency>
              aria-label="通貨"
              onChange={(c) => {
                update((r) => setCurrency(r, c))
              }}
              options={currencyOptions}
              value={record.currency}
            />
          }
        >
          <OrdersTable record={record} />
        </LabeledRow>
        <LabeledRow label="売買">
          <ChoiceRadioGroup
            aria-label="売買"
            onChange={(v) => {
              update((r) => setIsLong(r, v === "L"))
            }}
            options={lsOptions}
            value={record.isLong ? "L" : "S"}
          />
        </LabeledRow>
        <LabeledRow label="発注価格 (JPY)">
          <OutputCell value={orderPriceJpy} />
        </LabeledRow>
        <LabeledRow label="レバレッジ">
          <OutputCell value={calcLeverage(orderPriceJpy, accountBalanceJpy)} />
        </LabeledRow>
        <LabeledRow className="max-sm:grid-cols-1" label="価格比較">
          <ComparePricesTable record={record} />
        </LabeledRow>
      </CardContent>
    </Card>
  )
}
