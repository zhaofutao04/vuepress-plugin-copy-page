#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# release.sh - Version release script
#
# Usage:
#   ./scripts/release.sh <version>
#
# Examples:
#   ./scripts/release.sh 1.4.0
#   ./scripts/release.sh v1.4.0
#   ./scripts/release.sh 1.4.0-rc.1
#
# What it does:
#   1. Update version in package.json
#   2. Run build + lint + test to verify
#   3. Git commit, tag, and push
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Parse version argument ---
if [ $# -eq 0 ]; then
  echo -e "${RED}Error: version argument required${NC}"
  echo "Usage: $0 <version>"
  echo "Example: $0 1.4.0"
  exit 1
fi

VERSION="${1#v}"  # Strip leading 'v' if present
TAG="v${VERSION}"

# Validate semver format (supports pre-release like 1.0.0-rc.1)
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
  echo -e "${RED}Error: invalid version format '${VERSION}'${NC}"
  echo "Expected semver format: x.y.z or x.y.z-pre.n"
  exit 1
fi

# --- Check working directory is clean ---
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: working directory is not clean${NC}"
  echo "Please commit or stash your changes first."
  git status --short
  exit 1
fi

# --- Check git tag doesn't already exist ---
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  echo -e "${RED}Error: tag '${TAG}' already exists${NC}"
  exit 1
fi

# --- Version comparison (must be greater than published versions) ---
# Compare using node for proper semver handling (including pre-release)
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Get latest git tag version (highest semver)
LATEST_TAG_VERSION=$(git tag -l 'v*' | sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1)

# Get latest npm published version (may fail if never published)
NPM_VERSION=$(npm view vuepress-plugin-copy-page version 2>/dev/null || echo "")

# Use node for reliable semver comparison
node -e "
const newVer = '${VERSION}';
const sources = [
  { name: 'package.json', ver: '${CURRENT_VERSION}' },
  { name: 'latest git tag', ver: '${LATEST_TAG_VERSION:-}' },
  { name: 'npm registry', ver: '${NPM_VERSION:-}' },
].filter(s => s.ver);

// Simple semver compare: split into [major, minor, patch, pre-release]
function parseVer(v) {
  const [core, pre] = v.split('-');
  const parts = core.split('.').map(Number);
  return { major: parts[0], minor: parts[1], patch: parts[2], pre: pre || '' };
}

function compareVer(a, b) {
  const va = parseVer(a), vb = parseVer(b);
  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  if (va.patch !== vb.patch) return va.patch - vb.patch;
  // Has pre-release > no pre-release (1.0.0-rc.1 > 1.0.0)
  if (!va.pre && vb.pre) return -1;
  if (va.pre && !vb.pre) return 1;
  if (va.pre && vb.pre) return va.pre.localeCompare(vb.pre);
  return 0;
}

const errors = [];
for (const s of sources) {
  const cmp = compareVer(newVer, s.ver);
  if (cmp < 0) {
    errors.push('  ' + s.name + ': ' + s.ver + ' (higher)');
  } else if (cmp === 0) {
    errors.push('  ' + s.name + ': ' + s.ver + ' (same)');
  }
}

if (errors.length > 0) {
  console.error('\x1b[31mError: new version ${VERSION} must be greater than all published versions:\x1b[0m');
  errors.forEach(e => console.error(e));
  process.exit(1);
}
"

echo -e "${YELLOW}Current version:   ${CURRENT_VERSION} (package.json)${NC}"
[ -n "${LATEST_TAG_VERSION:-}" ] && echo -e "${YELLOW}Latest git tag:    ${LATEST_TAG_VERSION}${NC}"
[ -n "${NPM_VERSION:-}" ] && echo -e "${YELLOW}Latest npm version: ${NPM_VERSION}${NC}"
echo -e "${GREEN}New version:       ${VERSION}${NC}"
echo -e "${GREEN}Git tag:           ${TAG}${NC}"
echo ""

# --- Confirm ---
read -rp "Proceed? (y/N) " confirm
if [[ ! "$confirm" =~ ^[yY]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# --- Step 1: Update package.json ---
echo ""
echo -e "${GREEN}[1/5] Updating package.json...${NC}"
# Use node to safely update JSON without breaking formatting
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.version = '${VERSION}';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "  package.json -> ${VERSION}"

# --- Step 2: Build ---
echo ""
echo -e "${GREEN}[2/5] Building...${NC}"
pnpm run build

# --- Step 3: Lint + Test ---
echo ""
echo -e "${GREEN}[3/5] Running lint & tests...${NC}"
pnpm run lint
pnpm run test

# --- Step 4: Commit ---
echo ""
echo -e "${GREEN}[4/5] Committing...${NC}"
git add package.json
git commit -m "chore: bump version to ${VERSION}"

# --- Step 5: Tag ---
echo ""
echo -e "${GREEN}[5/5] Creating tag ${TAG}...${NC}"
git tag "${TAG}"

# --- Done ---
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Release ${TAG} ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Run the following to publish:"
echo ""
echo -e "  ${YELLOW}git push origin main --tags${NC}"
echo ""
echo "This will trigger GitHub Actions to publish to npm."
