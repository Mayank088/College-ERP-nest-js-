/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DEPARTMENT } from '../enums/department.enum';
import { USER_ROLE } from '../enums/roles.enum';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
  addToken(token: string) {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  mobileNumber: number;

  @Prop({ required: true })
  password: string;

  @Prop({
    enum: DEPARTMENT,
    required: function () {
      return this.role === USER_ROLE.STAFF;
    },
  })

  department: string;
  @Prop({ enum: USER_ROLE, required: true })
  role: string;
  
  @Prop([{ token: { type: String } }])
  tokens: { token: string }[];
  _id: any;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function (next) {
  if (this.role === USER_ROLE.ADMIN) {
    this.department = undefined;
  }
  next();
});

UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.addToken = async function (token: string) {
  this.tokens = this.tokens.concat({ token });
  await this.save();
};
