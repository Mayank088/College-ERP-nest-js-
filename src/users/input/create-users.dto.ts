import { IsEnum, IsString, Length, MinLength } from 'class-validator';
import { DEPARTMENT } from '../../enums/department.enum';
import { USER_ROLE } from '../../enums/roles.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobileNumber: number;

  @MinLength(7, { message: 'Password must be at least 7 characters long' })
  password: string;

  @IsEnum(DEPARTMENT, { message: 'Department must be a valid department' })
  department: string;

  @IsEnum(USER_ROLE, { message: 'Role must be a valid role' })
  role: string;
}
