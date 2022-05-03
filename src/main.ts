import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FoodEntity } from './entities/food.entity';
import { UserEntity } from './entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.PORT);
  app.enableCors();
  await app.listen(process.env.PORT || 3000, () =>
    console.log('Application Ready ⚡, listening on PORT ' + process.env.PORT),
  );
}
bootstrap();
