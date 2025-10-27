/**
 * Activation Controller
 *
 * REST API endpoints for audience activation
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivationService } from './activation.service';
import type {
  ActivationRequest,
  ActivationChannel,
  UserIdentifier,
} from '@random-truffle/activation';

/**
 * Update activation DTO
 */
interface UpdateActivationDto {
  identifiersToAdd: UserIdentifier[];
  identifiersToRemove?: UserIdentifier[];
}

/**
 * Activation Controller
 */
@Controller('activation')
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  /**
   * POST /activation
   * Activate audience to multiple channels
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async activate(@Body() request: ActivationRequest) {
    return this.activationService.activateAudience(request);
  }

  /**
   * GET /activation/:audienceId/status
   * Get activation status across all channels
   */
  @Get(':audienceId/status')
  async getStatus(
    @Param('audienceId') audienceId: string,
    @Body()
    channels: Array<{
      channel: ActivationChannel;
      platformAudienceId: string;
    }>
  ) {
    return this.activationService.getStatus(audienceId, channels);
  }

  /**
   * PATCH /activation/:audienceId/:channel/:platformAudienceId
   * Update existing activation (add/remove identifiers)
   */
  @Patch(':audienceId/:channel/:platformAudienceId')
  async update(
    @Param('audienceId') audienceId: string,
    @Param('channel') channel: ActivationChannel,
    @Param('platformAudienceId') platformAudienceId: string,
    @Body() updateDto: UpdateActivationDto
  ) {
    return this.activationService.updateActivation(
      audienceId,
      channel,
      platformAudienceId,
      updateDto.identifiersToAdd,
      updateDto.identifiersToRemove
    );
  }

  /**
   * DELETE /activation/:channel/:platformAudienceId
   * Delete activation from a specific channel
   */
  @Delete(':channel/:platformAudienceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('channel') channel: ActivationChannel,
    @Param('platformAudienceId') platformAudienceId: string
  ) {
    await this.activationService.deleteActivation(channel, platformAudienceId);
  }

  /**
   * POST /activation/:audienceId/channels/:channel
   * Add a new channel to existing activation
   */
  @Post(':audienceId/channels/:channel')
  @HttpCode(HttpStatus.CREATED)
  async addChannel(
    @Param('audienceId') audienceId: string,
    @Param('channel') channel: ActivationChannel,
    @Body()
    request: {
      accountId: string;
      audienceName: string;
      identifiers: UserIdentifier[];
    }
  ) {
    // Create single-channel activation request
    const activationRequest: ActivationRequest = {
      audienceId,
      channels: [
        {
          channel,
          accountId: request.accountId,
          audienceName: request.audienceName,
        },
      ],
      identifiers: request.identifiers,
      requiresApproval: false,
      requestedBy: {
        userId: 'system', // TODO: Get from auth context
        tenantId: 'system',
        userRole: 'user',
      },
    };

    return this.activationService.activateAudience(activationRequest);
  }
}
