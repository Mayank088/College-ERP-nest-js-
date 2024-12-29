/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_ROLE } from '../enums/roles.enum';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/users.schema';
import { Model } from 'mongoose';


/**
 * @export
 * @class JwtMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req, res: Response, next: NextFunction) {
    if (req.body.role === USER_ROLE.ADMIN) {
      req.user = req.body;
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Not authorized');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwtSecret'),
      });

      const verifiedUser = await this.userModel.findById(decoded._id);

      req.user = verifiedUser;
      req.token = token;

      next();

    } catch (error) {
      throw new UnauthorizedException(error.message ,'Invalid token');
    }
  }
}
