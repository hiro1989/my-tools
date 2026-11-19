# browser-automation の保守

- 普段の session で読む必要はない。
- official skill を update するとき、またはこの repo の調整を変えるときに読む。

## 由来

- `SKILL.md` と `references/` は、`@playwright/cli` package に同梱された `skills/playwright-cli/` を元にする。
- 元にした version は `playwright-cli-version` が持つ。
- `SKILL.md` は official を書き直した版である。
  - update 時は、official の `SKILL.md` で増えた内容をこの版に取り込む。
- `references/` は official の本文に、この repo の調整を載せた版である。

## Update 手順

1. `playwright-cli-version` を新しい version に上げる。
2. `pnpm add -g @playwright/cli@<version>` で local の CLI を揃える。
3. 新しい同梱 skill を、pre-commit formatter 以外の編集なしで commit する。
   - commit message には `import official playwright-cli skill` を含める。次回の update で、この commit を起点に調整を探すためである。
4. 前回の import 以降にこの skill へ入った diff を、この repo の調整として別の commit で載せ直す。

   ```bash
   git log --grep='import official playwright-cli skill' -- .claude/skills/browser-automation
   ```

5. official で増えた内容を、下の「調整の方針」に照らして点検する。

## 調整の方針

- official と project の事情が衝突する箇所は、本文をその場で直す。
  - 理由: update のたびに 1 度だけ払うコストで、普段の多数の session で起きる混乱を防げるため。
  - 不採用案: 本文は official のまま残し、`SKILL.md` の override で上書きする。reference を読み込んだ時点で目に入るのは official の例なので、override が無視されやすい。
- 直し方は、なるべく単純な削除か追記にする。
  - 理由: update 時の再適用で判断が要らないため。
- project の事情と衝突する箇所は、書き換えてでも矛盾をなくす。
  - 例示の command も対象にする。agent は例を逐語的に copy するため。
- `CLAUDE.md` の Writing Style は official 由来の文に適用しない。
  - 理由: 文体の違いは矛盾や混乱を生まず、書き直すと再適用の手間だけが増えるため。

## この repo 固有の調整

update 時に、official の新しい内容がこれらと衝突していないか点検する。

- 出力先
  - file を書き出す例は、すべて `.playwright-cli/` 直下に書く。
    - 理由: file 名の引数は cwd 基準で解決されるので、repo root に未追跡の file が散らかるため。`.playwright-cli/` は gitignore 済みである。
  - `.gitignore` への追加を指示する文は削除する。
- package manager
  - `npx` と `npm` の記述は、削除するか `pnpm` に置き換える。
    - 理由: `.claude/hooks/require-pnpm.sh` が `pnpm` 以外の package manager の実行を止めるため。
- local file の配信
  - `python3 -m http.server` を使う。
    - 理由: この repo は uv を管理していないため。
- この repo の app
  - 起動手順は `SKILL.md` の Conventions だけが持つ。
  - `networkidle` で待つ例は削除する。
- PR や issue への添付
  - `gh-attachment-upload` skill はこの repo にないので、添付の手順は書かない。
- 録画
  - ffmpeg がないときは `playwright-cli install-browser ffmpeg` で入れる。
    - 理由: error が案内する `npx` の command は hook に止められ、この方法なら CLI に合う version の ffmpeg が入るため。
- cloud session
  - 元の skill にある `scripts/cloud-env-notes.sh` は持たない。
    - 理由: この repo は cloud session に playwright-cli を install する setup script を持たないため。

## 削除した official の内容

update で再び取り込まないよう、理由を残す。

- `references/test-generation.md`
  - spec 文書から scenario ごとの test を量産する workflow である。
  - この repo は component test と e2e test を書かない。
- `references/playwright-tests.md`
  - `--debug=cli` で止めた test に `playwright-cli attach` する、test の debug 手順である。
  - この repo は Playwright test を持たない。
- `references/pr-attachments.md`
  - 上の「PR や issue への添付」の方針による。
