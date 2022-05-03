import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { FoodEntity } from 'src/entities/food.entity';
import { UserEntity } from 'src/entities/user.entity';
import { PAGE_SIZE } from 'src/utils/constants';
import {
  Between,
  Equal,
  FindCondition,
  getRepository,
  MoreThan,
} from 'typeorm';

interface addArguments {
  name: string;
  date: Date;
  calorie: number;
  userId?: number;
}

interface updateArguments {
  id: number;
  name: string;
  date: Date;
  calorie: number;
}

@Injectable()
export class FoodService {
  async get(p = 1, authUser: UserEntity) {
    const allUsers = await UserEntity.find({
      select: ['id', 'email', 'threshold', 'name'],
    });

    const query: FindCondition<FoodEntity> = {};

    const page = Number(p);

    if (authUser.role === 'REGULAR') query.user = authUser;

    const foods = await FoodEntity.find({
      where: query,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      order: { datetime: 'DESC' },
    });

    const usersMap = {};
    allUsers.forEach((user) => {
      usersMap[user.id] = user;
    });

    const dailyCalorieConsumed = await getRepository(FoodEntity)
      .createQueryBuilder('food')
      .select('SUM(food.calorie)', 'sum')
      .addSelect('food.date')
      .addSelect('food.userId')
      .groupBy('food.date')
      .addGroupBy('food.userId')
      .getRawMany();

    const temp = foods.map(async (food: any) => {
      dailyCalorieConsumed.forEach((c) => {
        if (c?.food_date === food.date && c?.food_userId === food.userId)
          food['dayTotalCalorie'] = c?.sum;
      });

      food['user'] = {};
      food['user']['threshold'] = usersMap[food.userId].threshold;
      food['user']['name'] = usersMap[food.userId].name;
      food['user']['id'] = usersMap[food.userId].id;
      food['date'] = food['datetime'];

      // delete food['datetime'];
      delete food['userId'];
      return food;
    });

    const foodItems = await Promise.all(temp).then((data) => data);

    const totalFoods = await FoodEntity.count({ where: query });

    const pageCount = Math.ceil(totalFoods / PAGE_SIZE);
    return { foodItems, page, pageCount };
  }

  async add(
    { name, date, calorie, userId }: addArguments,
    authUser: UserEntity,
  ) {
    if (userId) {
      const user = await UserEntity.findOne(userId);
      if (!user) throw new BadRequestException("User doesn't exist");
    }

    const food = new FoodEntity();
    food.name = name;
    food.datetime = date.toISOString();
    food.calorie = calorie;
    food.userId = userId && authUser.role === 'ADMIN' ? userId : authUser.id;
    food.date = moment(date).format('YYYY-MM-DD');
    await food.save();
    return food;
  }

  async update(
    id: number,
    { name, calorie, date }: updateArguments,
    authUser: UserEntity,
  ) {
    const food = await FoodEntity.findOne(id);
    if (!food) throw new NotFoundException('Food not found');
    if (authUser.role === 'REGULAR' && authUser.id !== food.userId)
      throw new ForbiddenException('You are a REGULAR user');

    food.name = name;
    food.calorie = calorie;
    food.datetime = date.toISOString();
    await food.save();
    return {
      msg: 'Success',
      data: {
        food: food,
      },
    };
  }

  async remove(id: number, authUser: UserEntity) {
    const food = await FoodEntity.findOne(id);
    if (!food) throw new NotFoundException('Food not found');

    if (authUser.role === 'REGULAR') {
      if (food.userId === authUser.id) {
        await food.remove();
      } else throw new ForbiddenException('You are a REGULAR user');
    } else {
      await food.remove();
    }
    return { msg: 'Success' };
  }

  async report(authUser: UserEntity) {
    if (authUser.role !== 'ADMIN')
      throw new ForbiddenException('You are a REGULAR user');

    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const week = new Date();
    week.setDate(date.getDate() - 7);

    const prevWeek = new Date();
    prevWeek.setDate(date.getDate() - 14);

    const report = {};
    report['today'] = {};
    report['thisWeekData'] = {};
    report['prevWeekData'] = {};

    const todayFoods = await FoodEntity.find({
      where: {
        datetime: MoreThan(date.toISOString()),
      },
    });

    report['today']['totalAddedEntries'] = todayFoods.length;
    let todaysCalories = 0;
    todayFoods.forEach((f) => (todaysCalories += f.calorie));
    report['today']['avgCalorie'] = (
      todaysCalories / todayFoods.length
    ).toFixed(2);

    const thisWeekFoods = await FoodEntity.find({
      where: {
        datetime: MoreThan(week.toISOString()),
      },
    });

    report['thisWeekData']['totalAddedEntries'] = thisWeekFoods.length;
    let thisWeekCalories = 0;
    thisWeekFoods.forEach((f) => (thisWeekCalories += f.calorie));
    report['thisWeekData']['avgCalorie'] = (
      thisWeekCalories / thisWeekFoods.length
    ).toFixed(2);

    const prevWeekFoods = await FoodEntity.find({
      where: {
        datetime: Between(prevWeek.toISOString(), week.toISOString()),
      },
    });

    report['prevWeekData']['totalAddedEntries'] = prevWeekFoods.length;
    let prevWeekCalories = 0;
    prevWeekFoods.forEach((f) => (prevWeekCalories += f.calorie));
    report['prevWeekData']['avgCalorie'] = (
      prevWeekCalories / prevWeekFoods.length
    ).toFixed(2);

    return report;
  }
}
