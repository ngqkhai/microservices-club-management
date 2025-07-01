const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: { type: String, required: true }, // Dùng user_id từ Auth làm _id

  avatar_url: String,
  phone: String,
  bio: String,
  date_of_birth: Date,
  address: String,
  social_links: Schema.Types.Mixed,

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserProfile', userSchema);