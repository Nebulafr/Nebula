import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppConfigModule } from './config/config.module.js';
import { ChatModule } from './chat/chat.module.js';

@Module({
  imports: [AppConfigModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
