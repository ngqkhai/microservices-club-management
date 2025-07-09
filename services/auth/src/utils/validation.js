const Joi = require('joi');

// Common validation rules
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

const nameSchema = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .pattern(new RegExp('^[\\p{L}\\p{M}\\s\\.\\-\']+$', 'u'))
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, dots, hyphens, and apostrophes',
    'any.required': 'Full name is required'
  });

// User registration validation
const registerSchema = Joi.object({
  email: emailSchema,
  full_name: nameSchema,
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .optional()
    .messages({
      'any.only': 'Passwords do not match'
    }),
  role: Joi.string()
    .valid('USER', 'ADMIN')
    .default('USER')
    .messages({
      'any.only': 'Role must be either USER or ADMIN'
    })
});

// User login validation
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    }),
  rememberMe: Joi.boolean().default(false)
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
  email: emailSchema
});

// Reset password validation
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  newPassword: passwordSchema
});

// Change password validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: passwordSchema
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.base': 'Refresh token must be a string'
    })
});

// Email verification validation
const emailVerificationSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required',
      'string.base': 'Verification token must be a string'
    })
});

// Account deletion validation
const accountDeletionSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password confirmation is required to delete account'
    }),
});

// User ID parameter validation
const userIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required'
    })
});

// Header validation for API Gateway integration
const gatewayHeadersSchema = Joi.object({
  'x-user-id': Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'User ID must be a valid UUID',
      'any.required': 'User ID header is required'
    }),
  'x-user-role': Joi.string()
    .valid('USER', 'ADMIN')
    .required()
    .messages({
      'any.only': 'User role must be either USER or ADMIN',
      'any.required': 'User role header is required'
    }),
  'x-user-email': Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'User email must be valid'
    })
}).unknown(true);

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: property === 'headers'
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Gateway headers validation middleware
const validateGatewayHeaders = (req, res, next) => {
  const { error, value } = gatewayHeadersSchema.validate(req.headers, {
    stripUnknown: true,
    allowUnknown: true
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(401).json({
      success: false,
      message: 'Invalid or missing authentication headers',
      errors: errorDetails
    });
  }

  // Store validated headers in req for easy access
  req.user = {
    id: value['x-user-id'],
    role: value['x-user-role'],
    email: value['x-user-email']
  };

  next();
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  emailVerificationSchema,
  accountDeletionSchema,
  userIdParamSchema,
  gatewayHeadersSchema,
  
  // Validation middleware
  validate,
  validateGatewayHeaders,
  
  // Individual validations
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateEmailVerification: validate(emailVerificationSchema),
  validateAccountDeletion: validate(accountDeletionSchema),
  validateUserIdParam: validate(userIdParamSchema, 'params'),
  
  // Common patterns
  emailSchema,
  passwordSchema,
  nameSchema
}; 