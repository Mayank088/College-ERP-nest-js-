/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-users.dto';

//PartialType takes an existing class and creates a new type where all the properties of the original class are marked as optional.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
