import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.js';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
