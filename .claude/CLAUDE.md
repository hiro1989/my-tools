## Writing Style

- **Prefer short, clear bullet points or numbered lists over long prose.**
  - Use a numbered list only where order carries meaning (priority, evaluation order, sequence), and a bullet list everywhere else.
  - In documents, keep table cells to short values such as names, flags, or identifiers.
  - Never put rules, rationale, or multiple sentences in a cell; write them as lists instead.
- **Use plain English words instead of ambiguous symbols.**
  - e.g. `A or B` not `A/B`, `use X instead of Y` not `X → Y`, `about 5` not `~5`.
- **Write only what stays true until someone edits it.**
  - Applies to all committed prose, e.g. code comments, GraphQL descriptions, and `.md` files.
  - Exempt: commit messages and PR descriptions, because they are snapshots of one point in time.
  - Exempt: `draft-specs/`, because it exists to describe in-flight changes.
  - Never write process state that becomes false without an edit, e.g. "currently migrating to X", "for now", "temporary until #123 merges", "will be removed".
    - Why: nothing prompts an update when the process ends, so the text silently turns false.
  - Never write change history, e.g. "previously X", "changed to Y", "added for PR #123", or the motivation behind one specific edit.
    - Why: git history owns it, and the motivation belongs in the commit message.
    - Keep a past event only when it is a forward-looking constraint, such as an incident that makes a value non-negotiable or a rejected alternative that would otherwise be re-proposed.
  - Never copy counts, versions, enum members, lists, or business rules that another definition or file owns, e.g. "there are 5 handlers", "status is one of A, B, or C"; reference the owner instead.
    - Why: the copy drifts when the owner changes.
  - Track in-flight work in an issue; where a reader must know about it, leave a single-line TODO with the issue URL.
- **Never hard-wrap prose mid-sentence. One sentence per line.** (Breaks at list items and paragraphs are fine.)
  - Applies to all prose contexts: JSDoc and other code comments, `.md` files, PR descriptions, commit message bodies.
  - This rule overrides the conventional 80-column wrap in every language, e.g. JSDoc, shell, Terraform, Python, SQL, YAML, even for long sentences.
  - Why: mid-sentence breaks disrupt LLM tokenization and hurt human readability.

## Project

- 個人的な便利ツール Web application である。

## Commands

- 検証は `pnpm lint-dry`, `pnpm test`, `pnpm build` で行う。
- `pnpm lint` は format と lint の autofix を行う。
- 型検査は `tsc` ではなく、oxlint の `options.typeCheck` (oxlint-tsgolint) で lint と同時に行う。
- package manager は pnpm のみ使う。
- `pnpm-workspace.yaml` の `minimumReleaseAge` により、公開直後の version は install できない。

## Code

- import alias は `@/` ではなく `#/` を使う。
- domain logic は `src/domain/` に純関数で書く。
  - record の操作は `CalculatorRecord` を受け取り、新しい `CalculatorRecord` を返す。
  - component からは store の `updateRecord(id, updater)` に渡して使う。
- 通貨は record 単位で持ち、order と比較価格の金額は数値だけを持つ。
- test は `src/domain/` と `src/lib/` だけを対象にし、component test は書かない。
- 永続化する state の形を変えるときは、`src/store.ts` の `persist` の `version` を上げて `migrate` を書く。
- `src/components/ui/` は shadcn CLI の生成物なので、手で編集しない。
  - component の追加は `pnpm dlx shadcn add <name>` で行う。
  - 色や罫線の調整は `src/index.css` の theme token か、`src/components/` 直下の component で行う。
- oxlint, oxfmt, lefthook の設定は `/Users/biz/work/sy/synergeee/frontend` の規約に揃える。

## Deploy

- Cloudflare Workers Static Assets (`wrangler.jsonc`) に、Workers Builds の Git 連携で deploy する。
