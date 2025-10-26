/**
 * Prompt Loader for Random Truffle AI Agents
 *
 * Loads agent prompts from filesystem with version control and caching.
 * Follows Anthropic's principles for effective context engineering.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { AgentPrompt, AgentType } from './types';

/**
 * Prompt loader configuration
 */
export interface PromptLoaderConfig {
  /**
   * Base path to prompts directory
   * Default: '../../agents/prompts' (relative to package)
   */
  promptsBasePath?: string;

  /**
   * Whether to cache loaded prompts
   * Default: true
   */
  enableCache?: boolean;

  /**
   * Cache TTL in seconds
   * Default: 300 (5 minutes)
   */
  cacheTtlSeconds?: number;
}

/**
 * Cached prompt entry
 */
interface CachedPrompt {
  prompt: AgentPrompt;
  loadedAt: Date;
  expiresAt: Date;
}

/**
 * Prompt Loader class
 */
export class PromptLoader {
  private config: Required<PromptLoaderConfig>;
  private cache: Map<string, CachedPrompt> = new Map();

  constructor(config: PromptLoaderConfig = {}) {
    this.config = {
      promptsBasePath: config.promptsBasePath || path.resolve(__dirname, '../../../agents/prompts'),
      enableCache: config.enableCache ?? true,
      cacheTtlSeconds: config.cacheTtlSeconds ?? 300,
    };
  }

  /**
   * Load agent prompt by type
   *
   * @param agentType - Agent type to load
   * @param version - Specific version (default: 'latest')
   * @returns Agent prompt with system prompt, guidelines, and guardrails
   */
  async load(agentType: AgentType, version: string = 'latest'): Promise<AgentPrompt> {
    const cacheKey = `${agentType}:${version}`;

    // Check cache
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && new Date() < cached.expiresAt) {
        return cached.prompt;
      }
    }

    // Load from filesystem
    const prompt = await this.loadFromFilesystem(agentType, version);

    // Cache result
    if (this.config.enableCache) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.config.cacheTtlSeconds * 1000);
      this.cache.set(cacheKey, { prompt, loadedAt: now, expiresAt });
    }

    return prompt;
  }

  /**
   * Load prompt from filesystem
   *
   * @param agentType - Agent type
   * @param version - Version to load
   * @returns Agent prompt
   */
  private async loadFromFilesystem(agentType: AgentType, _version: string): Promise<AgentPrompt> {
    const agentDir = path.join(this.config.promptsBasePath, agentType);
    const sharedDir = path.join(this.config.promptsBasePath, 'shared');

    try {
      // Load system prompt
      const systemPromptPath = path.join(agentDir, 'system-prompt.md');
      const systemPrompt = await fs.readFile(systemPromptPath, 'utf-8');

      // Load shared guidelines
      const guidelinesPath = path.join(sharedDir, 'guidelines.md');
      const guidelines = await fs.readFile(guidelinesPath, 'utf-8');

      // Load shared guardrails
      const guardrailsPath = path.join(sharedDir, 'guardrails.md');
      const guardrails = await fs.readFile(guardrailsPath, 'utf-8');

      // Extract version from system prompt
      const versionMatch = systemPrompt.match(/\*\*Version:\*\*\s+(\d+\.\d+\.\d+)/);
      const extractedVersion = versionMatch ? versionMatch[1] : '1.0.0';

      // Extract last updated date
      const dateMatch = systemPrompt.match(/\*\*Last Updated:\*\*\s+(\d{4}-\d{2}-\d{2})/);
      const lastUpdated = dateMatch ? new Date(dateMatch[1]) : new Date();

      return {
        type: agentType,
        version: extractedVersion,
        systemPrompt,
        guidelines,
        guardrails,
        lastUpdated,
      };
    } catch (error) {
      throw new Error(
        `Failed to load prompt for agent '${agentType}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build complete prompt for agent invocation
   *
   * Combines system prompt, guidelines, and guardrails into single prompt
   * following Anthropic's context engineering principles.
   *
   * @param agentPrompt - Loaded agent prompt
   * @returns Complete formatted prompt
   */
  buildCompletePrompt(agentPrompt: AgentPrompt): string {
    return `${agentPrompt.systemPrompt}

---

## Shared Guidelines

${agentPrompt.guidelines}

---

## Shared Guardrails

${agentPrompt.guardrails}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Create default prompt loader instance
 *
 * @param config - Optional configuration
 * @returns PromptLoader instance
 */
export function createPromptLoader(config?: PromptLoaderConfig): PromptLoader {
  return new PromptLoader(config);
}
