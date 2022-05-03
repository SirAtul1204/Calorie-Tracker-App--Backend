import * as Bcryptjs from 'bcryptjs';
import { FoodEntity } from './entities/food.entity';
import { UserEntity } from './entities/user.entity';
import * as moment from 'moment';
import * as faker from 'faker';
import * as _ from 'lodash';
import { createConnection } from 'typeorm';

const seed = async () => {
  await createConnection({
    type: 'better-sqlite3',
    entities: [UserEntity, FoodEntity],
    database: 'dist/db/data.db',
    synchronize: true,
  });
  await UserEntity.delete({});
  await FoodEntity.delete({});

  for (let i = 1; i < 5; i++) {
    const user = new UserEntity();
    user.name = faker.name.firstName();
    user.role = i % 2 ? 'ADMIN' : 'REGULAR';
    user.email = faker.internet.email().toLowerCase();
    user.password = Bcryptjs.hashSync('1234', 10);
    user.threshold = 2100;
    await user.save();
  }

  const users = await UserEntity.find({});
  for (let i = 1; i < 51; i++) {
    const food = new FoodEntity();
    food.id = i;
    food.userId = _.sample(users).id;
    const randomDay = Math.ceil(Math.random() * 100);
    const randDate = moment().subtract(randomDay, 'days');
    food.datetime = randDate.toISOString();
    food.date = randDate.format('YYYY-MM-DD');
    food.name = `Food Name ${i}`;
    food.calorie = Math.floor(Math.random() * 3000) + 100;
    await food.save();
  }
  console.log(users);
  const foods = await FoodEntity.find({});
  console.log(foods);
};

seed().then();
