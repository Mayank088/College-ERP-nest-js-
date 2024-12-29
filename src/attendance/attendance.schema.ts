/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ISABSENT } from '../enums/attendance.enum';

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ required: true })
  date: Date;
  @Prop({ enum: ISABSENT })
  isAbsent: string;
  @Prop({ required: true })
  rollNumber: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
