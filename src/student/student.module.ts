/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../middleware/auth.module';
import { StudentSchema } from './student.schema';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { BatchModule } from '../batch/batch.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Student', schema: StudentSchema }]),
    AuthModule,
    BatchModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports:[StudentService]
})
export class StudentModule {}
