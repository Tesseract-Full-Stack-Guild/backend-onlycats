import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegistrationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string = '';

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string = '';
}
