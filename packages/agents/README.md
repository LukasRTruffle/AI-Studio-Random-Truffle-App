# @random-truffle/agents

AI Agent infrastructure with ADK (Agent Development Kit) support for Random Truffle.

Follows Anthropic's principles for effective context engineering:

- Right Altitude Approach: Balance specificity with flexibility
- Minimal Viable Toolset: Curate only essential, unambiguous tools
- Token Efficiency: Minimize tokens while maintaining clarity
- Context Management: Just-in-time retrieval, compaction, structured note-taking
- Few-Shot Examples: Diverse, canonical examples

## Features

- **Agent Types**: Data Science Agent, Audience Builder Agent
- **Multi-Model Support**: Gemini Pro/Flash, Claude Sonnet, GPT-4
- **Synchronous API**: Direct invocation (no orchestrator queue)
- **Prompt Management**: Version control, caching, structured loading
- **Tool Integration**: BigQuery, MCP connectors
- **Retry & Fallback**: Automatic retry with fallback models
- **Statistics Tracking**: Usage, costs, success rates

## Installation

```bash
pnpm add @random-truffle/agents
```

## Usage

### Basic Example

```typescript
import { createAgentManager } from '@random-truffle/agents';

// Create agent manager
const agentManager = createAgentManager({
  projectId: process.env.GCP_PROJECT_ID,
  region: 'us-central1',
  datasetId: process.env.BIGQUERY_DATASET_ID,
  enableStats: true,
});

// Invoke Data Science Agent
const response = await agentManager.invoke({
  agentType: 'data-science',
  message: 'Show me user growth over the last 30 days',
  context: {
    tenantId: 'tenant_123',
    userId: 'user_456',
    userRole: 'user',
    sessionId: 'session_789',
  },
});

console.log(response.message);
```

### Multi-Turn Conversation

```typescript
const conversationHistory = [];

// First turn
const response1 = await agentManager.invoke({
  agentType: 'data-science',
  message: 'How many users do we have?',
  conversationHistory,
});

conversationHistory.push({
  role: 'user',
  content: 'How many users do we have?',
  timestamp: new Date(),
});
conversationHistory.push({
  role: 'assistant',
  content: response1.message,
  timestamp: new Date(),
});

// Second turn (with context)
const response2 = await agentManager.invoke({
  agentType: 'data-science',
  message: 'Show breakdown by country',
  conversationHistory,
});
```

### Audience Builder Agent

```typescript
const response = await agentManager.invoke({
  agentType: 'audience-builder',
  message: 'Help me build an audience strategy to increase revenue next quarter',
  context: {
    tenantId: 'tenant_123',
    userId: 'user_456',
    userRole: 'admin',
    sessionId: 'session_789',
  },
});

console.log(response.message);
```

### Get Statistics

```typescript
// Get stats for specific agent
const stats = agentManager.getStats('data-science');
console.log(`Success rate: ${stats.successRate * 100}%`);
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);

// Get all stats
const allStats = agentManager.getAllStats();
for (const [agentType, stats] of allStats) {
  console.log(`${agentType}: ${stats.totalInvocations} invocations`);
}
```

## Agent Types

### Data Science Agent

**Purpose:** Generate and execute SQL queries from natural language requests.

**Capabilities:**

- SQL query generation
- Query execution against BigQuery
- Result interpretation and visualization
- Cost estimation and optimization

**Tools:**

- `execute_bigquery_query`: Execute SQL queries
- `get_table_schema`: Get table schema information
- `list_available_tables`: List available tables/views
- `estimate_query_cost`: Estimate query cost before execution

**Example Use Cases:**

- "Show me user growth over the last 30 days"
- "Which products have the highest conversion rate?"
- "Calculate revenue by device category"

### Audience Builder Agent

**Purpose:** Create and optimize marketing audiences with activation recommendations.

**Capabilities:**

- Audience strategy design
- Segmentation recommendations
- Channel recommendations (Google Ads, Meta, TikTok)
- Budget allocation suggestions
- SQL definition generation

**Tools:**

- `estimate_audience_size`: Estimate audience size
- `generate_audience_sql`: Generate SQL for audience
- `recommend_channels`: Recommend activation channels
- `validate_audience_consent`: Check consent compliance

**Example Use Cases:**

- "Create an audience of high-value customers"
- "Help me target cart abandoners"
- "Which channel should I use for my recent purchasers?"

## Configuration

### Agent Manager Configuration

```typescript
interface AgentManagerConfig {
  projectId: string; // GCP project ID
  region: string; // GCP region (e.g., 'us-central1')
  datasetId: string; // BigQuery dataset ID
  enableStats?: boolean; // Enable statistics tracking (default: true)
}
```

### Agent Configuration

Each agent has specific configuration (managed internally):

```typescript
interface AgentConfig {
  type: AgentType; // 'data-science' | 'audience-builder'
  primaryModel: AIModel; // Primary AI model
  fallbackModel?: AIModel; // Fallback model if primary fails
  maxInputTokens: number; // Maximum input tokens
  maxOutputTokens: number; // Maximum output tokens
  temperature: number; // Temperature (0.0 to 1.0)
  timeoutMs: number; // Timeout in milliseconds
  maxRetries: number; // Maximum retry attempts
  tools: AgentTool[]; // Available tools
}
```

