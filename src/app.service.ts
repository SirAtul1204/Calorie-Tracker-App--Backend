import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { FoodEntity } from './entities/food.entity';
import { UserEntity } from './entities/user.entity';
import * as faker from 'faker';
import * as _ from 'lodash';
import * as Bcryptjs from 'bcryptjs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    await UserEntity.delete({});
    await FoodEntity.delete({});

    for (let i = 1; i < 50; i++) {
      const user = new UserEntity();
      user.id = i;
      user.name = faker.name.firstName();
      user.role = Math.random() <= 0.3 ? 'ADMIN' : 'REGULAR';
      user.email = faker.internet.email().toLowerCase();
      user.password = Bcryptjs.hashSync('1234', 10);
      user.threshold = 2100;
      await user.save();
    }

    const users = await UserEntity.find({});
    for (let i = 1; i < 51; i++) {
      const food = new FoodEntity();
      food.id = i;
      food.user = _.sample(users);
      const randomDay = Math.ceil(Math.random() * 100);
      const randDate = moment().subtract(randomDay, 'days');
      food.datetime = randDate.format('YYYY-MM-DD HH:mm:ss');
      food.date = randDate.format('YYYY-MM-DD');
      food.name = `Food Name ${i}`;
      food.calorie = Math.floor(Math.random() * 3000) + 100;
      await food.save();
    }
  }
}
