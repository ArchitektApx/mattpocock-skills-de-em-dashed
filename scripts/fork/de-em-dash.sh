#!/usr/bin/env bash
# Replaces every em dash (U+2014) in tracked text files with a regular hyphen.
#
# Idempotent: running it on a clean tree is a no-op. Binary files are skipped
# (git grep -I), and this script excludes itself so the byte sequence below
# survives. Run from anywhere inside the repo.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

EM_DASH=$'\xe2\x80\x94'
SELF="scripts/fork/de-em-dash.sh"

count=0
while IFS= read -r -d '' file; do
  perl -CSD -pi -e 's/\x{2014}/-/g' "$file"
  count=$((count + 1))
done < <(git grep -Ilz -e "$EM_DASH" -- . ":(exclude)$SELF" || true)

echo "de-em-dash: rewrote $count file(s)"
