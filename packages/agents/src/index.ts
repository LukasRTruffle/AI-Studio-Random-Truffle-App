/**
 * Random Truffle AI Agents Package
 *
 * This package provides infrastructure for AI agents with ADK (Agent Development Kit) support.
 * Follows Anthropic's principles for effective context engineering.
 *
 * @packageDocumentation
 */

// Export types
export * from './types';

// Export prompt loader
export { PromptLoader, createPromptLoader, type PromptLoaderConfig } from './prompt-loader';

// Export agent invoker
export { AgentInvoker, createAgentInvoker, type AgentInvokerConfig } from './agent-invoker';

// Export agent manager
export { AgentManager, createAgentManager, type AgentManagerConfig } from './agent-manager';
