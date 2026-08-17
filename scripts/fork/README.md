# Fork tooling

This repo is [ArchitektApx/mattpocock-skills-de-em-dashed](https://github.com/ArchitektApx/mattpocock-skills-de-em-dashed), a fork of [mattpocock/skills](https://github.com/mattpocock/skills). The only intended difference from upstream is that every em dash (U+2014) is replaced by a regular hyphen.

## How the fork stays in sync

`main` is regenerated from upstream, not merged with it. [`.github/workflows/sync-upstream.yml`](../../.github/workflows/sync-upstream.yml) runs daily (and on demand) and does:

1. Set the working tree and index to `upstream/main` (HEAD stays on `main`).
2. Overlay the **fork-owned paths** from `main`: `.github/` and `scripts/fork/`. Upstream's copies of those paths are dropped (that is how upstream's `release.yml` stays out of the fork).
3. Run [`apply-fork.mjs`](./apply-fork.mjs): points `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `package.json` at the fork, prepends the fork notice to `README.md`, appends the fork section to `CLAUDE.md`.
4. Run [`de-em-dash.sh`](./de-em-dash.sh): rewrites every em dash in tracked text files to `-`.
5. Record the upstream commit in `.sync-state.json` (used to list upstream commits in the next PR body).
6. Open a pull request (`sync/upstream` branch) via `peter-evans/create-pull-request` with signed commits. A human squash-merges it.

Because the tree is rebuilt from scratch there is nothing to conflict. Nothing pushes to `main` directly; the ruleset on `main` has no bypass.

[`.github/workflows/verify.yml`](../../.github/workflows/verify.yml) is the required `verify` status check. It fails a PR that contains an em dash, whose fork overlay is out of date, whose JSON manifests do not parse, whose `plugin.json` lists a skill path without a `SKILL.md`, that declares hooks or MCP servers, whose `SKILL.md` files lack `name`/`description` frontmatter or share a name, or that adds a symlink or executable not listed in [`audit-allowlist.txt`](./audit-allowlist.txt). The allowlist is edited only after a human has read the file: everything in this repo is redistributed verbatim to whoever installs from it. [`.github/workflows/de-em-dash.yml`](../../.github/workflows/de-em-dash.yml) is a safety net that opens a PR replacing em dashes on `main` if any slipped through.

## What this means for edits

- Edits under `.github/` and `scripts/fork/` are fork changes and survive a sync.
- Anything `apply-fork.mjs` writes is regenerated; change the script, not the output.
- `.sync-state.json` is written by the sync; do not edit it by hand.
- Everything else is upstream content and is overwritten by the next sync. Send those changes to [mattpocock/skills](https://github.com/mattpocock/skills).

## Running locally

```bash
node scripts/fork/apply-fork.mjs
bash scripts/fork/de-em-dash.sh
```

Both are idempotent.
