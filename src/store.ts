import { create } from "zustand"
import { persist } from "zustand/middleware"

import { createRecord } from "#/domain/record"
import type { CalculatorRecord } from "#/domain/record"

type State = {
  /** 証拠金残高。実装を簡単にするため JPY 固定 */
  readonly accountBalanceJpy: number
  readonly records: readonly CalculatorRecord[]
  readonly usdJpy: number
}

type Actions = {
  readonly addRecord: () => void
  readonly removeRecord: (id: string) => void
  readonly resetRecord: (id: string) => void
  readonly setAccountBalanceJpy: (value: number) => void
  readonly setUsdJpy: (value: number) => void
  readonly updateRecord: (
    id: string,
    updater: (record: CalculatorRecord) => CalculatorRecord,
  ) => void
}

const untitled = (n: number): string => `untitled ${n}`

export const useCalculatorStore = create<State & Actions>()(
  persist(
    (set) => ({
      accountBalanceJpy: 100_000,
      addRecord: () => {
        set((s) => ({
          records: [...s.records, createRecord(untitled(s.records.length + 1))],
        }))
      },
      records: [createRecord(untitled(1))],
      removeRecord: (id) => {
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
      },
      resetRecord: (id) => {
        set((s) => ({
          records: s.records.map((r, i) =>
            r.id === id ? createRecord(untitled(i + 1)) : r,
          ),
        }))
      },
      setAccountBalanceJpy: (value) => {
        set({ accountBalanceJpy: value })
      },
      // ZeroDivisionError を防ぐため、0 以下は 1 に補正する
      setUsdJpy: (value) => {
        set({ usdJpy: value <= 0 ? 1 : value })
      },
      updateRecord: (id, updater) => {
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? updater(r) : r)),
        }))
      },
      usdJpy: 150,
    }),
    {
      name: "leverage-calculator",
      partialize: (s): State => ({
        accountBalanceJpy: s.accountBalanceJpy,
        records: s.records,
        usdJpy: s.usdJpy,
      }),
      version: 1,
    },
  ),
)
