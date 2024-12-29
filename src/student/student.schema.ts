import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DEPARTMENT } from '../enums/department.enum';

@Schema()
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  rollNumber: string;

  @Prop({ required: true })
  mobileNumber: number;

  @Prop({ enum: DEPARTMENT, required: true })
  department: DEPARTMENT;

  @Prop({ required: true })
  batch: number;

  @Prop({ required: true })
  currentSemester: number;

  @Prop({ enum: 'student' })
  role: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
