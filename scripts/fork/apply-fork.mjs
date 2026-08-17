#!/usr/bin/env node
// Applies the fork-specific changes on top of an upstream (mattpocock/skills)
// tree. The sync workflow runs this after checking out upstream/main, so
// everything here must be idempotent and must not assume any prior fork state.
//
// What it does:
//   - points .claude-plugin/plugin.json, .claude-plugin/marketplace.json and
//     package.json at this fork
//   - prepends the fork notice to README.md (between marker comments)
//   - appends the fork section to CLAUDE.md (between marker comments)
//
// Em dash replacement is a separate step: scripts/fork/de-em-dash.sh.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const FORK_SLUG = "ArchitektApx/mattpocock-skills-de-em-dashed";
const FORK_URL = `https://github.com/${FORK_SLUG}`;
const UPSTREAM_SLUG = "mattpocock/skills";
const UPSTREAM_URL = `https://github.com/${UPSTREAM_SLUG}`;
const MARKETPLACE_NAME = "architektapx";
const OWNER = { name: "ArchitektApx", url: "https://github.com/ArchitektApx" };
const FORK_SUFFIX = " Fork of mattpocock/skills with every em dash replaced by a hyphen.";

const changed = [];

function readJson(rel) {
  return JSON.parse(readFileSync(join(repo, rel), "utf8"));
}

function writeJson(rel, value) {
  const next = JSON.stringify(value, null, 2) + "\n";
  const path = join(repo, rel);
  if (readFileSync(path, "utf8") !== next) {
    writeFileSync(path, next);
    changed.push(rel);
  }
}

function withSuffix(text) {
  if (typeof text !== "string") return FORK_SUFFIX.trim();
  return text.includes(FORK_SUFFIX.trim()) ? text : text.trimEnd() + FORK_SUFFIX;
}

// .claude-plugin/plugin.json
{
  const plugin = readJson(".claude-plugin/plugin.json");
  plugin.repository = FORK_URL;
  plugin.description = withSuffix(plugin.description);
  writeJson(".claude-plugin/plugin.json", plugin);
}

// .claude-plugin/marketplace.json
{
  const marketplace = readJson(".claude-plugin/marketplace.json");
  marketplace.name = MARKETPLACE_NAME;
  marketplace.owner = OWNER;
  marketplace.description = withSuffix(marketplace.description);
  for (const plugin of marketplace.plugins ?? []) {
    plugin.description = withSuffix(plugin.description);
  }
  writeJson(".claude-plugin/marketplace.json", marketplace);
}

// package.json
{
  const pkg = readJson("package.json");
  if (pkg.repository && typeof pkg.repository === "object") {
    pkg.repository.url = FORK_URL;
  } else {
    pkg.repository = { type: "git", url: FORK_URL };
  }
  writeJson("package.json", pkg);
}

// README.md: fork notice at the very top
{
  const path = join(repo, "README.md");
  const source = readFileSync(path, "utf8");
  const START = "<!-- fork-notice:start -->";
  const END = "<!-- fork-notice:end -->";
  const notice = [
    START,
    `> **This is a fork.** [${FORK_SLUG}](${FORK_URL}) tracks [${UPSTREAM_SLUG}](${UPSTREAM_URL}) and replaces every em dash with a regular hyphen (\`-\`). Nothing else changes: upstream is synced automatically and the em dash replacement runs on every push.`,
    ">",
    "> **Install this fork instead of the upstream plugin.** Pick one route; installing both gives you every skill twice.",
    ">",
    "> - **Claude Code**: add this repo as a marketplace, then install the plugin from it.",
    ">",
    ">   ```",
    `>   /plugin marketplace add ${FORK_SLUG}`,
    `>   /plugin install mattpocock-skills@${MARKETPLACE_NAME}`,
    ">   ```",
    ">",
    `>   Or from the terminal: \`claude plugin marketplace add ${FORK_SLUG}\` then \`claude plugin install mattpocock-skills@${MARKETPLACE_NAME}\`.`,
    ">",
    "> - **Codex, and other agents**:",
    ">",
    ">   ```bash",
    `>   npx skills@latest add ${FORK_SLUG}`,
    ">   ```",
    ">",
    "> The install commands further down are upstream's and point at the original repo; they are left untouched by the sync.",
    END,
    "",
  ].join("\n");

  const startIdx = source.indexOf(START);
  const endIdx = source.indexOf(END);
  let next;
  if (startIdx !== -1 && endIdx !== -1) {
    const after = source.slice(endIdx + END.length).replace(/^\n/, "");
    next = source.slice(0, startIdx) + notice + after;
  } else {
    next = notice + source;
  }
  if (next !== source) {
    writeFileSync(path, next);
    changed.push("README.md");
  }
}

// CLAUDE.md: fork section at the bottom
{
  const path = join(repo, "CLAUDE.md");
  const source = readFileSync(path, "utf8");
  const START = "<!-- fork-section:start -->";
  const END = "<!-- fork-section:end -->";
  const section = [
    START,
    "# This repo is a fork",
    "",
    `This is [${FORK_SLUG}](${FORK_URL}), a fork of [${UPSTREAM_SLUG}](${UPSTREAM_URL}) whose only intended difference is that every em dash is replaced by a hyphen. On every sync the whole tree is regenerated from upstream, then \`scripts/fork/apply-fork.mjs\` and \`scripts/fork/de-em-dash.sh\` run on top. Only \`.github/workflows/\` and \`scripts/fork/\` are owned by the fork and survive a sync; edits anywhere else are overwritten by the next sync and belong upstream. See [scripts/fork/README.md](./scripts/fork/README.md).`,
    END,
    "",
  ].join("\n");

  const startIdx = source.indexOf(START);
  const endIdx = source.indexOf(END);
  let next;
  if (startIdx !== -1 && endIdx !== -1) {
    const after = source.slice(endIdx + END.length).replace(/^\n/, "");
    next = source.slice(0, startIdx) + section + after;
  } else {
    next = source.trimEnd() + "\n\n" + section;
  }
  if (next !== source) {
    writeFileSync(path, next);
    changed.push("CLAUDE.md");
  }
}

if (changed.length === 0) {
  console.log("apply-fork: nothing to change");
} else {
  console.log(`apply-fork: updated ${changed.join(", ")}`);
}
