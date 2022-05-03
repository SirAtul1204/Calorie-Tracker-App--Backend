import { UserEntity } from './entities/user.entity';
import { createConnection } from 'typeorm';
import { FoodEntity } from './entities/food.entity';

const updateThreshold = async (userId: number, newThreshold: number) => {
  await createConnection({
    type: 'better-sqlite3',
    entities: [UserEntity, FoodEntity],
    database: 'dist/db/data.db',
  });
  const user = await UserEntity.findOne(userId);
  if (!user) return;

  user.threshold = newThreshold;
  await user.save();
  console.log(user);
};

updateThreshold(2, 300).then();
