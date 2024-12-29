/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users.schema';
import { CreateUserDto } from '../input/create-users.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUser = {
  _id: 'testUserId',
  name: 'John Doe',
  mobileNumber: 1234567890,
  password: 'password',
  role: 'staff',
  department: 'CE',
};

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndDelete: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken('User'));
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await service.createUser(mockUser as CreateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if mobile number is taken', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser as object);

      await expect(
        service.createUser(mockUser as CreateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by mobile number', async () => {
      jest
        .spyOn(model, 'findOneAndDelete')
        .mockResolvedValueOnce(mockUser as any);

      const result = await service.deleteUser(mockUser.mobileNumber);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(model, 'findOneAndDelete').mockResolvedValueOnce(null);

      await expect(service.deleteUser(1234567899)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
