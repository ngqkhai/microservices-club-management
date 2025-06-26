const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.route');

const app = express();
app.use(express.json());

// Connect MongoDB
mongoose.connect('mongodb+srv://khavinhthuan114:JODNZkKlL3h93cEB@cluster0.pfqrwe3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

app.use(userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});