# CLAUDE.md — Node.js Edition

This file provides comprehensive guidance to Claude Code when working with **Node.js/TypeScript** code in this repository.

---

## Core Development Philosophy

**KISS (Keep It Simple, Stupid)**
Favour straightforward solutions over clever ones. Simple code is easier to understand, maintain, and debug.

**YAGNI (You Aren't Gonna Need It)**
Don’t implement features until they’re needed. Reduce scope early and often.

---

## Design Principles

- **Dependency Inversion:** High‑level modules shouldn’t depend on low‑level modules; both depend on abstractions (interfaces/types).
- **Open/Closed Principle:** Entities are open for extension but closed for modification.
- **Single Responsibility:** Each function/class/module has a single, clear purpose.
- **Fail Fast:** Validate inputs and environment early; throw typed errors immediately.

---

## 🧱 Code Structure & Modularity

### File and Function Limits
- Keep files **≤ 500 lines**; refactor into modules if approaching the limit.
- Functions **≤ 50 lines** with one responsibility.
- Classes **≤ 100 lines** and represent a single concept.
- Organize code into **vertical slices** (feature folders). Tests live next to the code they test.
- Max line length **100** characters (enforced by ESLint/Prettier).

### Project Architecture (Vertical Slice)
```
src/
  index.ts
  app.ts
  types.d.ts
  shared/
    config/
      index.ts
      schema.ts
    errors/
      AppError.ts
      errorMapper.ts
    logger/
      index.ts
    db/
      client.ts
  features/
    user/
      routes.ts
      controller.ts
      service.ts
      repository.ts
      schema.ts
      __tests__/
        controller.test.ts
        service.test.ts
    payments/
      routes.ts
      controller.ts
      service.ts
      gateway.ts
      schema.ts
      __tests__/
        service.test.ts
        gateway.test.ts

  http/
    server.ts
    middlewares/
      errorHandler.ts
      auth.ts

scripts/
  dev.ts

jest.config.ts or vitest.config.ts
.eslintrc.cjs
.prettierrc
.env.example
```

> Use **co‑located tests** under `__tests__` or `*.test.ts` next to implementation files.

---

## 🛠️ Development Environment

### Node & Package Management
- Use **Node.js LTS** via **`nvm`**. Example: `nvm use --lts`.
- Use **pnpm** (preferred) or npm/yarn.

```bash
# Setup
corepack enable        # enables pnpm if needed
pnpm i                 # install

# Common scripts (see package.json)
pnpm dev               # start dev server (tsx/nodemon)
pnpm test              # run tests (vitest/jest)
pnpm test:watch        # watch mode
pnpm lint              # eslint
pnpm format            # prettier --write
pnpm typecheck         # tsc --noEmit
pnpm build             # tsup/esbuild or tsc
pnpm start             # node dist/index.js
```

### Tooling
- **TypeScript** for all code (`"strict": true`).
- **ESLint** + **Prettier** (no code style bikeshedding; Prettier is source of truth).
- **Vitest** (preferred) or **Jest** for unit/integration tests.
- **Playwright** for end‑to‑end tests.
- **tsx** or **nodemon** for dev reload.
- **tsup**/**esbuild** for bundling CLIs/libs; **tsc** for apps.
- **Husky** + **lint‑staged** to enforce quality on commit.
- **Changesets** for versioning (libraries/monorepos).

> **Never update dependencies directly in config files**. Use your package manager CLI (e.g., `pnpm add`, `pnpm up`).

---

## 📋 Style & Conventions

### TypeScript Style Guide
- Line length: **100** chars.
- Use **single quotes** in TS/JS; **double quotes** in JSON.
- Trailing commas in multi‑line structures.
- Prefer **readonly** and **const**.
- Functions and public APIs must be **fully typed**. Avoid `any`.
- Use **narrow types** (`unknown` > `any`), **discriminated unions**, and **enums as unions** (string literal unions) where possible.
- Prefer **Zod** schemas for runtime validation and to infer static types.

### Naming
- Variables/functions: `camelCase`
- Classes/Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private fields: `#private` or `_leadingUnderscore`
- Type aliases: `PascalCase`
- Enum values: `UPPER_SNAKE_CASE` (or use union types)

### Docstrings / JSDoc
Use **TSDoc/JSDoc** for public functions, classes, and modules.

```ts
/**
 * Calculate the discounted price for a product.
 */
export function calculateDiscount(
  price: number,
  discountPercent: number,
  minAmount = 0.01
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new RangeError('discountPercent must be 0..100');
  }
  const final = Math.max(minAmount, price * (1 - discountPercent / 100));
  return Number(final.toFixed(2));
}
```

---

## 🧪 Testing Strategy

**TDD Workflow**
1. Write the test first.
2. See it fail.
3. Implement the minimal code.
4. Refactor with tests green.

**Best Practices**
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createUser } from '../service';

describe('user service', () => {
  it('creates a user with a valid email', async () => {
    const user = await createUser({ email: 'a@b.com', name: 'Test' });
    expect(user.email).toBe('a@b.com');
  });

  it('rejects invalid emails', async () => {
    await expect(createUser({ email: 'not-an-email', name: 'X' }))
      .rejects.toThrowError(/invalid email/i);
  });
});
```

