/* eslint-disable prettier/prettier */
// test/student.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { createFirstStudent, createSecondBatch } from './dummyData';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { createAdmin } from './dummyData';
import { Student } from './../src/student/student.schema';
import { Batch } from '.././src/batch/batch.schema';

describe('Student End-to-End Tests', () => {
  let app: INestApplication;
  let studentModel: Model<Student>;
  let batchModel: Model<Batch>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    studentModel = moduleFixture.get<Model<Student>>(getModelToken('Student'));
    batchModel = moduleFixture.get<Model<Batch>>(getModelToken('Batch'));
    const mockBatchData = createSecondBatch();
    const mockUserData = createAdmin();
    const mockStudentData = createFirstStudent();
    await new studentModel(mockStudentData).save();
    await new batchModel(mockBatchData).save();
    token = mockUserData.tokens[0].token;
  });

  afterAll(async () => {
    await studentModel.deleteMany();
    await app.close();
  });

  test('should get the student if authenticated', async () => {
    await request(app.getHttpServer())
      .get('/student')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not get the student if not authenticated', async () => {
    await request(app.getHttpServer()).get('/student').expect(401);
  });

  test('should create the student if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/student')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'student',
        rollNumber: '21ce057',
        mobileNumber: '1212121212',
        department: 'CE',
        batch: 2024,
        currentSemester: 1,
        role: 'student',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  test('should create the student if batch does not exists', async () => {
    await request(app.getHttpServer())
      .post('/student')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'student',
        rollNumber: '21ce057',
        mobileNumber: '1212121212',
        department: 'CE',
        batch: 2020,
        currentSemester: 1,
        role: 'student',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should not create the student if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/student')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'student',
        rollNumber: '21ce057',
        mobileNumber: '1212121212',
        department: 'CE',
        batch: 2020,
        currentSemester: 1,
        role: 'student',
      })
      .expect(401);
  });

  test('should not create the student if branch doses not exists in a batch', async () => {
    await request(app.getHttpServer())
      .post('/student')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'student',
        rollNumber: '21ce057',
        mobileNumber: '1212121212',
        department: 'ME',
        batch: 2024,
        currentSemester: 1,
        role: 'student',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should get the student analytics if authenticated', async () => {
    await request(app.getHttpServer())
      .get('/student/analytics')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should get the student analytics if authenticated', async () => {
    await request(app.getHttpServer()).get('/student/analytics').expect(401);
  });

  test('should get the student if authenticated', async () => {
    await request(app.getHttpServer())
      .get('/student')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not get the student if not authenticated', async () => {
    await request(app.getHttpServer())
      .get('/student')
      .expect(401);
  });

  test('should delete the student if authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/student?rollNumber=21ce056')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not delete the student if not authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/student?rollNumber=21ce056')
      .expect(401);
  });

  test('should not delete the student if invalid rollNumber', async () => {
    await request(app.getHttpServer())
      .delete('/student?rollNumber=21ce05')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
