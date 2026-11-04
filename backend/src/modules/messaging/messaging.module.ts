import { Module } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';

@Module({
  providers: [MessagingGateway, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
