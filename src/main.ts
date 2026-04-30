import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  LoggerService,
  MiddlewareConsumer,
  VersioningType,
} from '@nestjs/common';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

const uploadsDir = join(__dirname, '..', '..', 'uploads');
const rootDir = join(__dirname, '..', '..');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request logging middleware
  app.use(
    new RequestLoggerMiddleware().use.bind(new RequestLoggerMiddleware()),
  );

  app.use(cookieParser());
  app.use('/uploads', express.static(uploadsDir));
  app.use('/test', express.static(rootDir, { index: 'index.html' }));

   // Global prefix - disabled to avoid conflict with versioning
   // app.setGlobalPrefix('v1');

   // Global validation
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       forbidNonWhitelisted: true,
       transform: true,
       transformOptions: { enableImplicitConversion: true },
     }),
   );

    // CORS - flexible whitelist for development
    const normalizeOrigin = (origin: string) => origin.replace(/\/+$/, '');
    const envWhitelist = process.env.CORS_ORIGINS?.split(',').map(normalizeOrigin) || [];
    
    // Also allow any localhost port during development
    const isLocalhost = (origin: string) => {
      try {
        const url = new URL(origin);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      } catch {
        return false;
      }
    };
    
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        const isAllowed = envWhitelist.includes(normalizedOrigin) || isLocalhost(normalizedOrigin);
        console.log(`[CORS] ${origin} -> ${isAllowed ? 'ALLOWED' : 'DENIED'} (whitelist: ${envWhitelist.join(', ') || 'empty'})`);
        callback(null, isAllowed);
      },
      credentials: true,
    });

   // Versioning
   app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global error handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error(`[ERROR] ${req.method} ${req.url}`, err.message, err.stack);
      res.status(err.status || 500).json({
        statusCode: err.status || 500,
        message: err.message || 'Internal server error',
      });
    },
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();

