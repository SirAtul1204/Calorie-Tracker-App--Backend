import * as Joi from 'joi';
import { BadRequestException } from '@nestjs/common';
export const JoiValidate = (schema: Joi.ObjectSchema, data: any) => {
  const { value, error } = schema.validate(data);
  if (error) throw new BadRequestException(error.details[0].message);
  return value;
};
