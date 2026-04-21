import { PartialType } from '@nestjs/mapped-types';
import { RegistrationDto } from './registration.dto.js';

export class UpdateAuthDto extends PartialType(RegistrationDto) {}
