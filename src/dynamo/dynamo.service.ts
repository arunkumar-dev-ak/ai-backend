import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

export const TABLES = {
  USERS: 'Users',
};

@Injectable()
export class DynamoService {
  private readonly logger = new Logger(DynamoService.name);
  private client: DynamoDBDocumentClient;

  constructor() {
    const dynamo = new DynamoDBClient({
      region: process.env.AWS_REGION || 'ap-south-1',
    });

    this.client = DynamoDBDocumentClient.from(dynamo);
  }

  /*-----
  1.  Create Or fully replace the item
  ------*/
  async putItem<T>(params: {
    tableName: string;
    item: T;
    conditionExpression?: string;
  }) {
    try {
      return await this.client.send(
        new PutCommand({
          TableName: params.tableName,
          Item: params.item as Record<string, any> | undefined,
          ConditionExpression: params.conditionExpression, // only operation is allowed if this is true
        }),
      );
    } catch (error: any) {
      this.logger.error('Dynamo Put Error', error.stack);
      throw error;
    }
  }

  async getItem(params: { tableName: string; key: Record<string, any> }) {
    return this.client.send(
      new GetCommand({
        TableName: params.tableName,
        Key: params.key,
      }),
    );
  }

  async fetchFullItem(tableName: string) {
    return this.client.send(
      new ScanCommand({
        TableName: tableName,
      }),
    );
  }

  async query(params: any) {
    return this.client.send(new QueryCommand(params));
  }
}
