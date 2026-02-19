# Workspace Node Modules Policy (Bun)

This repo is configured to use a single hoisted dependency tree at the workspace root.

## Current Configuration

Root `bunfig.toml` already enforces:

- `[install] linker = "hoisted"`

That means Bun should place shared dependencies in root `node_modules` and reuse them across `api`, `our-app`, and `packages/*`.

## Important Behavior

- A workspace may still show a local `node_modules` entry in some setups, often as links/stubs.
- The real package storage is still root-level when hoisted mode is active.
- Do not treat every workspace `node_modules` appearance as duplicate installs.

## Safe Install Workflow

Always install from repo root:

1. Open terminal at `D:\Projects\BusinessPro`
2. Install deps from root (workspace-aware install)
3. Restart running dev processes after install

## Adding Dependencies

Use workspace-aware add commands from root so lockfile and dependency graph stay consistent.

- Add for API workspace: `bun add <pkg> --filter api`
- Add for web workspace: `bun add <pkg> --filter my-v0-project`
- Add at root only when intentionally shared by root scripts/tooling

## Why This Document Exists

We repeatedly hit confusion where a package install looked like it went into `api` only.

In this repo, the goal is:

- one root dependency graph
- predictable workspace installs
- no accidental per-folder package-manager drift

If this issue appears again, reference this file together with:

- `docs/DB_SYNC_MIGRATION_TROUBLESHOOTING.md`
