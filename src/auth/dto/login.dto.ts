import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  usernameOrEmail: string = '';

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string = '';
}
