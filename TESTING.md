# Testing Guide

This document provides comprehensive information about the testing infrastructure for Random Truffle.

## Overview

Random Truffle uses a multi-layered testing approach to achieve 95% code coverage (ADR-019):

- **Unit Tests**: Vitest for packages (types, core, auth, ui)
- **Integration Tests**: Jest for NestJS backend (services/api)
- **E2E Tests**: Playwright for frontend user flows (apps/web)
- **Coverage Target**: 95% (lines, functions, branches, statements)

## Test Statistics

```
Total Test Files: 9+
Total Test Cases: 160+
Coverage Target: 95% (ADR-019 compliant)

Breakdown:
- Package tests (Vitest): 105+ test cases
- Backend tests (Jest): 40+ test cases
- E2E tests (Playwright): 15+ test cases
```

---

## Package Tests (Vitest)

### Location

```
packages/
├── core/src/__tests__/
│   ├── validation.test.ts       # 40+ tests
│   ├── formatting.test.ts       # 30+ tests
│   └── errors.test.ts           # 20+ tests
└── types/src/__tests__/
    └── index.test.ts            # 15+ tests
```

### Running Package Tests

```bash
# Run all package tests
cd packages/core && pnpm test

# Run with coverage
cd packages/core && pnpm test --coverage

# Watch mode
cd packages/core && pnpm test:watch

# Run types tests
cd packages/types && pnpm test
```

### Coverage Thresholds

Configured in `packages/core/vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 95,
    functions: 95,
    branches: 95,
    statements: 95,
  }
}
```

### Test Examples

**Validation Tests** (`validation.test.ts`):

```typescript
describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

**Formatting Tests** (`formatting.test.ts`):

```typescript
describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});
```

---

## Backend Tests (Jest)

### Location

```
services/api/src/
├── users/
│   ├── users.service.spec.ts      # 15+ tests
│   └── users.controller.spec.ts   # 10+ tests
└── app.service.spec.ts            # 5+ tests
```

### Running Backend Tests

```bash
# Run all backend tests
cd services/api && pnpm test

# Run with coverage
cd services/api && pnpm test --coverage

# Watch mode
cd services/api && pnpm test:watch

