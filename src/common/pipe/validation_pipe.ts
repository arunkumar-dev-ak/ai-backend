import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

function trimStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.map(trimStrings);
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    for (const key in obj) {
      obj[key] = trimStrings(obj[key]);
    }
    return obj;
  }
  return value;
}

@Injectable()
export class TrimAndValidatePipe implements PipeTransform {
  private validationPipe = new ValidationPipe({
    exceptionFactory: (errors) => {
      const formattedErrors = this.flattenValidationErrors(errors);
      return new BadRequestException({
        message: formattedErrors,
      });
    },
    stopAtFirstError: false,
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });

  private flattenValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): Array<{ property: string; message: string }> {
    const result: Array<{ property: string; message: string }> = [];

    errors.forEach((error) => {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      // If there are direct constraint violations
      if (error.constraints) {
        const firstConstraintKey = Object.keys(error.constraints)[0];
        const message = error.constraints[firstConstraintKey];
        result.push({
          property: propertyPath,
          message,
        });
      }

      // If there are nested validation errors (for arrays/objects)
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.flattenValidationErrors(
          error.children,
          propertyPath,
        );
        result.push(...nestedErrors);
      }
    });

    return result;
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const trimmed = trimStrings(value);
    return this.validationPipe.transform(trimmed, metadata);
  }
}
