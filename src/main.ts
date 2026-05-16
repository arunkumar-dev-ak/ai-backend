import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CatchEverythingFilter } from './common/filters/catch_everything_filter';
import { TrimAndValidatePipe } from './common/pipe/validation_pipe';
import { ResponseInterceptor } from './common/interceptors/response_interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new CatchEverythingFilter());

  /*----- Global pipes -----*/
  app.useGlobalPipes(new TrimAndValidatePipe());

  /*----- Response Interceptors -----*/
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
