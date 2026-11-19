import type { JSX } from "react"

import { LabeledRow } from "#/components/LabeledRow"
import { NumberField } from "#/components/NumberField"
import { OutputCell } from "#/components/OutputCell"
import { Card, CardContent } from "#/components/ui/card"
import { calcSummary } from "#/domain/calculator"
import { useCalculatorStore } from "#/store"

export const SummaryCard = (): JSX.Element => {
  const accountBalanceJpy = useCalculatorStore((s) => s.accountBalanceJpy)
  const records = useCalculatorStore((s) => s.records)
  const usdJpy = useCalculatorStore((s) => s.usdJpy)
  const setAccountBalanceJpy = useCalculatorStore((s) => s.setAccountBalanceJpy)
  const setUsdJpy = useCalculatorStore((s) => s.setUsdJpy)

  const summary = calcSummary(records, accountBalanceJpy, usdJpy)

  return (
    <Card>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <LabeledRow label="証拠金残高 (JPY)">
          <NumberField
            aria-label="証拠金残高 (JPY)"
            className="w-full max-w-48"
            onCommit={setAccountBalanceJpy}
            value={accountBalanceJpy}
          />
        </LabeledRow>
        <LabeledRow label="USD/JPY">
          <NumberField
            aria-label="USD/JPY"
            className="w-full max-w-48"
            onCommit={setUsdJpy}
            value={usdJpy}
          />
        </LabeledRow>
        <LabeledRow label="レバレッジ">
          <OutputCell value={summary.totalLeverage} />
        </LabeledRow>
        <LabeledRow label="全合計価格比較損益 (JPY)">
          <OutputCell signed value={summary.totalProfitOrLossJpy} />
        </LabeledRow>
        <LabeledRow label="全合計証拠金残高 (JPY)">
          <OutputCell value={summary.totalAccountBalanceJpy} />
        </LabeledRow>
      </CardContent>
    </Card>
  )
}
