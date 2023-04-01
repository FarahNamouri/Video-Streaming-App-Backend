/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { User } from '../model/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/service/user.service';

@Controller('/api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  @Post('/signup')
  async Signup(@Res() response, @Body() user: User) {
    // creating a new user by sending the user Schema object to the userService sign up method :
    const newUser = await this.userService.signup(user);
    return response.status(HttpStatus.CREATED).json({ newUser });
  }
  @Post('/signin')
  async SignIn(@Res() response, @Body() user: User) {
    const token = await this.userService.signin(user, this.jwtService);
    return response.status(HttpStatus.OK).json(token)
  }
}
