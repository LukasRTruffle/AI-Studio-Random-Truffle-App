# Agent Prompting Framework

This directory contains the prompting infrastructure for Random Truffle's AI agents, following Anthropic's principles of effective context engineering.

## Structure

```
agents/prompts/
├── shared/
│   ├── guidelines.md          # General guidelines (shared across all agents)
│   ├── guardrails.md          # Guardrails and safety constraints
│   └── examples/              # Shared few-shot examples
├── data-science/
│   ├── system-prompt.md       # Data Science Agent system prompt
│   ├── tools.md               # Tool descriptions and guidance
│   └── examples/              # Agent-specific examples
└── audience-builder/
    ├── system-prompt.md       # Audience Builder Agent system prompt
    ├── tools.md               # Tool descriptions and guidance
    └── examples/              # Agent-specific examples
```

## Key Principles (from Anthropic)

### 1. Right Altitude Approach

- Balance specificity with flexibility
- Avoid hardcoded if-else logic
- Provide concrete direction without being overly rigid
- "Minimal set of information that fully outlines expected behavior"

### 2. Minimal Viable Toolset

- Curate only essential tools
- Each tool should be unambiguous in its purpose
- If humans can't select the right tool, agents won't either

### 3. Token Efficiency

- Return information in token-efficient formats
- Encourage efficient agent behaviors through design
- "Find the smallest set of high-signal tokens"

### 4. Context Management

- **Just-in-time retrieval**: Load data dynamically, not upfront
- **Compaction**: Summarize when approaching context limits
- **Structured note-taking**: Use external memory (NOTES.md, TODO.md)
- **Sub-agent architectures**: Specialized agents with focused contexts

### 5. Few-Shot Examples

- Provide diverse, canonical examples
- Focus on common patterns, not exhaustive edge cases
- "Examples are the pictures worth a thousand words"

## Prompt Structure

All agent prompts follow this structure:

```markdown
# [Agent Name]

## Background Information

[Concise context about the agent's role and domain]

## Core Instructions

[Clear, actionable instructions for the agent]

## Tool Guidance

[Minimal, unambiguous tool descriptions]

## Examples

[Few-shot examples demonstrating desired behavior]

## Guidelines

[Reference to shared/guidelines.md]

## Guardrails

[Reference to shared/guardrails.md]
```

## Version Control

All prompts are version-controlled in Git. Changes to prompts require:

1. Update prompt file
2. Update version number in metadata
3. Run golden set tests to verify 90% accuracy
4. Document changes in CHANGELOG.md

## Testing

Each agent has a golden set of test cases:

- **Data Science Agent**: 50+ SQL generation test cases
- **Audience Builder Agent**: 30+ strategy recommendation test cases

Target accuracy: 90% (per ADR-019)

## Usage

### In Code (TypeScript)

```typescript
import { loadAgentPrompt } from '@random-truffle/agents';

const prompt = await loadAgentPrompt('data-science', {
  version: 'latest',
  includeGuidelines: true,
  includeGuardrails: true,
});
```

### In Vertex AI Agent Builder

1. Navigate to Vertex AI Agent Builder console
2. Create new agent
3. Copy system prompt from `[agent-name]/system-prompt.md`
4. Add tools from `[agent-name]/tools.md`
5. Configure with guidelines and guardrails

## References

- **Anthropic Article**: [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- **ADR-016**: Vertex AI Conversational Agents
- **ADR-018**: Synchronous API (no orchestrator)
- **CLAUDE.md**: Project guidelines and architecture
