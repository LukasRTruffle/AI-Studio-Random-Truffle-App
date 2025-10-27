import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AgentsModule } from './agents/agents.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ActivationModule } from './activation/activation.module';
import { PlatformConnectionsModule } from './platform-connections/platform-connections.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM module for PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'random_truffle',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
      logging: process.env.NODE_ENV === 'development',
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    PlatformConnectionsModule,
    AnalyticsModule,
    AgentsModule,
    ActivationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
