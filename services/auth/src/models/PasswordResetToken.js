const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const PasswordResetToken = sequelize.define('PasswordResetToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'password_reset_tokens',
    underscored: true,
    timestamps: false, // Disable automatic timestamps since DB schema doesn't have updated_at
    paranoid: false, // Explicitly disable soft deletes for password reset tokens
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['token']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Instance methods
  PasswordResetToken.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  PasswordResetToken.prototype.isValid = function() {
    return !this.used && !this.isExpired();
  };

  PasswordResetToken.prototype.markAsUsed = async function(ipAddress = null) {
    return this.update({
      used: true
    });
  };

  // Class methods
  PasswordResetToken.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
  };

  PasswordResetToken.createToken = async function(userId, ipAddress = null) {
    // Invalidate all existing tokens for this user
    await this.update(
      { used: true },
      {
        where: {
          user_id: userId,
          used: false
        }
      }
    );

    // Create new token with 1 hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    return this.create({
      user_id: userId,
      token: this.generateToken(),
      expires_at: expiresAt
    });
  };

  PasswordResetToken.findValidToken = function(token) {
    return this.findOne({
      where: {
        token,
        used: false
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  PasswordResetToken.cleanupExpiredTokens = async function() {
    return this.destroy({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            expires_at: {
              [sequelize.Sequelize.Op.lt]: new Date()
            }
          },
          {
            used: true,
          }
        ]
      }
    });
  };

  // Define associations
  PasswordResetToken.associate = function(models) {
    PasswordResetToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return PasswordResetToken;
};