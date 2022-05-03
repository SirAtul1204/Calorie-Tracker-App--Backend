import * as Joi from 'joi';

export const getAllFoodsSchema = Joi.object({
  page: Joi.number().min(1),
});

export const addFoodSchema = Joi.object({
  name: Joi.string().trim().required(),
  date: Joi.date().iso().max('now').required(),
  calorie: Joi.number().min(1).max(5000).required(),
  userId: Joi.number().min(1),
});

export const updateFoodSchema = Joi.object({
  name: Joi.string().trim().required(),
  calorie: Joi.number().min(1).max(5000).required(),
  date: Joi.date().iso().max('now').required(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().trim().required(),
});
