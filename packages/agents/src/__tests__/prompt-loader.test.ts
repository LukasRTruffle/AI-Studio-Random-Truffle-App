/**
 * Tests for PromptLoader
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PromptLoader } from '../prompt-loader';
import type { AgentType } from '../types';

describe('PromptLoader', () => {
  let promptLoader: PromptLoader;

  beforeEach(() => {
    promptLoader = new PromptLoader({
      enableCache: true,
      cacheTtlSeconds: 300,
    });
  });

  describe('load', () => {
    it('should load data-science agent prompt', async () => {
      const prompt = await promptLoader.load('data-science');

      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('data-science');
      expect(prompt.version).toMatch(/^\d+\.\d+\.\d+$/); // Semver format
      expect(prompt.systemPrompt).toContain('Data Science Agent');
      expect(prompt.guidelines).toContain('Core Principles');
      expect(prompt.guardrails).toContain('Guardrails');
    });

    it('should load audience-builder agent prompt', async () => {
      const prompt = await promptLoader.load('audience-builder');

      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('audience-builder');
      expect(prompt.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(prompt.systemPrompt).toContain('Audience Builder Agent');
      expect(prompt.guidelines).toContain('Core Principles');
      expect(prompt.guardrails).toContain('Guardrails');
    });

    it('should cache loaded prompts', async () => {
      const prompt1 = await promptLoader.load('data-science');
      const cacheStats1 = promptLoader.getCacheStats();
      expect(cacheStats1.size).toBe(1);
      expect(cacheStats1.keys).toContain('data-science:latest');

      const prompt2 = await promptLoader.load('data-science');
      const cacheStats2 = promptLoader.getCacheStats();
      expect(cacheStats2.size).toBe(1);
      expect(prompt1).toBe(prompt2); // Same reference (cached)
    });

    it('should throw error for invalid agent type', async () => {
      await expect(promptLoader.load('invalid-agent' as AgentType)).rejects.toThrow();
    });
  });

  describe('buildCompletePrompt', () => {
    it('should build complete prompt with guidelines and guardrails', async () => {
      const agentPrompt = await promptLoader.load('data-science');
      const completePrompt = promptLoader.buildCompletePrompt(agentPrompt);

      expect(completePrompt).toContain('Data Science Agent');
      expect(completePrompt).toContain('Shared Guidelines');
      expect(completePrompt).toContain('Shared Guardrails');
      expect(completePrompt).toContain('Core Principles');
    });
  });

  describe('clearCache', () => {
    it('should clear cache', async () => {
      await promptLoader.load('data-science');
      expect(promptLoader.getCacheStats().size).toBe(1);

      promptLoader.clearCache();
      expect(promptLoader.getCacheStats().size).toBe(0);
    });
  });
});
