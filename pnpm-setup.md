# PNPM Setup Guide

This guide explains how to set up and use pnpm with the Stellar Conferencing project.

## What is PNPM?

PNPM (Performant NPM) is a fast, disk space efficient package manager for Node.js. It's designed to be a drop-in replacement for npm and yarn.

## Key Benefits

- **Faster**: PNPM is significantly faster than npm and yarn
- **Disk Space Efficient**: Uses a content-addressable filesystem to avoid duplicating packages
- **Strict**: Prevents phantom dependencies and ensures reproducible builds
- **Monorepo Support**: Excellent support for monorepos with workspaces

## Installation

### Global Installation

```bash
# Using npm
npm install -g pnpm

# Using curl (Unix/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Using PowerShell (Windows)
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### Verify Installation

```bash
pnpm --version
```

## Project Setup

### 1. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

### 2. Development Commands

```bash
# Start development servers (frontend + backend)
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm check-types

# Format code
pnpm format
```

### 3. Individual App Commands

```bash
# Frontend (React/Vite)
cd apps/web
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm storybook    # Start Storybook

# Backend (NestJS)
cd apps/server
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
```

## Workspace Structure

The project uses pnpm workspaces with the following structure:

```
stellar-conferencing/
├── apps/
│   ├── web/          # React frontend
│   └── server/       # NestJS backend
├── packages/
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared TypeScript config
│   └── ui/               # Shared UI components
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root package.json
└── turbo.json           # Turbo configuration
```

## Package Management

### Adding Dependencies

```bash
# Add to root (shared dependencies)
pnpm add <package-name>

# Add to specific app
pnpm --filter stellar add <package-name>
pnpm --filter stellar-server add <package-name>

# Add dev dependencies
pnpm add -D <package-name>
pnpm --filter stellar add -D <package-name>
```

### Removing Dependencies

```bash
# Remove from root
pnpm remove <package-name>

# Remove from specific app
pnpm --filter stellar remove <package-name>
```

### Running Scripts

```bash
# Run script in all packages
pnpm --recursive <script-name>

# Run script in specific package
pnpm --filter stellar <script-name>
```

## Configuration Files

### pnpm-workspace.yaml
Defines the workspace structure and which packages are included.

### .npmrc
Contains pnpm-specific configurations:
- `auto-install-peers=true`: Automatically install peer dependencies
- `strict-peer-dependencies=false`: Allow flexible peer dependency resolution
- `shamefully-hoist=true`: Hoist dependencies for compatibility

### package.json
- `packageManager`: Specifies pnpm version
- `workspaces`: Defines workspace packages (for compatibility)

## Migration from NPM

If you're migrating from npm:

1. **Remove existing lock files:**
   ```bash
   rm package-lock.json
   rm -rf node_modules
   ```

2. **Install with pnpm:**
   ```bash
   pnpm install
   ```

3. **Update scripts:**
   - Replace `npm run` with `pnpm`
   - Update CI/CD pipelines to use pnpm

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

### Docker Example

```dockerfile
FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

## Troubleshooting

### Common Issues

1. **Peer dependency warnings:**
   - These are usually safe to ignore
   - Use `--shamefully-hoist` if needed for compatibility

2. **Lock file conflicts:**
   - Delete `pnpm-lock.yaml` and run `pnpm install`
   - Ensure all team members use the same pnpm version

3. **Workspace issues:**
   - Verify `pnpm-workspace.yaml` is correctly configured
   - Check that all package.json files have correct names

### Performance Tips

1. **Use pnpm store:**
   ```bash
   pnpm config set store-dir ~/.pnpm-store
   ```

2. **Enable parallel installation:**
   ```bash
   pnpm install --parallel
   ```

3. **Use frozen lockfile in CI:**
   ```bash
   pnpm install --frozen-lockfile
   ```

## Additional Resources

- [PNPM Documentation](https://pnpm.io/)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [PNPM vs NPM vs Yarn](https://pnpm.io/benchmarks)
- [Migration Guide](https://pnpm.io/migration)