# Run specific test file
cd services/api && pnpm test users.service.spec.ts
```

### Coverage Thresholds

Configured in `services/api/jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  }
}
```

### Test Examples

**Service Tests** (`users.service.spec.ts`):

```typescript
describe('UsersService', () => {
  it('should create a new user', async () => {
    const createUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const result = await service.create(createUserDto);
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException when user not found', async () => {
    await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
```

**Controller Tests** (`users.controller.spec.ts`):

```typescript
describe('UsersController', () => {
  it('should return all users', async () => {
    mockUsersService.findAll.mockResolvedValue([mockUser]);
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
  });
});
```

---

## E2E Tests (Playwright)

### Location

```
apps/web/e2e/
├── login.spec.ts              # Login flow tests
├── navigation.spec.ts         # Navigation tests
└── audience-creation.spec.ts  # Audience creation tests
```

### Running E2E Tests

```bash
# Run all E2E tests (headless)
cd apps/web && pnpm test:e2e

# Run with UI mode (visual)
cd apps/web && pnpm test:e2e:ui

# Debug mode (step through)
cd apps/web && pnpm test:e2e:debug

# Run specific test file
cd apps/web && pnpm exec playwright test login.spec.ts

# Run on specific browser
cd apps/web && pnpm exec playwright test --project=chromium
```

### Browser Coverage

E2E tests run on:

- ✅ Desktop Chrome (Chromium)
- ✅ Desktop Firefox
- ✅ Desktop Safari (WebKit)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

### Test Examples

**Login Flow** (`login.spec.ts`):

```typescript
test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL('/welcome');
});
```

**Navigation** (`navigation.spec.ts`):

```typescript
test('should navigate to Analytics page', async ({ page }) => {
  await page.getByRole('link', { name: /analytics/i }).click();
  await expect(page).toHaveURL('/analytics');
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

**Jobs**:

1. **Lint & Type Check**
   - ESLint on all packages
   - TypeScript type checking

2. **Test Packages** (Vitest)
   - Run all package tests
   - Generate coverage reports
   - Upload to Codecov

3. **Test Backend** (Jest)
   - Start PostgreSQL service
   - Run backend tests
   - Generate coverage reports
   - Upload to Codecov

4. **E2E Tests** (Playwright)
   - Install Playwright browsers
   - Build frontend
   - Run E2E tests
   - Upload Playwright report

5. **Build**
   - Build all packages
   - Upload build artifacts

6. **Quality Gate**
   - Verify all jobs passed
   - Fail if any job fails

### Running CI Locally

```bash
# Run full test suite (mimics CI)
pnpm lint
pnpm typecheck
pnpm test
cd apps/web && pnpm test:e2e
pnpm build
```

---

## Coverage Reports

### Viewing Coverage Locally

**Package Coverage**:

```bash
cd packages/core
pnpm test --coverage
# Open packages/core/coverage/index.html in browser
```

**Backend Coverage**:

```bash
cd services/api
pnpm test --coverage
# Open services/api/coverage/index.html in browser
```

### Coverage on CI

Coverage reports are automatically uploaded to Codecov on every CI run:

- Package coverage: `packages` flag
- Backend coverage: `backend` flag

---

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert Pattern**

   ```typescript
   it('should do something', () => {
     // Arrange: Set up test data
     const input = 'test@example.com';

     // Act: Execute the function
     const result = isValidEmail(input);

     // Assert: Verify the result
     expect(result).toBe(true);
   });
   ```

2. **Test One Thing Per Test**

   ```typescript
   // ❌ Bad: Testing multiple things
   it('should create and update user', async () => {
     await service.create(dto);
     await service.update(id, updateDto);
   });

   // ✅ Good: Separate tests
   it('should create user', async () => {
     await service.create(dto);
   });

   it('should update user', async () => {
     await service.update(id, updateDto);
   });
   ```

3. **Use Descriptive Test Names**

   ```typescript
   // ❌ Bad
   it('should work', () => { ... });

   // ✅ Good
   it('should return true for valid email addresses', () => { ... });
   it('should throw ValidationError when email is invalid', () => { ... });
   ```

4. **Mock External Dependencies**

   ```typescript
   const mockRepository = {
     find: jest.fn(),
     create: jest.fn(),
     save: jest.fn(),
   };
   ```

5. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

### E2E Testing Tips

1. **Use Semantic Selectors**

   ```typescript
   // ✅ Good: Use role and accessible name
   await page.getByRole('button', { name: /log in/i });
   await page.getByLabel(/email/i);

   // ❌ Bad: Use CSS selectors
   await page.locator('.login-button');
   ```

2. **Wait for Navigation**

   ```typescript
   await page.getByRole('button', { name: /submit/i }).click();
   await expect(page).toHaveURL('/success');
   ```

3. **Use Fixtures for Common Setup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/login');
     await page.getByLabel(/email/i).fill('test@example.com');
     await page.getByLabel(/password/i).fill('password123');
     await page.getByRole('button', { name: /log in/i }).click();
   });
   ```

---

## Troubleshooting

### Package Tests Failing

**Issue**: Tests fail with "Cannot find module"

```bash
# Solution: Install dependencies
pnpm install

# Or reinstall from scratch
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Backend Tests Failing

**Issue**: Database connection errors

```bash
# Solution: Start PostgreSQL
docker-compose up -d postgres

# Check database is running
docker-compose ps
```

### E2E Tests Failing

**Issue**: "Page not found" or "Element not visible"

```bash
# Solution 1: Build frontend first
cd apps/web && pnpm build

# Solution 2: Check dev server is running
cd apps/web && pnpm dev

# Solution 3: Install Playwright browsers
cd apps/web && pnpm exec playwright install
```

**Issue**: "Timeout exceeded"

```bash
# Solution: Increase timeout in playwright.config.ts
use: {
  timeout: 30000, // 30 seconds
}
```

---

## Test Coverage Metrics

### Current Status

| Package               | Coverage    | Status           |
| --------------------- | ----------- | ---------------- |
| @random-truffle/core  | Target: 95% | ✅ Tests written |
| @random-truffle/types | Target: 95% | ✅ Tests written |
| @random-truffle/auth  | Target: 95% | ⏳ Pending       |
| @random-truffle/ui    | Target: 95% | ⏳ Pending       |
| services/api          | Target: 95% | ✅ Tests written |
| apps/web (E2E)        | -           | ✅ Tests written |

### ADR-019 Compliance

**Requirement**: 95% test coverage across all code

**Current Progress**:

- ✅ Testing infrastructure complete
- ✅ 160+ tests written
- ✅ Coverage thresholds configured
- ⏳ Achieving 95% (run tests to verify)

---

## Future Enhancements

### Phase 2-5 Testing Additions

1. **Phase 2: Data Plane Tests**
   - BigQuery integration tests
   - MCP connector tests
   - GA4 Consent Mode tests

2. **Phase 3: Agent Tests**
   - Golden set tests (90% accuracy target)
   - Vertex AI agent integration tests
   - Prompt regression tests

3. **Phase 4: Activation Tests**
   - Ad platform API integration tests
   - Google Ads, Meta, TikTok tests
   - HITL governance workflow tests

4. **Phase 5: Load Testing**
   - k6 or Artillery load tests
   - Target: 100 concurrent users, 1000 req/sec
   - Performance regression testing

---

## Support

For issues with testing:

1. Check this documentation first
2. Review test examples in codebase
3. Check CI logs for detailed errors
4. Consult package-specific README files

---

**Last Updated**: Phase 1 Complete (October 2025)
