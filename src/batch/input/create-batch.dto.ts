import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DEPARTMENT } from '../../enums/department.enum';

export class createBranchDto {
  @IsEnum(DEPARTMENT, { message: 'Department must be valid' })
  name: string;

  @IsNumber()
  totalStudentsIntake: number;

  @IsNumber()
  currentSeatCount: number = 0;
}

export class createBatchDto {
  @IsNumber()
  year: number;

  @IsNumber()
  @IsOptional()
  totalEnrolledStudents: number = 0;

  @IsArray()
  @IsOptional()
  branches: createBatchDto[];
}
