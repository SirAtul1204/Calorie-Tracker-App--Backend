import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FoodEntity } from './entities/food.entity';
import { UserEntity } from './entities/user.entity';
import { FoodController } from './modules/food/food.controller';
import { FoodService } from './modules/food/food.service';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: __dirname + '/db/data.db',
      entities: [UserEntity, FoodEntity],
      synchronize: true,
      // logging: true,
    }),
  ],
  controllers: [AppController, UserController, FoodController],
  providers: [AppService, UserService, FoodService],
})
export class AppModule {}
