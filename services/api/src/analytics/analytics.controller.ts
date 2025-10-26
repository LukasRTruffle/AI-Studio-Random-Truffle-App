import { Controller, Get, Query, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetKPIsDto, GetSessionTrendsDto, GetAudienceMetricsDto } from './dto/analytics.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('analytics')
@Public() // TODO: Remove this and protect routes with auth
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/kpis
   * Get daily KPI metrics
   */
  @Get('kpis')
  @HttpCode(HttpStatus.OK)
  async getKPIs(@Query() dto: GetKPIsDto): Promise<{
    success: boolean;
    data: unknown[];
  }> {
    const data = await this.analyticsService.getKPIs(dto);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/sessions/trends
   * Get session trends
   */
  @Get('sessions/trends')
  @HttpCode(HttpStatus.OK)
  async getSessionTrends(@Query() dto: GetSessionTrendsDto): Promise<{
    success: boolean;
    data: unknown[];
  }> {
    const data = await this.analyticsService.getSessionTrends(dto);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/audiences/:audienceId/metrics
   * Get audience metrics
   */
  @Get('audiences/:audienceId/metrics')
  @HttpCode(HttpStatus.OK)
  async getAudienceMetrics(@Query() dto: GetAudienceMetricsDto): Promise<{
    success: boolean;
    data: unknown[];
  }> {
    const data = await this.analyticsService.getAudienceMetrics(dto);
    return { success: true, data };
  }

  /**
   * GET /api/analytics/cache/stats
   * Get cache statistics
   */
  @Get('cache/stats')
  @HttpCode(HttpStatus.OK)
  getCacheStats(): {
    success: boolean;
    data: { size: number };
  } {
    const data = this.analyticsService.getCacheStats();
    return { success: true, data };
  }

  /**
   * GET /api/analytics/rate-limit/status
   * Get rate limit status
   */
  @Get('rate-limit/status')
  @HttpCode(HttpStatus.OK)
  getRateLimitStatus(): {
    success: boolean;
    data: { perMinute: number; perHour: number };
  } {
    const data = this.analyticsService.getRateLimitState();
    return { success: true, data };
  }

  /**
   * POST /api/analytics/cache/clear
   * Clear analytics cache
   */
  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  clearCache(): {
    success: boolean;
    message: string;
  } {
    this.analyticsService.clearCache();
    return { success: true, message: 'Cache cleared successfully' };
  }
}
