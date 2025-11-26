const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Full name is required'
        },
        len: {
          args: [2, 100],
          msg: 'Full name must be between 2 and 100 characters'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: false,
      validate: {
        isIn: {
          args: [['USER', 'ADMIN']],
          msg: 'Role must be either USER or ADMIN'
        }
      }
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Profile fields from schema
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Phone number must be a valid international format'
        }
      }
    },
    profile_picture_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Profile picture must be a valid URL'
        }
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Bio must not exceed 500 characters'
        }
      }
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Date of birth must be a valid date'
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Date of birth must be in the past'
        }
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['male', 'female', 'other', 'prefer_not_to_say']],
          msg: 'Gender must be one of: male, female, other, prefer_not_to_say'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Address must not exceed 200 characters'
        }
      }
    },
    social_links: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true,
      validate: {
        isValidSocialLinks(value) {
          if (value && typeof value === 'object') {
            const allowedPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'github'];
            const keys = Object.keys(value);
            for (const key of keys) {
              if (!allowedPlatforms.includes(key)) {
                throw new Error(`Invalid social platform: ${key}`);
              }
              if (typeof value[key] !== 'string' || value[key].length > 100) {
                throw new Error(`Invalid URL for ${key}`);
              }
            }
          }
        }
      }
    }
  }, {
    tableName: 'users',
    underscored: true,
    paranoid: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] }
      },
      active: {
        where: {
          deleted_at: null
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  User.prototype.incrementFailedAttempts = async function() {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

    const updates = { failed_login_attempts: this.failed_login_attempts + 1 };

    // Lock account after max attempts
    if (this.failed_login_attempts + 1 >= MAX_ATTEMPTS && !this.isLocked()) {
      updates.locked_until = new Date(Date.now() + LOCK_TIME);
    }

    return this.update(updates);
  };

  User.prototype.resetFailedAttempts = async function() {
    return this.update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login: new Date()
    });
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.failed_login_attempts;
    delete values.locked_until;
    return values;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.scope('withPassword').findOne({
      where: { email: email.toLowerCase() }
    });
  };

  User.createUser = async function(userData) {
    const { email, full_name, password, role = 'USER' } = userData;
    
    return this.create({
      email: email.toLowerCase(),
      full_name,
      password_hash: password,
      role
    });
  };

  // Define associations
  User.associate = function(models) {
    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.PasswordResetToken, {
      foreignKey: 'user_id',
      as: 'passwordResetTokens',
      onDelete: 'CASCADE'
    });
  };

  return User;
}; 