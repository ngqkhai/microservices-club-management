const Joi = require('joi');

const updateUserSchema = Joi.object({
  full_name: Joi.string().min(1).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  email: Joi.string().email().optional(),
  avatar_url: Joi.string().uri().optional(),
}).min(1); // At least one field must be provided

const validateUpdateUser = (data) => {
  return updateUserSchema.validate(data, { abortEarly: false });
};

module.exports = { validateUpdateUser };
