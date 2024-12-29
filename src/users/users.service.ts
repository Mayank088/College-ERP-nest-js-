/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './input/create-users.dto';
import { UpdateUserDto } from './input/update-users.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * create new user
   * @param input 
   * @returns 
   * @memberof UserService
   */
  async createUser(input: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        mobileNumber: input.mobileNumber,
      });
      if (existingUser) {
        throw new BadRequestException('Mobile Number already taken');
      }
      const user = await this.userModel.create(input);
      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.errors);
      }
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new HttpException('User with this value already exists', 409);
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  /**
   * get user by details
   * @param obj 
   * @returns 
   * @memberof UserService
   */
  async getUserByDetail(obj): Promise<User[]> {
    try {
      const user = await this.userModel.find({ ...obj });

      if (!user.length) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('An error occurred while fetching user details');
    }
  }

  /**
   * delete user by mobile number
   * @param mobileNumber 
   * @returns 
   * @memberof UserService
   */
  async deleteUser(mobileNumber: number): Promise<User> {
    try {
      const deletedUser = await this.userModel.findOneAndDelete({
        mobileNumber: mobileNumber,
      });

      if (!deletedUser) {
        throw new NotFoundException('No user with such details exists');
      }

      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; 
      }
      throw new InternalServerErrorException('An error occurred while deleting the user');
    }
  }

  /**
   * update user by mobile number
   * @param mobileNumber 
   * @param updateDetails 
   * @returns 
   * @memberof UserService
   */
  async updateUser(
    mobileNumber: number,
    updateDetails: UpdateUserDto,
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { mobileNumber },
        { $set: updateDetails },
        { new: true, runValidators: true },
      );

      if (!updatedUser) {
        throw new NotFoundException(
          'Error updating user, please recheck the mobile number or update details',
        );
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the user',
      );
    }
  }
}
