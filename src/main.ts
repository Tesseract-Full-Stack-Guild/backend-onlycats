import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, LoggerService, MiddlewareConsumer, VersioningType } from '@nestjs/common';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';

const uploadsDir = join(__dirname, '..', '..', 'uploads');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request logging middleware
  app.use(new RequestLoggerMiddleware().use.bind(new RequestLoggerMiddleware()));

  app.use(cookieParser());
  app.use('/uploads', express.static(uploadsDir));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  const whitelist = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[ERROR] ${req.method} ${req.url}`, err.message, err.stack);
    res.status(err.status || 500).json({
      statusCode: err.status || 500,
      message: err.message || 'Internal server error',
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
