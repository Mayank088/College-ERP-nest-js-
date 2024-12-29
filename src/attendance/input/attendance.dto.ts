/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ISABSENT } from '../../enums/attendance.enum';

export class createAttendanceDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsEnum(ISABSENT, { message: 'Provide Valid Attendance' })
  @IsNotEmpty()
  isAbsent: string;
  
  @IsString()
  @IsNotEmpty()
  rollNumber: string;
}

export class getAttendanceDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsString()
  date: string;
}

export class deleteAttendanceDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsString()
  @IsNotEmpty()
  rollNumber: string;
}

export class attendanceAnalyticsDto {
  @IsNotEmpty()
  @IsString()
  startDate: string;
  
  @IsNotEmpty()
  @IsString()
  endDate: string;
}