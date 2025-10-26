/**
 * Agents Controller for Random Truffle API
 *
 * REST endpoints for agent invocation and statistics.
 */

import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentChatRequestDto, AgentTypeEnum } from './dto/agent-chat.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('agents')
@Public() // TODO: Remove this and protect routes with auth
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  /**
   * Chat with agent
   *
   * POST /api/agents/chat
   *
   * @param dto - Chat request body
   * @returns Agent response
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: AgentChatRequestDto) {
    // TODO: Extract tenant ID, user ID, user role, and session ID from authentication
    // For now, use mock values
    const tenantId = 'tenant_dev';
    const userId = 'user_dev';
    const userRole = 'user';
    const sessionId = `session_${Date.now()}`;

    const response = await this.agentsService.chat(dto, tenantId, userId, userRole, sessionId);

    return {
      success: response.success,
      data: {
        message: response.message,
        toolCalls: response.toolCalls,
        model: response.model,
        usage: response.usage,
        metadata: response.metadata,
      },
      error: response.error,
    };
  }

  /**
   * Get statistics for specific agent
   *
   * GET /api/agents/:agentType/stats
   *
   * @param agentType - Agent type
   * @returns Agent statistics
   */
  @Get(':agentType/stats')
  getStats(@Param('agentType') agentType: AgentTypeEnum) {
    const stats = this.agentsService.getStats(agentType);

    if (!stats) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Statistics not found for agent '${agentType}'`,
        },
      };
    }

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get statistics for all agents
   *
   * GET /api/agents/stats
   *
   * @returns All agent statistics
   */
  @Get('stats')
  getAllStats() {
    const allStats = this.agentsService.getAllStats();

    // Convert Map to object for JSON response
    const statsObject: Record<string, unknown> = {};
    for (const [agentType, stats] of allStats) {
      statsObject[agentType] = stats;
    }

    return {
      success: true,
      data: statsObject,
    };
  }

  /**
   * Reset statistics for specific agent
   *
   * POST /api/agents/:agentType/stats/reset
   *
   * @param agentType - Agent type
   * @returns Success response
   */
  @Post(':agentType/stats/reset')
  @HttpCode(HttpStatus.OK)
  resetStats(@Param('agentType') agentType: AgentTypeEnum) {
    this.agentsService.resetStats(agentType);

    return {
      success: true,
      message: `Statistics reset for agent '${agentType}'`,
    };
  }
}
