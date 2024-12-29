/* eslint-disable prettier/prettier */
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createAdmin } from './dummyData';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/users.schema';

describe('Admin and Staff e-2-e Testing', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken('User'));

    const mockUserData = createAdmin();
    
    await new userModel(mockUserData).save();
    token = mockUserData.tokens[0].token;
  });

  test('should get the user profile if authenticated', async () => {
    await request(app.getHttpServer())
      .get('/users/all')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not get the user profile if not authenticated', async () => {
    await request(app.getHttpServer()).get('/users/all').expect(401);
  });

  test('should create the user profile if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/users/staff/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        mobileNumber: 8690340724,
        role: 'staff',
        department: 'CE',
        password: 'password123',
      }) 
      .expect(201);
  });

  test('should create the user profile if authenticated', async () => {
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        mobileNumber: 8690340725,
        role: 'staff',
        department: 'CE',
        password: 'password123',
      })
      .expect(401);
  });

  test('should login the user profile if valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/users/login')
      .send({
        mobileNumber: 1234567890,
        password: 'password123',
      })
      .expect(200);
  });

  test('should not login the user profile if invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/users/login')
      .send({
        mobileNumber: 1234567890,
        password: '0000000',
      })
      .expect(401);
  });

  test('should update the user profile if authenticated', async () => {
    await request(app.getHttpServer())
      .patch('/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        mobileNumber: 1234567890,
        name:'mayank'
      })
      .expect(200);
  });

  test('should not update the user profile if not authenticated', async () => {
    await request(app.getHttpServer())
      .patch('/users/update')
      .send({
        mobileNumber: 1234567890,
        name:'mayank'
      })
      .expect(401);
  });

  test('should  delete the user profile if  authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/users/delete/1234567890')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  test('should not delete the user profile if not authenticated', async () => {
    await request(app.getHttpServer())
      .delete('/users/delete/1234567890')
      .expect(401);
  });

  test('should not delete the user with wrong number', async () => {
    await request(app.getHttpServer())
      .delete('/users/delete/00000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  afterAll(async () => {
    await userModel.deleteMany();
    await app.close();
  });
});