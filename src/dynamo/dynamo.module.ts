import { Global, Module } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { DynamoController } from './dynamo.controller';

@Global()
@Module({
  controllers: [DynamoController],
  providers: [DynamoService],
  exports: [DynamoService],
})
export class DynamoModule {}
