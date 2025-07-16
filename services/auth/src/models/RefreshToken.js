const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
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
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'refresh_tokens',
    underscored: true,
    timestamps: false, // Disable automatic timestamps since DB schema doesn't have updated_at
    paranoid: false, // Explicitly disable soft deletes for refresh tokens
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
  RefreshToken.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  RefreshToken.prototype.isValid = function() {
    return !this.revoked && !this.isExpired();
  };

  RefreshToken.prototype.revoke = async function() {
    return this.update({
      revoked: true
    });
  };

  // Class methods
  RefreshToken.generateToken = function() {
    return crypto.randomBytes(64).toString('hex');
  };

  RefreshToken.createToken = async function(userId) {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const expiresAt = new Date();
    
    // Parse expires_in (e.g., '7d', '24h', '60m')
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));
    
    switch (timeUnit) {
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + timeValue);
        break;
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + timeValue);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
        break;
      default:
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
    }

    return this.create({
      user_id: userId,
      token: this.generateToken(),
      expires_at: expiresAt
    });
  };

  RefreshToken.findValidToken = function(token) {
    return this.findOne({
      where: {
        token,
        revoked: false
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  RefreshToken.revokeAllUserTokens = async function(userId) {
    return this.update(
      { 
        revoked: true
      },
      {
        where: {
          user_id: userId,
          revoked: false
        }
      }
    );
  };

  RefreshToken.cleanupExpiredTokens = async function() {
    return this.destroy({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            revoked: true
          },
          {
            expires_at: {
              [sequelize.Sequelize.Op.lt]: new Date()
            }
          }
        ]
      }
    });
  };

  // Define associations
  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return RefreshToken;
}; 