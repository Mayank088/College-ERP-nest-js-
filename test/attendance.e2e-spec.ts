/* eslint-disable prettier/prettier */
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { createAdmin, createAttendance, createSecondStudent } from './dummyData';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/users.schema';
import { Attendance } from './../src/attendance/attendance.schema';
import { Student } from './../src/student/student.schema';

describe('User End-to-End Tests', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let attendanceModel:Model<Attendance>
  let studentModel: Model<Student>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken('User'));
    attendanceModel = moduleFixture.get<Model<Attendance>>(getModelToken('Attendance'));
    studentModel = moduleFixture.get<Model<Student>>(getModelToken('Student'));
    const mockUserData = createAdmin();
    const mockAttendance = createAttendance();
    const mockStudentData = createSecondStudent();
    await new studentModel(mockStudentData).save();
    await new attendanceModel(mockAttendance).save();
    token = mockUserData.tokens[0].token;
  });

  afterAll(async () => {
    await attendanceModel.deleteMany();
    await app.close();
  });

  test('should create Attendance if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/attendance')
      .send({
        _id: new mongoose.Types.ObjectId(),
        rollNumber: '21ce011',
        isAbsent:'absent',
        date:'09-08-2024'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  test('should not  create Attendance if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/attendance')
      .send({
        _id: new mongoose.Types.ObjectId(),
        rollNumber: '21ce011',
        isAbsent:'absent',
        date:'09-08-2024'
      })
      .expect(401);
  });

  test('should not  create Attendance if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/attendance')
      .send({
        _id: new mongoose.Types.ObjectId(),
        rollNumber: '21ce012',
        isAbsent:'absent',
        date:'09-08-2024'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should update Attendance if  authenticated', async () => {
    await request(app.getHttpServer())
      .patch('/attendance')
      .send({
        rollNumber: '21ce011',
        isAbsent:'present',
        date:'09-08-2024'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not update Attendance if not  authenticated', async () => {
    await request(app.getHttpServer())
      .patch('/attendance')
      .send({
        rollNumber: '21ce011',
        isAbsent:'present',
        date:'09-08-2024'
      })
      .expect(401);
  });

  test('should not update Attendance if invalid details', async () => {
    await request(app.getHttpServer())
      .patch('/attendance')
      .send({
        rollNumber: '21ce11',
        isAbsent:'yes',
        date:'09-08-2024'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should not get  Attendance if invalid details', async () => {
    await request(app.getHttpServer())
      .get('/attendance?date=08-08-2024')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should not get  Attendance if unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/attendance?date=08-08-2024')
      .expect(401);
  });

  test('should delete attendance if authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/attendance?date=09-08-2024&rollNumber=21ce011')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not delete Attendance if invalid details', async () => {
    await request(app.getHttpServer())
      .delete('/attendance?date=09-08-2024&rollNumber=21ce000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should not delete Attendance if not authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/attendance?date=09-08-2024&rollNumber=21ce011')
      .expect(401);
  });
});
