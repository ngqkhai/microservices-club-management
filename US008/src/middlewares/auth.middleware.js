const authMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      status: 401,
      error: "UNAUTHORIZED",
      message: "Missing user information in headers"
    });
  }

  req.user = {
    id: userId,
    email: req.headers['x-user-email'],
    fullName: req.headers['x-user-full-name'],
    roles: req.headers['x-user-roles'],
    emailVerified: req.headers['x-user-email-verified']
  };

  next();
};

module.exports = authMiddleware;
/*
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  let userId = req.headers['x-user-id'];

  if (!userId) {
    console.warn('x-user-id header missing. Using mock userId for dev test');
    userId = 'mock-user-id-123';
  }

  req.user = {
    id: userId,
    email: req.headers['x-user-email'] || 'mock@example.com',
    fullName: req.headers['x-user-full-name'] || 'Mock User',
    roles: req.headers['x-user-roles'] || 'user',
    emailVerified: req.headers['x-user-email-verified'] || 'true'
  };

  try {
    let profile = await User.findById(userId);

    if (!profile) {
      await User.create({
        _id: userId,
        avatar_url: '',
        bio: '',
        phone: '',
        date_of_birth: null,
        address: '',
        social_links: {},
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log(`Mocked user profile for _id: ${userId}`);
    }

    next();
  } catch (error) {
    console.error('Error creating mock user profile:', error);
    res.status(500).json({
      status: 500,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to mock user profile"
    });
  }
};

module.exports = authMiddleware;*/