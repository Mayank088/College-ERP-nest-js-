/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { createAttendanceDto } from './attendance.dto';

export class updateStudentDto extends PartialType(createAttendanceDto) {}
