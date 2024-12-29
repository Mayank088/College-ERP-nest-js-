/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DEPARTMENT } from '../enums/department.enum';

class Branch {
  @Prop({ required: true, enum: DEPARTMENT })
  name: string;

  @Prop({ required: true })
  totalStudentsIntake: number;

  @Prop({ default: 0 })
  currentSeatCount: number;
}

@Schema()
export class Batch {
  @Prop({ required: true, unique: true })
  year: number;

  @Prop({ type: [Branch] })
  branches: Branch[];

  @Prop({ required: true, default: 0 })
  totalEnrolledStudents: number;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
