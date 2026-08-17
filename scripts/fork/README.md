# Fork tooling

This repo is [ArchitektApx/mattpocock-skills-de-em-dashed](https://github.com/ArchitektApx/mattpocock-skills-de-em-dashed), a fork of [mattpocock/skills](https://github.com/mattpocock/skills). The only intended difference from upstream is that every em dash (U+2014) is replaced by a regular hyphen.

## How the fork stays in sync

`main` is regenerated from upstream, not merged with it. [`.github/workflows/sync-upstream.yml`](../../.github/workflows/sync-upstream.yml) runs daily (and on demand) and does:

1. Check out `upstream/main` as the working tree.
2. Overlay the **fork-owned paths** from our `main`: `.github/workflows/` and `scripts/fork/`. Upstream's copies of those paths are dropped (that is how upstream's `release.yml` stays out of the fork).
3. Run [`apply-fork.mjs`](./apply-fork.mjs): points `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `package.json` at the fork, prepends the fork notice to `README.md`, appends the fork section to `CLAUDE.md`.
4. Run [`de-em-dash.sh`](./de-em-dash.sh): rewrites every em dash in tracked text files to `-`.
5. Commit the resulting tree as a merge of our `main` and `upstream/main` and push.

Because the tree is rebuilt from scratch there is nothing to conflict. The merge commit exists only so `git log` keeps upstream's history.

[`.github/workflows/de-em-dash.yml`](../../.github/workflows/de-em-dash.yml) additionally runs `de-em-dash.sh` on every push to `main` and commits the result, so a human push with em dashes gets cleaned up too.

## What this means for edits

- Edits under `.github/workflows/` and `scripts/fork/` are fork changes and survive a sync.
- Anything `apply-fork.mjs` writes is regenerated; change the script, not the output.
- Everything else is upstream content and is overwritten by the next sync. Send those changes to [mattpocock/skills](https://github.com/mattpocock/skills).

## Running locally

```bash
node scripts/fork/apply-fork.mjs
bash scripts/fork/de-em-dash.sh
```

Both are idempotent.
