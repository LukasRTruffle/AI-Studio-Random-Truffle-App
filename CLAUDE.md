# Claude Coding Copilot Guidelines for Random Truffle

This document provides guidelines for AI assistants working on the Random Truffle codebase.

## Project Overview

Random Truffle is an enterprise AI-driven marketing intelligence and activation platform.

## Tech Stack

### Monorepo Structure

```
random-truffle/
├── apps/
│   └── web/                    # Next.js App Router frontend
├── services/
│   ├── api/                    # NestJS backend API
│   └── orchestrator/           # Cloud Run worker service
├── agents/
│   ├── data-science/           # Data science agent
│   └── audience-builder/       # Audience builder agent
├── packages/
│   ├── core/                   # Core shared utilities
│   ├── auth/                   # Authentication package
│   ├── ui/                     # UI components library
│   ├── cortex-model/           # Cortex model definitions
│   └── telemetry/              # Telemetry & monitoring
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   ├── docker/                 # Docker configurations
│   └── policies/               # IAM & security policies
└── data/
    └── bq/                     # BigQuery schemas & queries
```

### Technology Choices

- **Frontend**: Next.js App Router (standardized)
- **Backend API**: NestJS (TypeScript throughout, shared DTOs/types)
- **Worker Services**: Cloud Run (orchestrator)
- **TypeScript**: Strict mode everywhere
- **Data Warehouse**: BigQuery with Cortex views
- **Cloud Platform**: Google Cloud Platform

## Architecture Principles

### Human-in-the-Loop (HITL) Governance

Risky actions require human approval:
- Device approvals
- Audience pushes to ad platforms
- Infrastructure applies (Terraform)

### Data Plane

- **BigQuery**: Central data warehouse
- **Cortex Views**: GA4 integration, Ads network data
- **Consent Registry**: SHA-256 hashed identifiers with salt
- **Data Sources**: GA4, Google Ads networks

### Activation Channels (Phase 5 Target)

Multi-account support for:
- Google Ads
- Meta (Facebook/Instagram)
- TikTok

### MCP Connectors

Model Context Protocol integrations:
- BigQuery
- GA4 (Google Analytics 4)
- Looker
- Google Ads

**Security**:
- Secrets via GCP Secret Manager
- Least-privilege IAM roles
- No hardcoded credentials

## Development Workflow

### Quality Gates

All code must pass:

```bash
make check    # Linting + type checking
make test     # Unit tests
make e2e      # End-to-end tests (Playwright)
```

**CI/CD**: All quality gates must pass in continuous integration.

### Code Standards

- TypeScript strict mode enabled in all packages
- Shared types/DTOs between frontend and backend
- Follow Next.js App Router patterns
- NestJS best practices for API development

### Artifact Management

Store development artifacts under:
```
thoughts/shared/
├── research/     # Research documents
├── plans/        # Project plans & specifications
└── prs/          # Pull request templates & notes
```

### Context Management

- Keep chat context under ~60% to avoid token limits
- Write comprehensive documentation to files
- Use `/clear` command after writing to files when context is high

## Best Practices

1. **Type Safety**: Leverage TypeScript strict mode
2. **Shared Code**: Use monorepo packages for shared logic
3. **Testing**: Write tests before pushing code
4. **Documentation**: Keep README files updated in each package
5. **Security**: Never commit secrets; use Secret Manager
6. **IAM**: Follow principle of least privilege
7. **Governance**: Implement HITL for sensitive operations

## Getting Started

```bash
# Install dependencies
npm install

# Run quality checks
make check

# Run tests
make test

# Start development
npm run dev
```

## Questions?

Refer to package-specific README files for detailed documentation on each component.