**Default Configurations:**

| Agent            | Primary Model     | Fallback         | Timeout | Retries | Temperature |
| ---------------- | ----------------- | ---------------- | ------- | ------- | ----------- |
| Data Science     | Gemini 1.5 Pro    | Gemini 1.5 Flash | 30s     | 3       | 0.2         |
| Audience Builder | Claude 3.5 Sonnet | Gemini 1.5 Pro   | 30s     | 3       | 0.4         |

## Response Structure

```typescript
interface AgentResponse {
  success: boolean; // Success status
  message: string; // Agent's response message
  toolCalls?: ToolCall[]; // Tool calls made by agent
  model: AIModel; // Model used for response
  usage: TokenUsage; // Token usage and cost
  metadata: {
    responseTimeMs: number; // Response time in milliseconds
    retryCount: number; // Number of retries
    cached: boolean; // Whether response was cached
    requestId: string; // Request ID for tracking
    timestamp: Date; // Response timestamp
  };
  error?: AgentError; // Error information (if failed)
}
```

## Error Handling

```typescript
import { AgentErrorCode } from '@random-truffle/agents';

try {
  const response = await agentManager.invoke(request);
  if (!response.success) {
    switch (response.error?.code) {
      case AgentErrorCode.TIMEOUT:
        console.error('Request timed out');
        break;
      case AgentErrorCode.RATE_LIMIT_EXCEEDED:
        console.error('Rate limit exceeded');
        break;
      case AgentErrorCode.GUARDRAIL_VIOLATION:
        console.error('Request violated guardrails');
        break;
      default:
        console.error('Unknown error:', response.error?.message);
    }
  }
} catch (error) {
  console.error('Failed to invoke agent:', error);
}
```

## Prompt Management

Prompts are loaded from the `agents/prompts/` directory:

```
agents/prompts/
├── shared/
│   ├── guidelines.md          # General guidelines
│   └── guardrails.md          # Guardrails and safety constraints
├── data-science/
│   └── system-prompt.md       # Data Science Agent prompt
└── audience-builder/
    └── system-prompt.md       # Audience Builder Agent prompt
```

### Prompt Loader

```typescript
import { createPromptLoader } from '@random-truffle/agents';

const promptLoader = createPromptLoader({
  enableCache: true,
  cacheTtlSeconds: 300,
});

// Load prompt
const prompt = await promptLoader.load('data-science', 'latest');

// Build complete prompt (with guidelines and guardrails)
const completePrompt = promptLoader.buildCompletePrompt(prompt);

// Clear cache
promptLoader.clearCache();
```

## Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:coverage
```

## Architecture

```
User → Frontend → Backend API → AgentManager → AgentInvoker → Vertex AI
                                      ↓
                                 PromptLoader (loads prompts from filesystem)
                                      ↓
                                 Tools (MCP BigQuery connector)
```

## Anthropic Principles Implementation

### 1. Right Altitude Approach

- System prompts balance specificity (concrete examples) with flexibility (no hardcoded if-else)
- Agents adapt to user expertise level dynamically

### 2. Minimal Viable Toolset

- Data Science Agent: 4 essential tools (query, schema, list, estimate)
- Audience Builder Agent: 4 essential tools (estimate, generate, recommend, validate)
- Each tool has unambiguous purpose

### 3. Token Efficiency

- Prompt caching (5-minute TTL)
- Progressive disclosure pattern in responses
- Structured formats (tables over prose)

### 4. Context Management

- Just-in-time prompt loading (not preloaded)
- Conversation history compaction (future: automatic summarization)
- External memory via conversation history

### 5. Few-Shot Examples

- Each agent prompt includes 3-4 diverse examples
- Examples cover common patterns (simple, complex, error handling)

## Cost Optimization

**Caching Strategy:**

- Prompt caching: 5-minute TTL
- Result caching: MCP connector level (5-minute TTL)

**Model Selection:**

- Use Gemini Flash for simple queries (80% cost reduction vs. Pro)
- Use Gemini Pro for complex analysis
- Use Claude Sonnet for creative/strategic tasks

**Token Limits:**

- Input: 100K tokens max (prevents runaway context)
- Output: 4K tokens max (encourages concise responses)

## Monitoring & Observability

Track key metrics:

```typescript
const stats = agentManager.getStats('data-science');

// Key metrics
console.log({
  totalInvocations: stats.totalInvocations,
  successRate: stats.successRate,
  avgResponseTime: stats.avgResponseTimeMs,
  totalCost: stats.totalCost,
  costPerInvocation: stats.totalCost / stats.totalInvocations,
});
```

## Roadmap

- [ ] Vertex AI API integration (replace mock)
- [ ] Implement audience builder tools
- [ ] Add conversation summarization (when approaching token limits)
- [ ] Add prompt A/B testing framework
- [ ] Add golden set testing (90% accuracy target)
- [ ] Add response streaming support
- [ ] Add multi-language support

## Related Packages

- `@random-truffle/types`: Shared TypeScript types
- `@random-truffle/core`: Core utilities
- `@random-truffle/mcp-bigquery`: MCP BigQuery connector
- `@random-truffle/bigquery`: BigQuery client wrapper

## License

Proprietary - Random Truffle
