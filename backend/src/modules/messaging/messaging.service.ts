import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  async handleDirectMessage(senderId: string, receiverId: string, content: string) {
    this.logger.log(`Message from ${senderId} to ${receiverId}`);
    return {
      id: 'msg-' + Date.now(),
      senderId,
      receiverId,
      content,
      sentAt: new Date().toISOString(),
    };
  }
}
