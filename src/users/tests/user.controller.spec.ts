/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../users.controller';
import { UserService } from '../users.service';
import { AuthService } from '../../middleware/auth.service';
import { CreateUserDto } from '../input/create-users.dto';

const mockUserService = {
  createUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserByDetail: jest.fn(),
  updateUser: jest.fn(),
};

const mockAuthService = {
  generateToken: jest.fn(),
};

const mockUser = {
  _id: 'testUserId',
  name: 'John Doe',
  mobileNumber: 1234567890,
  password: 'password',
  role: 'staff',
  department: 'CE',
  addToken: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateToken as jest.Mock).mockResolvedValue('token123')

      const result = await controller.create(mockUser as CreateUserDto);
      expect(result).toEqual({
        user: mockUser,
        token: 'token123',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by mobile number', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.deleteUser(mockUser.mobileNumber);
      expect(result).toEqual(mockUser);
    });
  });
});

