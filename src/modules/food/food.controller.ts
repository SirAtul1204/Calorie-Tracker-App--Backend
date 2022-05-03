import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { identity } from 'rxjs';
import AuthGuard from 'src/guards/auth.guard';
import { FoodService } from './food.service';
import * as Joi from 'joi';
import { JoiValidate } from '../../utils/functions';
import {
  addFoodSchema,
  getAllFoodsSchema,
  updateFoodSchema,
} from '../../joi/schemas';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllFoods(@Req() req, @Query() query) {
    const { page } = JoiValidate(getAllFoodsSchema, query);
    return this.foodService.get(page, req.user);
  }

  @Get('report')
  @UseGuards(AuthGuard)
  async getReport(@Req() req) {
    return await this.foodService.report(req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  async addFood(@Body() body, @Req() req) {
    body = JoiValidate(addFoodSchema, body);
    return await this.foodService.add(body, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteFood(@Param('id') id, @Req() req) {
    return await this.foodService.remove(id, req.user);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  async updateFood(@Param('id') id, @Body() body, @Req() req) {
    body = JoiValidate(updateFoodSchema, body);
    return await this.foodService.update(id, body, req.user);
  }
}
