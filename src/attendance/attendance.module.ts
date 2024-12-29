/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceSchema } from './attendance.schema';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Attendance', schema: AttendanceSchema },
    ]),
    StudentModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports : [AttendanceService]
})
export class AttendanceModule {}
