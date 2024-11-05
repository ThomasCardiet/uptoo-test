import { NestFactory } from '@nestjs/core';

import * as dotenv from 'dotenv';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Implement swagger interface for documentation
  const config = new DocumentBuilder()
    .setTitle('Scraping Server')
    .setDescription('Server for scraping HelloWork job postings')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  // Listen app to env defined port or default 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
