const userService = require('../services/user.service');

const getMe = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    await userService.updateProfile(req.user.id, req.body);
    res.status(200).send("Profile updated successfully");
  } catch (error) {
    if (error.status === 400) {
      res.status(400).json({
        status: 400,
        error: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.details
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { getMe, updateMe };