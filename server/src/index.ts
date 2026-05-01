import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notifications';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5000; 

app.use(cors()); 
app.use(express.json());

// Routes
app.use('/notifications', notificationRoutes);

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