import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); 

import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';
import chatRouter from './routes/chat';

const app = express();
const port = process.env.PORT || 5000; 

app.use(cors()); 
app.use(express.json());

// Mount routes
app.use('/notifications', notificationsRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);

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