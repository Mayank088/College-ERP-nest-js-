/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './middleware/auth.module';
import { BatchModule } from './batch/batch.module';
import { StudentModule } from './student/student.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UserModule,
    AuthModule,
    BatchModule,
    StudentModule,
    AttendanceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
