# Agents vs. Services: Architecture Distinction for Random Truffle

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Architecture Decision Record (ADR)

---

## Executive Summary

This document clarifies the distinction between **Services** and **Agents** in the Random Truffle architecture. Understanding this distinction is critical for proper system design, as they serve different purposes, have different performance characteristics, and require different infrastructure.

**TL;DR:**
- **Services** = Traditional backend APIs (CRUD, business logic, synchronous)
- **Agents** = AI-powered workers (LLM-driven, generative, asynchronous)

---

## The Problem

The CLAUDE.md specification mentions both `services/` and `agents/` directories without clearly defining:
1. What makes something a "service" vs. an "agent"?
2. When should I build a service vs. an agent?
3. How do they interact?

This ambiguity can lead to:
- Misclassification (putting agent logic in services or vice versa)
- Performance issues (synchronous calls to LLMs blocking API responses)
- Cost overruns (running LLMs for simple CRUD operations)
- Architectural confusion

---

## Definitions

### Services

**Services** are traditional backend applications that provide APIs, business logic, data persistence, and integrations. They are the backbone of the application's infrastructure.

**Characteristics:**
- **Deterministic:** Same input → same output (predictable)
- **Fast:** Response time < 1 second (typically < 100ms)
- **Synchronous:** Request → Process → Response
- **Stateless:** Each request is independent (or uses database for state)
- **Rule-based:** Uses conditionals, algorithms, databases
- **Scalable horizontally:** Add more instances to handle load

**Examples in Random Truffle:**
- `services/api/` - NestJS REST API
  - User CRUD (`/api/users`)
  - Audience CRUD (`/api/audiences`)
  - Authentication (`/api/auth`)
  - Analytics aggregation (`/api/analytics/kpis`)
  - Activation triggering (`/api/activation/push`)

**Tech Stack:**
- NestJS (TypeScript)
- PostgreSQL (transactional data)
- Redis (caching)
- REST or GraphQL APIs

**Cost Model:**
- Pay for compute time (Cloud Run: $0.00002400/vCPU-second)
- Predictable, linear scaling

---

### Agents

**Agents** are AI-powered workers that use large language models (LLMs) to perform complex, generative tasks. They are invoked asynchronously and produce artifacts (SQL queries, strategies, reports).

**Characteristics:**
- **Generative:** Same input → different outputs (creative)
- **Slow:** Response time seconds to minutes (LLM inference)
- **Asynchronous:** Invoked via queue, results stored in artifacts
- **Stateful:** Maintains conversation history, context
- **LLM-powered:** Uses GPT, Gemini, Claude, etc.
- **Scalable vertically:** Larger context windows, better models

**Examples in Random Truffle:**
- `agents/data-science/` - SQL generation and data analysis
  - Generate SQL from natural language ("Show me users who...")
  - Explain SQL queries ("This query finds users who purchased...")
  - Validate and optimize queries
  - Interpret results ("Revenue increased 15% due to...")

- `agents/audience-builder/` - Audience strategy and recommendations
  - Generate audience strategies ("Target high-value customers with...")
  - Multi-turn conversation for refinement
  - Activation channel recommendations
  - Budget/pacing suggestions

**Tech Stack:**
- Python or TypeScript
- LLM: Gemini 1.5 Pro, GPT-4, Claude 3.5 Sonnet
- Vector databases (for RAG, if needed)
- Cloud Storage (for artifacts)

**Cost Model:**
- Pay per LLM token (Gemini: $0.80/M input tokens, $2.40/M output tokens)
- Variable, can spike with heavy usage

---

## Comparison Table

