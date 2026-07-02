import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { validateEnv } from './infra/env';
import { PrismaModule } from './infra/prisma/prisma.module';
import { GiftModule } from './modules/gift/gift.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { MediaModule } from './modules/media/media.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow<string>('REDIS_URL') },
      }),
    }),
    GiftModule,
    PaymentsModule,
    PromotionsModule,
    AccountsModule,
    AnalyticsModule,
    AiModule,
    MediaModule,
    GalleryModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
