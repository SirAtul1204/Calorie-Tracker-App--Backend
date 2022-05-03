import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';

import * as Bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import * as generatePassword from 'password-generator';

interface createArguments {
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  async verify(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      const user = await UserEntity.findOne({
        where: {
          id: decoded.id,
        },
        select: ['id', 'role', 'name'],
      });
      console.log(user);
      return user;
    } catch (e) {
      throw new BadRequestException('Token not provided');
    }
  }

  async create({ name, email }: createArguments) {
    if (!name || !email) throw new BadRequestException('Invalid data');

    email = email.toLowerCase();

    let user = await UserEntity.findOne({
      where: {
        email,
      },
    });
    if (user) throw new ConflictException('User already exists');

    user = new UserEntity();
    user.email = email;
    user.name = name;
    const password = generatePassword();
    user.password = await Bcryptjs.hash(password, 10);
    await user.save();
    const token = jwt.sign({ id: user.id }, process.env.SECRET);
    return {
      msg: 'Success',
      data: {
        token,
        password,
      },
    };
  }
}
