.PHONY: help check lint format test e2e clean install dev build

# Default target
help:
	@echo "Random Truffle - Available Commands:"
	@echo ""
	@echo "Quality Gates:"
	@echo "  make check    - Run linting and type checking (required before commit)"
	@echo "  make test     - Run unit tests"
	@echo "  make e2e      - Run end-to-end tests (Playwright - Phase 5)"
	@echo ""
	@echo "Development:"
	@echo "  make lint     - Run ESLint"
	@echo "  make format   - Format code with Prettier"
	@echo "  make fix      - Auto-fix linting issues"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean    - Clean build artifacts"
	@echo ""
	@echo "Phase 0 Status: Quality tooling setup complete ✓"

# Quality gate: Run all checks (CI/CD will run this)
check: lint typecheck
	@echo "✓ All quality checks passed!"

# Linting
lint:
	@echo "Running ESLint..."
	@npm run lint

# Type checking
typecheck:
	@echo "Running TypeScript compiler..."
	@npx tsc --noEmit

# Auto-fix linting issues
fix:
	@echo "Auto-fixing ESLint issues..."
	@npm run lint:fix

# Format code with Prettier
format:
	@echo "Formatting code with Prettier..."
	@npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"

# Run unit tests
test:
	@echo "Running unit tests..."
	@npm run test

# Run end-to-end tests (Playwright - Phase 5)
e2e:
	@echo "E2E tests not yet implemented (Phase 5)"
	@echo "TODO: Add Playwright E2E tests"

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm install

# Start development server
dev:
	@echo "Starting development server..."
	@npm run dev

# Build for production
build:
	@echo "Building for production..."
	@npm run build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist build .next node_modules/.cache
	@echo "✓ Clean complete"
