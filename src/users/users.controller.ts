/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './input/create-users.dto';
import { UpdateUserDto } from './input/update-users.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../middleware/auth.service';
import { Roles } from '../customDecorator/roles.decorator';
import { USER_ROLE } from '../enums/roles.enum';
import { RolesGuard } from '../auth/role.guard';
import { User } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * create admin
   * @param input 
   * @returns 
   * @memberof UserController
   */
  @Post('signup')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(201)
  async create(@Body() input: CreateUserDto) {
    const admin = await this.userModel.findOne({ role: 'admin' });
    if (admin) {
      throw new BadRequestException('An admin already exists');
    }
    const user = await this.userService.createUser(input);

    const token = await this.authService.generateToken({
      _id: user?._id.toString(),
    });
    await user.addToken(token);
    return { user, token };
  }

  /**
   * create staff by admin
   * @param input 
   * @returns 
   * @memberof UserController
   */
  @Post('staff/create')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(201)
  async createStaff(@Body() input: CreateUserDto) {
    const user = await this.userService.createUser(input);
    const token = await this.authService.generateToken({
      _id: user?._id.toString(),
    });
    await user.addToken(token);
    return { user, token };
  }

  /**
   * login using password and mobile number
   * @param input 
   * @returns 
   * @memberof UserController
   */
  @Post('login')
  @HttpCode(200)
  async logIn(@Body() input:any) {
    const { mobileNumber, password } = input;
    const user = await this.userService.getUserByDetail({ mobileNumber });
    const isMatch = await bcrypt.compare(password, user[0]?.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.generateToken({
      _id: user[0]?._id.toString(),
    });
    await user[0].addToken(token);
    return { user: user[0], token };
  }

  /**
   * get all users 
   * @returns 
   * @memberof UserController
   */
  @Get('all')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async getAllUser(): Promise<User[]> {
    const user = await this.userService.getUserByDetail({});
    return user;
  }

  /**
   * get user by mobile number
   * @param mobileNumber 
   * @returns
   * @memberof UserController 
   */
  @Get(':mobileNumber')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async getOne(@Param('mobileNumber') mobileNumber: string): Promise<User> {
    const user = await this.userService.getUserByDetail({ mobileNumber });
    return user[0];
  }

  /**
   * update user 
   * @param input 
   * @returns 
   * @memberof UserController
   */
  @Patch('update')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async update(@Body() input: UpdateUserDto): Promise<User> {
    return await this.userService.updateUser(input.mobileNumber, input);
  }

  /**
   * logout user
   * @param req 
   * @returns
   * @memberof UserController 
   */
  @Patch('logout')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.STAFF)
  @UseGuards(RolesGuard)
  async logOutUser(@Req() req): Promise<object> {
    req.user.tokens = [];
    await req.user.save();
    return { message: 'Successfully Logged out' };
  }
  
  /**
   * delete user by mobile number
   * @param mobileNumber 
   * @returns 
   * @memberof UserController
   */
  @Delete('delete/:mobileNumber')
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(RolesGuard)
  async deleteUser(@Param('mobileNumber') mobileNumber): Promise<User> {
    const user = await this.userService.deleteUser(mobileNumber);
    return user
  }
}
