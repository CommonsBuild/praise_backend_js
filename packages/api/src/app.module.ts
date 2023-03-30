import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { EventLogModule } from './event-log/event-log.module';
import { SettingsModule } from './settings/settings.module';
import { PraiseModule } from './praise/praise.module';
import { QuantificationsModule } from './quantifications/quantifications.module';
import { RequestContextModule } from 'nestjs-request-context';
import { PeriodsModule } from './periods/periods.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { ActivateModule } from './activate/activate.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommunityModule } from './community/community.module';
import { MultiTenantConnectionService } from './database/services/multi-tenant-connection-service';
import { RequestLoggerMiddleware } from './shared/middlewares/request-logger.middleware';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MultiTenantConnectionService,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: process.env.NODE_ENV === 'testing' ? 1000 : 10, // 10 requests per minute, except in development
    }),
    ActivateModule,
    ApiKeyModule,
    AuthModule,
    CommunityModule,
    EventLogModule,
    PeriodsModule,
    PraiseModule,
    QuantificationsModule,
    RequestContextModule,
    SettingsModule,
    UserAccountsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ApiKeyModule, AuthModule],
})
export class AppModule {
  // Add a middleware on all routes
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