- Unit tests: individual functions.
- Integration tests: component interactions (e.g., repository ↔ DB).
- E2E tests: user workflows (Playwright).
- Keep test files next to code.
- Target **80%+ coverage**; prioritise critical paths.

---

## 🚨 Error Handling

### Custom Errors
```ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class InsufficientFundsError extends AppError {
  constructor(required: number, available: number) {
    super('INSUFFICIENT_FUNDS', `Required ${required}, available ${available}`, {
      required,
      available,
    });
  }
}
```

### Express/Fastify Error Middleware
```ts
// Express-style
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof AppError ? 400 : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  res.status(status).json({ code, message: (err as Error).message });
}
```

### Resource Management
Use `try/finally` and close resources (DB connections, streams). Prefer `AbortController` for cancelable operations.

---

## 🔧 Configuration Management

Use **dotenv** + **Zod** schema for validated settings.

```ts
import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_KEY: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
```

- Provide `.env.example` with all keys.
- Don’t access `process.env` directly outside the config module.

---

## 🏗️ Data Models and Validation

- Use **Prisma** or **Drizzle ORM** for database access.
- Validate inputs with **Zod**; derive types with `z.infer` to keep runtime validation and static types in sync.

```ts
export const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
});
export type Product = z.infer<typeof ProductSchema>;
```

---

## 🔄 Git Workflow

### Branch Strategy
- `main` — production‑ready
- `develop` — integration branch
- `feature/*` — new features
- `fix/*` — bug fixes
- `docs/*`, `refactor/*`, `test/*`

### Commit Message Format
> Never include model names like “written by Claude/AI” in commit messages.

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add two-factor authentication

Implement TOTP generation and validation
Add QR code generation for authenticator apps
Update user model with 2FA fields
Closes #123
```

---

## 🗄️ Database Naming Standards

**Entity‑Specific Primary Keys**

```sql
-- ✅ STANDARDISED: Entity-specific primary keys
sessions.session_id UUID PRIMARY KEY
leads.lead_id UUID PRIMARY KEY
messages.message_id UUID PRIMARY KEY
daily_metrics.daily_metric_id UUID PRIMARY KEY
agencies.agency_id UUID PRIMARY KEY
```

**Field Naming Conventions**
- Primary keys: `{entity}_id`
- Foreign keys: `{referenced_entity}_id`
- Timestamps: `{action}_at` (`created_at`, `updated_at`)
- Booleans: `is_{state}`
- Counts: `{entity}_count`
- Durations: `{property}_{unit}`

**Repository Pattern (Prisma Example)**
```ts
export class BaseRepository<T extends { id?: string }> {
  protected table: string;
  protected idKey: string;
  constructor(resourceName: string) {
    this.table = `${resourceName}s`;
    this.idKey = `${resourceName}_id`;
  }
}