| Aspect | Services | Agents |
|--------|----------|--------|
| **Primary Role** | API endpoints, CRUD, business logic | AI-driven task execution |
| **Intelligence** | Rule-based, deterministic | LLM-powered, generative |
| **Invocation** | Synchronous HTTP (REST/GraphQL) | Async via orchestrator/queue |
| **Response Time** | < 1 second (typically < 100ms) | Seconds to minutes |
| **Input Format** | Structured JSON | Natural language or structured |
| **Output Format** | Structured JSON | Natural language, code, artifacts |
| **State Management** | Stateless (or DB-backed sessions) | Stateful (conversation history) |
| **Examples** | User CRUD, Auth, Activation | SQL generation, Strategy creation |
| **Scaling** | Horizontal (more instances) | Vertical (larger models, context) |
| **Cost Model** | Per compute second | Per LLM token |
| **Error Handling** | Return HTTP error codes | Retry with refined prompts |
| **Testing** | Unit tests, integration tests | Prompt validation, golden sets |
| **Monitoring** | Latency, error rate | Token usage, hallucination rate |
| **Deployment** | Cloud Run, GKE | Cloud Run, Vertex AI |

---

## Decision Framework: When to Use Each

### Use a Service When:

1. **CRUD Operations**
   - Creating, reading, updating, deleting records
   - Example: `POST /api/audiences` to create an audience

2. **Deterministic Business Logic**
   - Rules, validations, calculations
   - Example: "Is this user an admin?" → Boolean check

3. **Real-time Responses Required**
   - User expects immediate response (< 1 second)
   - Example: Loading a dashboard, submitting a form

4. **Traditional Integrations**
   - Calling third-party APIs (Google Ads, Meta)
   - Example: Pushing audience to Google Ads API

5. **Data Aggregation**
   - Querying databases, aggregating results
   - Example: Calculating KPIs from BigQuery

### Use an Agent When:

1. **Natural Language Understanding**
   - User input is free-form text
   - Example: "Show me customers who haven't purchased in 6 months"

2. **Creative/Generative Output**
   - Output is code, strategies, reports (not just data retrieval)
   - Example: Generating SQL query, creating audience strategy

3. **Multi-Step Reasoning**
   - Task requires chain-of-thought, multiple steps
   - Example: "Analyze this data and recommend next steps"

4. **Unpredictable Input**
   - User questions, exploratory queries
   - Example: Chat interface for data exploration

5. **Domain Expertise Simulation**
   - Mimicking human expert (data scientist, marketer)
   - Example: "What's the best way to target this segment?"

---

## Interaction Patterns

### Pattern 1: Service Invokes Agent (Async)

**Use Case:** User creates an audience, agent generates SQL in background

```
User → Frontend → Service (API) → Orchestrator → Agent
                      ↓                              ↓
                  (Returns immediately)         (Generates SQL)
                      ↓                              ↓
                  Job ID                       Cloud Storage artifact
                      ↓                              ↓
User polls status ← Service ← Orchestrator ← Agent completes
```

**Example:**
```typescript
// services/api/src/audiences/audiences.controller.ts
@Post(':id/generate-query')
async generateQuery(@Param('id') audienceId: string) {
  // Enqueue agent job
  const jobId = await this.orchestratorService.enqueue({
    agent: 'data-science',
    task: 'generate_sql',
    params: { audienceId }
  });

  return { jobId, status: 'pending' };
}

@Get('jobs/:jobId')
async getJobStatus(@Param('jobId') jobId: string) {
  const job = await this.orchestratorService.getJob(jobId);
  return {
    status: job.status, // pending, running, completed, failed
    result: job.result  // SQL query artifact URL
  };
}
```

---

### Pattern 2: Service Validates Agent Output

**Use Case:** Agent generates SQL, service validates before execution

```
Agent generates SQL → Service receives SQL → Service validates
                                                    ↓
                                            Valid? → Execute via BigQuery MCP
                                            Invalid? → Return error to user
```

