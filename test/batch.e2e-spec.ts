/* eslint-disable prettier/prettier */
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { createFirstBatch } from './dummyData';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Batch } from 'src/batch/batch.schema';
import { createAdmin } from './dummyData';

describe('Batch End-to-End Tests', () => {
  let app: INestApplication;
  let batchModel: Model<Batch>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    batchModel = moduleFixture.get<Model<Batch>>(getModelToken('Batch'));
    const mockBatchData = createFirstBatch();
    const mockUserData = createAdmin();
    await new batchModel(mockBatchData).save();
    token = mockUserData.tokens[0].token;
  });

  afterAll(async () => {
    await batchModel.deleteMany();
    await app.close();
  });

  test('should get the batch if authenticated', async () => {
    await request(app.getHttpServer())
      .get('/batch')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not get the batch if not authenticated', async () => {
    await request(app.getHttpServer()).get('/batch').expect(401);
  });

  test('should create a batch if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch')
      .send({
        _id: new mongoose.Types.ObjectId(),
        year: 2021,
        branches: [
          {
            name: 'CE',
            totalStudentsIntake: 2,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  test('should not create a batch if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch')
      .send({
        _id: new mongoose.Types.ObjectId(),
        year: 2021,
        branches: [
          {
            name: 'CE',
            totalStudentsIntake: 2,
          },
        ],
      })
      .expect(401);
  });

  test('should create a branch if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch/branch?year=2021')
      .send({
        name: 'ME',
        totalStudentsIntake: 2,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
  });

  test('should not create a branch twice even if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch/branch?year=2020')
      .send({
        name: 'CE',
        totalStudentsIntake: 2,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  test('should not create a branch with invalid year even if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch/branch?year=2019')
      .send({
        name: 'CE',
        totalStudentsIntake: 2,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('should not create a branch if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/batch/branch?year=2021')
      .send({
        name: 'ME',
        totalStudentsIntake: 2,
      })
      .expect(401);
  });

  test('should delete a batch if authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/batch?year=2021')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not delete a batch if not authenticated', async () => {
    await request(app.getHttpServer()).delete('/batch?year=2021').expect(401);
  });

  test('should not delete a batch if not exists', async () => {
    await request(app.getHttpServer())
      .delete('/batch?year=2019')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
