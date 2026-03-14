import 'dotenv/config';

import * as process from 'node:process';

import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { configureRawBody } from './common/config';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { LoggingInterceptor } from './common/interceptors';
import { TelegramBot } from './modules/telegram';

const logger = new Logger('Bootstrap');

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection reason: ${reason}`, (reason as any)?.stack);
});

function setupSwagger(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Echo API')
    .setDescription('API documentation for Echo')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(process.env.APP_SWAGGER_ENDPOINT, app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

function setupHttp(app: NestFastifyApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter());

  // Apply global interceptors for HTTP request logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  logger.log('HTTP request logging enabled', 'API');
}

function setupCors(app: NestFastifyApplication) {
  app.enableCors({
    origin: process.env.APP_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
}

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // @ts-expect-error is ok
  await app.register(multipart, {
    attachFieldsToBody: 'keyValues',
    onFile: async (file) => {
      await file.toBuffer();

      // exclude `fields` property from a result, because it leads to callstack exceed
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fields, ...rest } = file;
      // @ts-expect-error is ok
      file.value = rest;
    },
    limits: {
      fileSize: 20_971_520,
    },
  });
  // @ts-expect-error is ok
  await app.register(cookie);

  // Configure raw body capture for webhook routes (required for signature verification)
  const fastifyInstance = app.getHttpAdapter().getInstance();
  configureRawBody(fastifyInstance);

  setupHttp(app);
  setupCors(app);
  setupSwagger(app);

  const port = process.env.APP_PORT;

  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });

  const telegramBot = app.get(TelegramBot);

  telegramBot.startBot().catch(async (error) => {
    logger.error('Error starting Telegram bot', error);
    await app.close();
  });
}

bootstrap();
