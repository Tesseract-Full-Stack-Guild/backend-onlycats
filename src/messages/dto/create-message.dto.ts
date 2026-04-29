import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsOptional()
  @IsUUID()
  matchId?: string;

  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 5000)
  content: string = '';
}
