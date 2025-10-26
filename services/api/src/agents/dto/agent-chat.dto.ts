/**
 * DTOs for Agent Chat API
 */

import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Agent type enum
 */
export enum AgentTypeEnum {
  DATA_SCIENCE = 'data-science',
  AUDIENCE_BUILDER = 'audience-builder',
}

/**
 * AI Model enum
 */
export enum AIModelEnum {
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
  GEMINI_1_5_FLASH = 'gemini-1.5-flash',
  GPT_4_TURBO = 'gpt-4-turbo',
}

/**
 * Conversation message role enum
 */
export enum ConversationRoleEnum {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * Conversation message DTO
 */
export class ConversationMessageDto {
  @IsEnum(ConversationRoleEnum)
  role: ConversationRoleEnum;

  @IsString()
  content: string;

  @IsOptional()
  timestamp?: string;
}

/**
 * Agent chat request DTO
 */
export class AgentChatRequestDto {
  @IsEnum(AgentTypeEnum)
  agentType: AgentTypeEnum;

  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationHistory?: ConversationMessageDto[];

  @IsOptional()
  @IsEnum(AIModelEnum)
  model?: AIModelEnum;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
