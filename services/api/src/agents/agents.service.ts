/**
 * Agents Service for Random Truffle API
 *
 * Handles agent invocation through AgentManager.
 */

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createAgentManager,
  type AgentManager,
  type AgentRequest,
  type AgentResponse,
  type AgentStats,
  type AgentType,
} from '@random-truffle/agents';
import { AgentChatRequestDto, type AgentTypeEnum } from './dto/agent-chat.dto';

@Injectable()
export class AgentsService implements OnModuleInit {
  private readonly logger = new Logger(AgentsService.name);
  private agentManager: AgentManager;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize agent manager on module init
   */
  async onModuleInit() {
    this.logger.log('Initializing Agent Manager...');

    const projectId = this.configService.get<string>('GCP_PROJECT_ID') || 'random-truffle-dev';
    const region = this.configService.get<string>('GCP_REGION') || 'us-central1';
    const datasetId =
      this.configService.get<string>('BIGQUERY_DATASET_ID') || 'random_truffle_analytics';

    this.agentManager = createAgentManager({
      projectId,
      region,
      datasetId,
      enableStats: true,
    });

    this.logger.log('Agent Manager initialized successfully');
  }

  /**
   * Chat with agent
   *
   * @param dto - Chat request DTO
   * @param tenantId - Tenant ID from request
   * @param userId - User ID from request
   * @param userRole - User role from request
   * @param sessionId - Session ID from request
   * @returns Agent response
   */
  async chat(
    dto: AgentChatRequestDto,
    tenantId: string,
    userId: string,
    userRole: 'user' | 'admin' | 'superadmin',
    sessionId: string
  ): Promise<AgentResponse> {
    this.logger.log(
      `Agent chat request - Agent: ${dto.agentType}, User: ${userId}, Tenant: ${tenantId}`
    );

    // Build agent request
    const request: AgentRequest = {
      agentType: dto.agentType as AgentType,
      message: dto.message,
      conversationHistory: dto.conversationHistory?.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      })),
      context: {
        tenantId,
        userId,
        userRole,
        sessionId,
        metadata: dto.metadata,
      },
      model: dto.model,
    };

    // Invoke agent
    const response = await this.agentManager.invoke(request);

    this.logger.log(
      `Agent response - Success: ${response.success}, Tokens: ${response.usage.totalTokens}, Time: ${response.metadata.responseTimeMs}ms`
    );

    return response;
  }

  /**
   * Get statistics for agent
   *
   * @param agentType - Agent type
   * @returns Agent statistics
   */
  getStats(agentType: AgentTypeEnum): AgentStats | undefined {
    return this.agentManager.getStats(agentType as AgentType);
  }

  /**
   * Get all agent statistics
   *
   * @returns Map of agent statistics
   */
  getAllStats(): Map<AgentType, AgentStats> {
    return this.agentManager.getAllStats();
  }

  /**
   * Reset statistics for agent
   *
   * @param agentType - Agent type
   */
  resetStats(agentType: AgentTypeEnum): void {
    this.agentManager.resetStats(agentType as AgentType);
  }
}
