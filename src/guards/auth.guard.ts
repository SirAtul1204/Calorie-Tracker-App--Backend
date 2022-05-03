import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from 'src/entities/user.entity';

export default class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.headers?.jwt;
      if (!token) throw Error('jwt not found');
      const { id } = await jwt.verify(token, process.env.SECRET);
      const user = await UserEntity.findOne(id);
      console.log(user);
      if (user) {
        request.user = user;
        request.token = token;
        return true;
      } else throw Error('Wrong JWT');
    } catch (e) {
      // console.log(e);
      throw new UnauthorizedException();
    }
  }
}
