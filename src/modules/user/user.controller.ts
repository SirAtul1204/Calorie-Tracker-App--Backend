import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import AuthGuard from 'src/guards/auth.guard';
import { UserService } from './user.service';
import { JoiValidate } from '../../utils/functions';
import { createUserSchema } from '../../joi/schemas';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('verify')
  async verifyUser(@Query('token') token) {
    return this.userService.verify(token);
  }

  @Post('invite')
  @UseGuards(AuthGuard)
  async createUser(@Body() body) {
    body = JoiValidate(createUserSchema, body);
    return this.userService.create(body);
  }
}
