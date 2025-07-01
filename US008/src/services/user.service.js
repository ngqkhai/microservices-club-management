const User = require('../models/user.model');

const getProfile = async (user) => {
  const profile = await User.findById(user.id);

  if (!profile) {
    throw new Error('User profile not found');
  }

  return {
    id: profile._id,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    phone: profile.phone,
    date_of_birth: profile.date_of_birth,
    address: profile.address,
    social_links: profile.social_links
  };
};

const updateProfile = async (userId, updates) => {
  const allowedFields = ['avatar_url', 'bio', 'phone', 'date_of_birth', 'address', 'social_links'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  if (updateData.phone && !/^\d{10,11}$/.test(updateData.phone)) {
    const error = new Error('Phone number is invalid');
    error.status = 400;
    error.details = [{ field: 'phone', message: 'Phone number is invalid' }];
    throw error;
  }

  updateData.updated_at = new Date();

  const result = await User.updateOne({ _id: userId }, { $set: updateData });

  if (result.matchedCount === 0) {
    throw new Error('User profile not found');
  }

  return "Profile updated successfully";
};

module.exports = { getProfile, updateProfile };