import { Plus } from "lucide-react"
import type { JSX } from "react"

import { RecordCard } from "#/components/RecordCard"
import { SummaryCard } from "#/components/SummaryCard"
import { Button } from "#/components/ui/button"
import { useCalculatorStore } from "#/store"

export const App = (): JSX.Element => {
  const records = useCalculatorStore((s) => s.records)
  const addRecord = useCalculatorStore((s) => s.addRecord)

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <h1 className="text-xl font-bold">Leverage Calculator</h1>
      <SummaryCard />
      {records.map((r, index) => (
        <RecordCard index={index} key={r.id} record={r} />
      ))}
      <div>
        <Button onClick={addRecord}>
          <Plus />
          銘柄を追加
        </Button>
      </div>
    </main>
  )
}
