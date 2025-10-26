/**
 * Tests for AgentManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AgentManager } from '../agent-manager';
import type { AgentRequest } from '../types';

describe('AgentManager', () => {
  let agentManager: AgentManager;

  beforeEach(() => {
    agentManager = new AgentManager({
      projectId: 'test-project',
      region: 'us-central1',
      datasetId: 'test_dataset',
      enableStats: true,
    });
  });

  describe('invoke', () => {
    it('should invoke data-science agent successfully', async () => {
      const request: AgentRequest = {
        agentType: 'data-science',
        message: 'Show me user growth over the last 30 days',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      const response = await agentManager.invoke(request);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.model).toBeDefined();
      expect(response.usage).toBeDefined();
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.metadata.requestId).toBeDefined();
    });

    it('should invoke audience-builder agent successfully', async () => {
      const request: AgentRequest = {
        agentType: 'audience-builder',
        message: 'Help me create a high-value customer audience',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      const response = await agentManager.invoke(request);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });

    it('should handle multi-turn conversation', async () => {
      const request1: AgentRequest = {
        agentType: 'data-science',
        message: 'How many users do we have?',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      const response1 = await agentManager.invoke(request1);
      expect(response1.success).toBe(true);

      const request2: AgentRequest = {
        agentType: 'data-science',
        message: 'Show breakdown by country',
        conversationHistory: [
          {
            role: 'user',
            content: 'How many users do we have?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content: response1.message,
            timestamp: new Date(),
          },
        ],
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      const response2 = await agentManager.invoke(request2);
      expect(response2.success).toBe(true);
    });

    it('should throw error for unregistered agent', async () => {
      const request = {
        agentType: 'invalid-agent',
        message: 'Test message',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      await expect(agentManager.invoke(request)).rejects.toThrow(
        "Agent 'invalid-agent' not registered"
      );
    });
  });

  describe('statistics', () => {
    it('should track invocation statistics', async () => {
      const request: AgentRequest = {
        agentType: 'data-science',
        message: 'Test message',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      // Invoke multiple times
      await agentManager.invoke(request);
      await agentManager.invoke(request);
      await agentManager.invoke(request);

      const stats = agentManager.getStats('data-science');
      expect(stats).toBeDefined();
      expect(stats!.totalInvocations).toBe(3);
      expect(stats!.successfulInvocations).toBe(3);
      expect(stats!.failedInvocations).toBe(0);
      expect(stats!.avgResponseTimeMs).toBeGreaterThan(0);
      expect(stats!.totalTokens).toBeGreaterThan(0);
      expect(stats!.successRate).toBe(1.0);
    });

    it('should get all agent statistics', async () => {
      const request1: AgentRequest = {
        agentType: 'data-science',
        message: 'Test message',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      const request2: AgentRequest = {
        agentType: 'audience-builder',
        message: 'Test message',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      await agentManager.invoke(request1);
      await agentManager.invoke(request2);

      const allStats = agentManager.getAllStats();
      expect(allStats.size).toBe(2);
      expect(allStats.has('data-science')).toBe(true);
      expect(allStats.has('audience-builder')).toBe(true);
    });

    it('should reset statistics', async () => {
      const request: AgentRequest = {
        agentType: 'data-science',
        message: 'Test message',
        context: {
          tenantId: 'tenant_test',
          userId: 'user_test',
          userRole: 'user',
          sessionId: 'session_test',
        },
      };

      await agentManager.invoke(request);
      let stats = agentManager.getStats('data-science');
      expect(stats!.totalInvocations).toBe(1);

      agentManager.resetStats('data-science');
      stats = agentManager.getStats('data-science');
      expect(stats!.totalInvocations).toBe(0);
    });
  });
});
