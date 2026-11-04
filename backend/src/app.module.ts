import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { configValidationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Modules
import { HealthModule } from './modules/health/health.module';
import { AiClientModule } from './modules/ai-client/ai-client.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { VerificationModule } from './modules/verification/verification.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    HealthModule,
    AiClientModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    VerificationModule,
    DiscoveryModule,
    ConnectionsModule,
    MessagingModule,
    MentorshipModule,
    ReferralsModule,
    OpportunitiesModule,
    AnnouncementsModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
