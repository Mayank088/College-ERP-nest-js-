/* eslint-disable prettier/prettier */
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { DEPARTMENT } from '../../enums/department.enum';

export class createStudentDto {
  @IsString()
  name: string;

  @IsString()
  rollNumber: string;

  @IsString()
  mobileNumber: number;

  @IsEnum(DEPARTMENT, { message: 'Not a valid Department' })
  department: DEPARTMENT;

  @IsNumber()
  batch: number;

  @IsNumber()
  currentSemester: number;

  @IsEnum({ role: 'student' })
  role: string;
}