**Example:**
```typescript
// services/api/src/data-science/data-science.service.ts
async validateAndExecuteSQL(sql: string, userId: string) {
  // 1. Validate SQL (service logic)
  if (sql.includes('DELETE') || sql.includes('DROP')) {
    throw new Error('Destructive queries not allowed');
  }

  // 2. Estimate cost (service calls BigQuery API)
  const cost = await this.bigQueryService.estimateCost(sql);
  if (cost > 10) { // $10 threshold
    throw new Error('Query too expensive');
  }

  // 3. Execute query (service calls MCP)
  const results = await this.mcpBigQueryService.execute(sql);

  // 4. Log audit trail (service logic)
  await this.auditService.log({ userId, sql, cost, rows: results.length });

  return results;
}
```

---

### Pattern 3: Agent Calls Service for Data

**Use Case:** Agent needs context (schema, user data) to generate SQL

```
Orchestrator invokes Agent → Agent needs BigQuery schema
                                    ↓
                            Agent calls Service API
                                    ↓
                            Service returns schema (from cache or BigQuery)
                                    ↓
                            Agent uses schema to generate SQL
```

**Example:**
```typescript
// agents/data-science/src/sql-generator.ts
async generateSQL(userQuery: string): Promise<string> {
  // 1. Get BigQuery schema from service
  const schema = await this.apiClient.get('/api/bigquery/schema');

  // 2. Build LLM prompt with schema
  const prompt = `
    Given this BigQuery schema:
    ${JSON.stringify(schema, null, 2)}

    Generate SQL for: "${userQuery}"
  `;

  // 3. Call LLM
  const sql = await this.llm.generate(prompt);

  // 4. Return SQL
  return sql;
}
```

---

### Pattern 4: Multi-Agent Workflow (Orchestrated)

**Use Case:** Complex task requires multiple agents

```
User request → Orchestrator
                    ↓
              Agent 1 (Audience Builder) generates strategy
                    ↓
              Agent 2 (Data Science) generates SQL for strategy
                    ↓
              Service validates SQL
                    ↓
              Service executes SQL
                    ↓
              Results → User
```

