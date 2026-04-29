import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  Length,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
}

export enum Seeking {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  EVERYONE = 'EVERYONE',
}

export enum Year {
  FRESHMAN = 1,
  SOPHOMORE = 2,
  JUNIOR = 3,
  SENIOR = 4,
}

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name: string = '';

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(100)
  age: number = 0;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender = Gender.MALE;

  @IsNotEmpty()
  @IsEnum(Seeking)
  seeking: Seeking = Seeking.EVERYONE;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  college?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  course?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  major?: string;

  @IsOptional()
  @IsEnum(Year)
  year?: Year;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  dorm?: string;

  @IsOptional()
  @IsBoolean()
  sameMajorOnly?: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  interests: string[] = [];
}
