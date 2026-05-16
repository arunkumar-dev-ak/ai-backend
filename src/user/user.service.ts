import { Injectable, Logger } from '@nestjs/common';
import { DynamoService, TABLES } from 'src/dynamo/dynamo.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly dynamo: DynamoService) {}

  async createUser(dto: CreateUserDto) {
    const item = {
      userId: randomUUID(),
      createdAt: Date.now(),
      name: dto.name,
      email: dto.email,
    };

    await this.dynamo.putItem({
      tableName: TABLES.USERS,
      item,
      conditionExpression: 'attribute_not_exists(userId)',
    });

    this.logger.log(`User created: ${item.userId}`);

    return {
      message: 'User created successfully',
      data: item,
    };
  }

  async getUser(userId: string, createdAt: number) {
    const result = await this.dynamo.getItem({
      tableName: TABLES.USERS,
      key: { userId, createdAt },
    });

    if (!result.Item) {
      return {
        message: 'User not found',
        data: null,
      };
    }

    return {
      message: 'User fetched successfully',
      data: result.Item,
    };
  }

  async getAllUser() {
    const result = await this.dynamo.fetchFullItem(TABLES.USERS);

    return {
      message: 'User fetched successfully',
      data: result.Items,
    };
  }
}
