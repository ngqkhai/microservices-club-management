const userService = require('../services/userService');
const clubMembershipService = require('../services/clubMembershipService');

class UserController {
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      return res.status(201).json({ 
        message: 'User created successfully',
        user: user 
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const userId = req.user.id; // From authMiddleware
      const user = await userService.getUserProfile(userId);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const userId = req.user.id; // From authMiddleware
      const data = req.body;
      await userService.updateUser(userId, data);
      return res.status(200).json({ message: 'Cập nhật thông tin thành công' });
    } catch (error) {
      next(error);
    }
  }

  async getUserClubs(req, res, next) {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization.split(' ')[1]; // Extract token
      const clubs = await clubMembershipService.getUserClubs(userId, token);
      return res.status(200).json(clubs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
