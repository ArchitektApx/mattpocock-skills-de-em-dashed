Skills are organized into bucket folders under `skills/`:

- `engineering/` - daily code work
- `productivity/` - daily non-code workflow tools
- `misc/` - kept around but rarely used, not promoted
- `in-progress/` - beta: public on purpose, feedback wanted, not shipped in the plugin
- `deprecated/` - no longer used

Every skill in `engineering/` or `productivity/` (the **promoted** buckets) must have a reference in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`'s `skills` array (the Claude Code plugin ships exactly the promoted set). Skills in `misc/`, `in-progress/`, and `deprecated/` must not appear in either.

Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md). `.claude-plugin/marketplace.json` makes the repo its own single-plugin marketplace - a fallback the install block explains, not the documented route. Run `claude plugin validate . --strict` after touching either manifest. Why a Claude plugin but not (yet) a Codex one lives in [.agents/adr/0002-ship-as-a-claude-code-plugin.md](./.agents/adr/0002-ship-as-a-claude-code-plugin.md).

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

Each bucket folder has a `README.md` that lists every skill in the bucket with a one-line description, with the skill name linked to its `SKILL.md`. The promoted buckets' `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**; non-promoted bucket `README.md`s (`misc/`, `in-progress/`) use a flat list.

Skills in `engineering/` and `productivity/` also have a human-facing docs page at `docs/<bucket>/<skill-name>.md` (the docs tree mirrors those two bucket folders under `skills/`). The published URL is `https://aihero.dev/skills-<skill-name>` regardless of bucket - the docs path is repo organisation only. When you add, rename, or change the behaviour of a skill in `engineering/` or `productivity/`, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md). A finished page carries four sections - **What it does**, **When to reach for it**, **Common questions**, **It's working if** - and `writing-docs.md` holds the template, the section order, and where to hunt for the questions. Skills in the non-promoted buckets (`misc/`, `in-progress/`, `deprecated/`) get **no** docs page.

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). See [.agents/invocation.md](./.agents/invocation.md).

[`ask-matt`](./skills/engineering/ask-matt/SKILL.md) is the router that maps every user-reachable skill and how they relate. The same trigger that re-syncs a docs page applies to it: whenever you add, rename, remove, or change how a user-reachable skill fits the flows, re-read `ask-matt`'s `SKILL.md` and update it so the map stays accurate - a new skill it never mentions, or a stale one it still routes to, is a router that lies.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current; re-run the script after adding, removing, or renaming a skill.

<!-- fork-section:start -->
# This repo is a fork

This is [ArchitektApx/mattpocock-skills-de-em-dashed](https://github.com/ArchitektApx/mattpocock-skills-de-em-dashed), a fork of [mattpocock/skills](https://github.com/mattpocock/skills) whose only intended difference is that every em dash is replaced by a hyphen. On every sync the whole tree is regenerated from upstream, then `scripts/fork/apply-fork.mjs` and `scripts/fork/de-em-dash.sh` run on top. Only `.github/` and `scripts/fork/` are owned by the fork and survive a sync; edits anywhere else are overwritten by the next sync and belong upstream. See [scripts/fork/README.md](./scripts/fork/README.md).

## Working in this repository

`main` is protected by a ruleset with no bypass, so nothing lands by pushing to it. Branch, push the branch, open a PR, merge it yourself. To merge, a PR needs the `verify` check green and squash as its merge method; it needs no approvals.

Every commit must be signed. Local commits inherit `commit.gpgsign`; the sync and de-em-dash jobs' commits are signed because `sign-commits: true` makes `peter-evans/create-pull-request` commit through the GitHub API.

Repository policy requires every action to be pinned to a full commit SHA. A tag reference does not fail review, it fails the run. Dependabot owns action versions and bumps them in one grouped PR monthly; bumping a SHA by hand only creates a conflict with the next one.

## Invariants

Preserve these through any refactor of `.github/workflows/`:

- **Actions pinned to commit SHAs**, enforced by repository policy. `create-pull-request` holds `contents: write`; a moved tag is a write path into this repository.
- **Sync PR body passed as `body-path`.** It embeds upstream commit subjects. Routed through `GITHUB_OUTPUT`, a subject matching the heredoc delimiter lets upstream write arbitrary step outputs.
- **`verify.yml` triggers on `pull_request`.** It runs PR-head code, so `pull_request_target` would hand fork PRs write access and secrets.
- **`sign-commits: true` on the default `GITHUB_TOKEN`.** A PAT keeps the PR working and silently drops the signature, which `required_signatures` on `main` then rejects.
- **No em dash in any tracked text file.** `verify` fails a PR that contains one; `scripts/fork/de-em-dash.sh` fixes it.
- **Symlinks and executables are allowlisted, hooks and MCP servers are absent.** Everything here is redistributed verbatim to installers. `verify` fails on a symlink or executable missing from `scripts/fork/audit-allowlist.txt`, and on any `hooks`/`mcpServers` declaration or `.mcp.json`. Add to the allowlist only after reading the file.
<!-- fork-section:end -->
