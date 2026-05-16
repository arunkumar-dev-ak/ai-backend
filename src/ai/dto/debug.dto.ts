import { IsNotEmpty, IsString } from 'class-validator';

export class DebugDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  language!: string;
}
