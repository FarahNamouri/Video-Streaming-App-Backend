/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../model/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Sign up function :
  async signup(user: User): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);
    const reqBody = {
      fullname: user.fullname,
      email: user.email,
      password: hash,
    };
    const newUser = new this.userModel(reqBody);
    return newUser.save();
  }

  // Sign in function :
  async signin(user: User, jwt: JwtService): Promise<any> {
    // determine if the user exists :
    const foundUser = await this.userModel
      .findOne({ email: user.email })
      .exec();
    // compare the given pwd to the one stored in the DB :
    if (foundUser) {
      const { password } = foundUser;
      if (bcrypt.compare(user.password, password)) {
        const payload = { email: user.email };
        return {
          token: jwt.sign(payload),
        };
      }
      return new HttpException(
        'Incorrect username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return new HttpException(
      'Incorrect username or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
  // retrieve user data based on email :
  async getOne(email): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }
}
