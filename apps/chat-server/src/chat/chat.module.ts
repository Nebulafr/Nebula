import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway.js';
import { ChatService } from './chat.service.js';
import { MessageService } from './message.service.js';

@Module({
  providers: [ChatGateway, ChatService, MessageService],
  exports: [ChatService, MessageService],
})
export class ChatModule {}
