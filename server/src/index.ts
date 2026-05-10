import 'dotenv/config'; // Must be first — loads .env before any other module reads process.env

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error(`\n❌ ERROR: Missing required environment variables:`);
  missingVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error(`\nPlease check your server/.env file. The server cannot start until these are set.\n`);
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import chatRouter from './routes/chat.js';
import studentsRouter from './routes/students.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/notifications', notificationsRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);
app.use('/students', studentsRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Academic System API is Online!',
    status: 'Healthy',
  });
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});