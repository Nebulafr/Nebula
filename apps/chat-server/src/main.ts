import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Enable CORS
    app.enableCors({
      origin: '*', // In production, replace with specific origins
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);

    logger.log(`Chat Server (NestJS) is running on: http://localhost:${port}`);
  } catch (error: any) {
    logger.error(`Error starting the server: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
