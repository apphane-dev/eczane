#!/usr/bin/env bash
# Refresh on-duty pharmacy data on a host machine and push the result.
# Intended to be run from cron, e.g.:
#   17 6 * * * /path/to/repo/scripts/update-data.sh
set -euo pipefail

# Resolve the repo root from this script's location so it works from any cwd.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
cd "$repo_root"

# Refresh data for the configured city. Scraped output lands under src/data/.
npm run scrape -- antalya >/dev/null

# Only commit when the scrape changed tracked data files.
if [ -n "$(git status --porcelain -- src/data/)" ]; then
  git add src/data/
  printf 'chore: update pharmacy data\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>\n' \
    | git commit -F -
  # Production source lives on `main`.
  # Override with ECZANE_DATA_BRANCH if that ever changes.
  target_branch="${ECZANE_DATA_BRANCH:-main}"
  git push origin "HEAD:${target_branch}"
fi
