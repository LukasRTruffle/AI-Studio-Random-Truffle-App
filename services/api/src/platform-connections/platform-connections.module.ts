import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConnection } from './entities/platform-connection.entity';
import { PlatformConnectionsService } from './platform-connections.service';
import { MetaOAuthController } from './meta-oauth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformConnection])],
  controllers: [MetaOAuthController],
  providers: [PlatformConnectionsService],
  exports: [PlatformConnectionsService],
})
export class PlatformConnectionsModule {}