export class LeadRepository extends BaseRepository<{ lead_id: string }> {
  constructor() { super('lead'); }
}
```

**Model–Database Alignment**
Keep model fields identical to DB columns to avoid mapping complexity.

---

## 📄 API Route Standards

**RESTful with Consistent Parameter Naming**

```ts
import { Router } from 'express';
const router = Router();

router.get('/api/v1/leads/:lead_id');
router.put('/api/v1/leads/:lead_id');
router.delete('/api/v1/leads/:lead_id');
router.get('/api/v1/leads/:lead_id/messages');
router.get('/api/v1/leads/agency/:agency_id');
```

- Keep OpenAPI docs updated (e.g., **tsoa**, **zod‑to‑openapi**, or **@fastify/swagger**).

---

## 🚀 Performance Considerations

- **Profile before optimising** (`node --cpu-prof`, `clinic.js`).
- Cache expensive computations (`lru-cache`).
- Use **streams/iterators** for large datasets.
- Use **async concurrency** with care (`p-limit`).
- Database query caching where appropriate.

```ts
import LRUCache from 'lru-cache';
const cache = new LRUCache<string, number>({ max: 1000 });
```

---

## 🛡️ Security Best Practices

- Never commit secrets; use environment variables & secret stores.
- Validate all input with **Zod**.
- Use parameterised queries.
- Rate limit APIs (`express-rate-limit` / Fastify equivalents).
- Enable security headers (`helmet`), configure CORS explicitly.
- Keep dependencies updated; use `pnpm audit` and `npm audit signatures`.
- Use HTTPS everywhere.
- Implement proper authentication & authorization (JWT/OAuth/OIDC).

**Password Utilities**
```ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

---

## 🔍 Debugging Tools

- Node Inspector: `node --inspect --enable-source-maps dist/index.js`
- Breakpoints with VS Code.
- Memory profiling: `--inspect` + DevTools, or `clinic heapprof`.
- Rich errors with source maps; use `tsconfig.json` → `"sourceMap": true`.

---

## 📊 Monitoring and Observability

- Structured logging with **Pino**.

```ts
import pino from 'pino';
export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
logger.info({ event: 'payment_processed', userId: 1, amount: 10 });
```

- Metrics: **OpenTelemetry**/**Prometheus** (e.g., `prom-client`).
- Tracing: **OpenTelemetry** SDK + exporter (OTLP/Jaeger/Zipkin).

---

## 📚 Useful Resources

- Node.js: https://nodejs.org/en/docs
- TypeScript: https://www.typescriptlang.org/docs
- ESLint: https://eslint.org/docs/latest
- Prettier: https://prettier.io/docs
- Vitest: https://vitest.dev/guide
- Jest: https://jestjs.io/docs/getting-started
- Playwright: https://playwright.dev/docs/intro
- Prisma: https://www.prisma.io/docs
- Drizzle: https://orm.drizzle.team/docs

---

## ⚠️ Important Notes

- **NEVER ASSUME OR GUESS** — when in doubt, ask for clarification.
- Always verify file paths and module names before use.
- Keep this **CLAUDE.md** updated when adding new patterns or dependencies.
- **Test your code** — no feature is complete without tests.
- **Document decisions** — future maintainers (including you) will thank you.

---

## 🔍 Search Command Requirements

Always use `rg` (**ripgrep**) instead of legacy `grep/find` commands.

```bash
# ❌ Don’t use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don’t use find -name
find . -name "*.ts"

# ✅ Use rg for file filtering
rg --files | rg "\.ts$"
# or
rg --files -g "**/*.ts"
```

---

## 🧭 Daily GitHub Flow Summary

```
main (protected) ←── PR ←── feature/your-feature
          ↓                     ↑
        deploy               development
```

**Daily Workflow**
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/new-feature`
3. Make changes + tests
4. `git push origin feature/new-feature`
5. Open PR → Review → Merge to `main`

