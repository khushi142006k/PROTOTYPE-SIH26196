import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRouter from './routes/ai.ts';
import adminRouter from './routes/admin.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Enable basic CORS headers for security
app.use((req, res, next) => {
  const allowedOrigin = process.env.APP_URL || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const supabaseConfigured = Boolean(
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) && 
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  res.json({
    status: 'online',
    app: 'FitMate AI Personal Fitness Engine',
    version: '2.0.0-production',
    timestamp: new Date().toISOString(),
    supabaseConfigured,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Production Static File Serving
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (process.env.RUN_STANDALONE === 'true') {
  app.listen(PORT, () => {
    console.log(`⚡ FitMate Backend Service running on port ${PORT}`);
  });
}

export default app;