**Example Workflow:**
```yaml
# services/orchestrator/workflows/audience-creation.yaml
workflow:
  - step: generate_strategy
    agent: audience-builder
    input: { userGoal: "High-value customers" }
    output: strategy

  - step: generate_sql
    agent: data-science
    input: { strategy: $strategy }
    output: sql

  - step: validate_sql
    service: api/data-science/validate
    input: { sql: $sql }
    output: validation

  - step: execute_sql
    service: api/bigquery/execute
    condition: $validation.valid == true
    input: { sql: $sql }
    output: results
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (apps/web/)                  │
│                     Vite + React / Next.js                   │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP/HTTPS
             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Services (services/api/)                   │
│                         NestJS API                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Auth    │  │ Audiences│  │Activation│  │ Analytics  │ │
│  │ Module   │  │  Module  │  │  Module  │  │   Module   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Orchestrator Client (Job Queue)              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────┬────────────────────────────────┘
             │                │
             │                │ Cloud Tasks Queue
             │                ↓
             │    ┌───────────────────────────────────────────┐
             │    │  Orchestrator (services/orchestrator/)    │
             │    │        Agent Job Management               │
             │    │  ┌───────────┐      ┌──────────────┐     │
             │    │  │Agent Queue│ ───→ │ Agent Registry│    │
             │    │  └───────────┘      └──────────────┘     │
             │    └────────────┬──────────┬───────────────────┘
             │                 │          │
             │                 ↓          ↓
             │    ┌─────────────────┐  ┌────────────────────┐
             │    │  Agents         │  │   Agents           │
             │    │  data-science/  │  │ audience-builder/  │
             │    │  (LLM-powered)  │  │  (LLM-powered)     │
             │    └─────────────────┘  └────────────────────┘
             │                 │          │
             │                 └──────────┘
             │                      ↓
             │              Cloud Storage (Artifacts)
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │  BigQuery    │  │    Redis     │      │
│  │ (Cloud SQL)  │  │(Data Warehouse)│ │   (Cache)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
             ↑
             │
┌────────────┴────────────────────────────────────────────────┐
│                  MCP Connectors                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │BigQuery  │  │   GA4    │  │  Looker  │  │Google Ads│   │
│  │   MCP    │  │   MCP    │  │   MCP    │  │   MCP    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Legend:**
- **Frontend** → **Services**: Synchronous HTTP calls
- **Services** → **Orchestrator**: Async job enqueue
- **Orchestrator** → **Agents**: Agent invocation (LLM calls)
- **Agents** → **Data Layer**: Read context (schema, data)
- **Services** → **Data Layer**: CRUD, queries

---

## File Structure in Monorepo

```
random-truffle/
│
├── apps/
│   └── web/                          # Frontend (Vite/Next.js)
│
├── services/
│   ├── api/                          # Main API service (NestJS)
│   │   ├── src/
│   │   │   ├── auth/                 # Authentication module
│   │   │   ├── users/                # User CRUD
│   │   │   ├── audiences/            # Audience CRUD
│   │   │   ├── activation/           # Activation logic
│   │   │   ├── analytics/            # Analytics aggregation
│   │   │   ├── data-science/         # Agent job triggering
│   │   │   └── orchestrator-client/  # Client for orchestrator
│   │   └── Dockerfile
│   │
│   └── orchestrator/                 # Agent orchestrator (Cloud Run)
│       ├── src/
│       │   ├── agents/
│       │   │   ├── registry.ts       # Agent registry
│       │   │   ├── executor.ts       # Agent executor
│       │   │   └── queue.ts          # Job queue (Cloud Tasks)
│       │   ├── workflows/
│       │   │   ├── audience-creation.ts
│       │   │   └── data-analysis.ts
│       │   └── main.ts
│       └── Dockerfile
│
├── agents/
│   ├── data-science/                 # SQL generation agent
│   │   ├── src/
│   │   │   ├── sql-generator.ts      # Main agent logic
│   │   │   ├── query-validator.ts    # SQL validation
│   │   │   ├── explainer.ts          # Query explanation
│   │   │   └── llm-client.ts         # Gemini/GPT client
│   │   ├── prompts/
│   │   │   ├── sql-generation.txt    # Prompt templates
│   │   │   └── query-explanation.txt
│   │   └── Dockerfile
│   │
│   └── audience-builder/             # Audience strategy agent
│       ├── src/
│       │   ├── strategy-generator.ts # Strategy generation
│       │   ├── chat-handler.ts       # Multi-turn conversation
│       │   ├── activation-advisor.ts # Activation recommendations
│       │   └── llm-client.ts
│       ├── prompts/
│       │   ├── strategy-generation.txt
│       │   └── activation-advice.txt
│       └── Dockerfile
│
├── packages/
│   ├── core/                         # Shared utilities
│   ├── types/                        # Shared TypeScript types
│   └── ...
```

---

## Naming Conventions

### Services
- **Directory:** `services/[service-name]/`
- **Naming:** Noun-based (what it manages)
  - `services/api/` - Main API service
  - `services/orchestrator/` - Agent orchestrator
- **Endpoints:** REST conventions
  - `GET /api/audiences` - List audiences
  - `POST /api/audiences` - Create audience

### Agents
- **Directory:** `agents/[agent-name]/`
- **Naming:** Role-based (what it does)
  - `agents/data-science/` - Data science expert
  - `agents/audience-builder/` - Audience strategy expert
- **Invocation:** Via orchestrator jobs
  - `{ agent: 'data-science', task: 'generate_sql' }`

---

## Testing Strategies

### Service Testing

**Unit Tests:**
```typescript
// services/api/src/audiences/audiences.service.spec.ts
describe('AudiencesService', () => {
  it('should create an audience', async () => {
    const audience = await service.create({
      name: 'High-Value Customers',
      description: 'Customers with LTV > $1000'
    });
    expect(audience.id).toBeDefined();
    expect(audience.name).toBe('High-Value Customers');
  });
});
```

**Integration Tests:**
```typescript
// services/api/test/audiences.e2e-spec.ts
describe('Audiences API', () => {
  it('POST /api/audiences should create audience', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/audiences')
      .send({ name: 'Test Audience' })
      .expect(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### Agent Testing

**Prompt Validation:**
```typescript
// agents/data-science/src/sql-generator.spec.ts
describe('SQL Generator', () => {
  it('should generate valid SQL for simple query', async () => {
    const sql = await generator.generateSQL('Show me all users');
    expect(sql).toContain('SELECT');
    expect(sql).toContain('FROM users');

    // Validate SQL syntax
    const isValid = await validateSQL(sql);
    expect(isValid).toBe(true);
  });
});
```

**Golden Set Testing:**
```typescript
// agents/data-science/test/golden-sets.spec.ts
const goldenSets = [
  {
    input: 'Show me users who purchased in last 30 days',
    expectedSQL: 'SELECT * FROM users WHERE purchase_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)'
  },
  // ... more golden sets
];

describe('SQL Generator Golden Sets', () => {
  goldenSets.forEach(({ input, expectedSQL }) => {
    it(`should generate correct SQL for: "${input}"`, async () => {
      const sql = await generator.generateSQL(input);
      expect(normalizeSQL(sql)).toBe(normalizeSQL(expectedSQL));
    });
  });
});
```

---

## Monitoring & Observability

### Service Metrics

- **Latency:** p50, p95, p99 response times
- **Error Rate:** 4xx, 5xx errors per endpoint
- **Throughput:** Requests per second
- **Database:** Query latency, connection pool usage

**Example Alert:**
```
Alert: API Latency High
Condition: p95 > 2 seconds for 5 minutes
Action: Page on-call engineer
```

### Agent Metrics

- **Token Usage:** Input/output tokens per agent call
- **Cost:** $ spent per agent, per user, per day
- **Latency:** Agent response time (end-to-end)
- **Success Rate:** % of agent calls that succeed
- **Hallucination Rate:** % of outputs that fail validation

**Example Alert:**
```
Alert: Agent Cost Spike
Condition: Daily LLM cost > $100
Action: Notify engineering lead, enable rate limiting
```

---

## Cost Optimization

### Services
- Use Cloud Run with auto-scaling (0-10 instances)
- Cache responses in Redis (5-minute TTL for dashboards)
- Optimize database queries (indexes, query analysis)
- Use CDN for static assets (Cloud CDN)

**Estimated Cost (Phase 1):**
- Cloud Run API: ~$50/month (1M requests)
- Cloud SQL: ~$100/month (db-n1-standard-1)
- Redis (Memorystore): ~$50/month (1GB)
- **Total:** ~$200/month

### Agents
- Cache LLM responses (identical queries → same SQL)
- Use smaller models for simple tasks (Gemini Flash vs Pro)
- Batch agent jobs where possible
- Set token limits per request (e.g., 4K max output tokens)
- Monitor and alert on cost spikes

**Estimated Cost (Phase 3):**
- LLM API (Gemini): ~$500/month (10M tokens @ $0.80/M input, $2.40/M output)
- Orchestrator (Cloud Run): ~$20/month
- Cloud Storage (artifacts): ~$10/month (100GB)
- **Total:** ~$530/month

**Cost Optimization Tactics:**
- **Prompt caching:** Gemini supports prompt caching (50% cost reduction)
- **RAG instead of large context:** Use vector search instead of stuffing entire schema in prompt
- **Fine-tuning:** Fine-tune a smaller model on SQL generation task (cheaper inference)

---

## Security Considerations

### Services
- **Authentication:** All endpoints require OIDC token
- **Authorization:** RBAC middleware (user, admin, superadmin)
- **Input Validation:** DTOs with class-validator
- **Rate Limiting:** 100 requests/minute per user
- **SQL Injection:** Use parameterized queries (TypeORM/Prisma)

### Agents
- **Prompt Injection:** Validate user input, escape special characters
- **Output Validation:** Validate generated SQL before execution
- **Cost Attacks:** Token limits, rate limiting, budget caps
- **PII Leakage:** Never include raw PII in prompts (use hashed IDs)
- **LLM API Key Security:** Store in Secret Manager, rotate every 90 days

---

## Migration Path

### Phase 1-2: Services First
- Build `services/api/` (NestJS)
- No agents yet
- All logic is rule-based, deterministic

### Phase 3: Add Agents
- Build `services/orchestrator/`
- Build `agents/data-science/`
- Build `agents/audience-builder/`
- Services invoke agents via orchestrator

### Phase 4-5: Optimize
- Add agent caching
- Optimize LLM costs (prompt caching, smaller models)
- Add advanced workflows (multi-agent coordination)

---

## FAQs

### Q: Can a service call an agent synchronously?

**A:** Not recommended. LLM calls can take 5-30 seconds. If you need a synchronous flow:
1. Service enqueues agent job → Returns job ID immediately
2. Frontend polls `GET /api/jobs/:id` for status
3. When complete, frontend fetches result

### Q: Can an agent call another agent?

**A:** Yes, via orchestrator. Example:
```
Audience Builder Agent → Orchestrator → Data Science Agent
```
This is a "multi-agent workflow" orchestrated by `services/orchestrator/`.

### Q: Can agents write to the database?

**A:** No. Agents generate artifacts (SQL, strategies) but don't execute them. Services validate and execute agent outputs.

**Flow:**
```
Agent generates SQL → Service validates SQL → Service executes SQL → Service writes results to DB
```

### Q: When should I use a shared package vs. a service?

**A:**
- **Shared Package:** Utility functions, types, constants (no state, no API)
  - Example: `packages/core/src/date-utils.ts`
- **Service:** Has state, API endpoints, business logic
  - Example: `services/api/src/audiences/`

### Q: Should MCP connectors be services or packages?

**A:** **Packages**. MCP connectors are clients (libraries) used by services/agents.

**Example:**
```
packages/mcp-bigquery/     ← Package (npm library)
    ├── src/
    │   ├── client.ts      ← BigQuery MCP client
    │   └── types.ts
    └── package.json

services/api/src/analytics/
    └── analytics.service.ts  ← Uses @random-truffle/mcp-bigquery
```

---

## Conclusion

**Services** and **Agents** serve complementary roles:

- **Services** provide the infrastructure: APIs, databases, integrations, business logic.
- **Agents** provide the intelligence: LLM-powered generative capabilities, natural language understanding, creative problem-solving.

**Key Principle:** Services orchestrate agents, validate their outputs, and execute actions. Agents focus solely on generating high-quality artifacts using LLMs.

By maintaining this clear separation, we achieve:
- **Predictable performance:** Fast services, async agents
- **Cost control:** Services are cheap, agents have budget caps
- **Testability:** Services have unit tests, agents have golden sets
- **Scalability:** Services scale horizontally, agents scale vertically (better models)

---

## Next Steps

1. **Review this document** with engineering team
2. **Update CLAUDE.md** to include this distinction
3. **Apply this framework** when designing new features:
   - "Is this a service or an agent?"
   - "Does this need an LLM, or can rules handle it?"
4. **Refactor existing code** if any logic is misplaced

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-25 | Claude Code Agent | Initial architecture clarification |

---

**Related Documents:**
- `CLAUDE.md` - Main coding guidelines
- `thoughts/shared/plans/implementation-roadmap.md` - Phased implementation plan
- `thoughts/shared/research/2025-10-25_codebase.md` - Current state analysis
