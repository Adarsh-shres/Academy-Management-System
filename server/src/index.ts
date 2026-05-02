import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notifications.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 

app.use(cors()); 
app.use(express.json());

import userRoutes from './routes/users.js';

// Routes
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);

app.get('/', (_req, res) => {
  res.json({ 
    message: "Academic System API is Online!",
    status: "Healthy" 
  });
});

// 3. Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});