import { PartialType } from '@nestjs/mapped-types';
import { createStudentDto } from './create-student.dto';

export class updateStudentDto extends PartialType(createStudentDto) {}
