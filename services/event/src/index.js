import express from 'express';
import bodyParser from 'body-parser';
import {eventRoutes, rsvpRoutes } from './routes/eventRoutes.js';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use(eventRoutes);
app.use(rsvpRoutes);

app.listen(PORT, () => {
  console.log(`Event service running on http://localhost:${PORT}`);
});