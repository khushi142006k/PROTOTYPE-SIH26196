import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get AI instance safely
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing from environment');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Disclaimer appended to fitness advice
const SAFETY_DISCLAIMER = "FitMate provides informational fitness guidance, not medical diagnosis. Consult a healthcare professional before starting new vigorous exercise routines.";

// --- API Endpoints ---

// 1. Generate Personalized Workout Plan
app.post('/api/ai/generate-plan', async (req, res) => {
  try {
    const { profile, goals, duration, availableDays, equipment, location, experience } = req.body;
    
    const prompt = `Act as an expert fitness trainer. Generate a highly structured, personalized weekly workout plan for a user with the following profile:
- Fitness Level / Experience: ${experience || profile?.experience || 'Beginner'}
- Primary Goals: ${Array.isArray(goals) ? goals.join(', ') : goals || 'General Fitness'}
- Available Workout Days per Week: ${availableDays || 4} days
- Target Session Duration: ${duration || 30} minutes
- Workout Location: ${location || 'Home'}
- Available Equipment: ${Array.isArray(equipment) ? equipment.join(', ') : equipment || 'Bodyweight only'}
- Special Preferences / Focus: ${profile?.preferences || 'Balanced body workout'}

Format the output strictly as JSON following this structure:
{
  "planTitle": "4-Week Personalized ${goals?.[0] || 'Fitness'} Plan",
  "summary": "Short 2-sentence plan description",
  "recommendedDays": ${availableDays || 4},
  "estimatedWeeklyBurn": "800-1200 kcal",
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Upper Body & Core",
      "focus": "Strength & Stability",
      "targetArea": "Upper Body",
      "durationMinutes": ${duration || 30},
      "estimatedCalories": 180,
      "exercises": [
        {
          "id": "ex_1",
          "name": "Push-ups (or Knee Push-ups)",
          "sets": 3,
          "reps": "8-12 reps",
          "restSeconds": 60,
          "targetMuscles": "Chest, Shoulders, Triceps",
          "instructions": "Keep core tight and back straight. Lower chest until elbows reach 90 degrees.",
          "safetyTip": "Avoid bowing your lower back.",
          "category": "Strength"
        }
      ]
    }
  ],
  "tips": [
    "Stay hydrated throughout your session",
    "Warm up 3 minutes before starting",
    "Prioritize form over speed"
  ]
}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are FitMate AI, a friendly, encouraging, science-backed personal fitness coach. Always return clean valid JSON according to request.',
      },
    });

    const text = response.text || '{}';
    const jsonResult = JSON.parse(text);
    jsonResult.disclaimer = SAFETY_DISCLAIMER;

    res.json({ success: true, plan: jsonResult });
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate workout plan. Please try again.',
      details: error.message 
    });
  }
});

// 2. AI Fitness Assistant Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], userContext = {} } = req.body;

    const formattedHistory = history.map((h: any) => `${h.role === 'user' ? 'User' : 'FitMate'}: ${h.content}`).join('\n');

    const prompt = `User Context:
- Name: ${userContext.name || 'Friend'}
- Fitness Goal: ${userContext.goal || 'General Fitness'}
- Current Streak: ${userContext.streak || 0} days
- Weekly Completion Rate: ${userContext.weeklyCompletionRate || '0'}%
- Experience: ${userContext.experience || 'Beginner'}
- Equipment: ${userContext.equipment || 'No equipment'}

Conversation History:
${formattedHistory}

Current User Message: "${message}"

Respond as FitMate, an empathetic, encouraging, and knowledgeable AI Fitness Companion.
If the user asks for a workout suggestion (e.g. "Give me a 20 min home workout"), provide clear, numbered exercise steps with sets/reps.
If they ask about missed workouts or motivation, provide compassionate, actionable advice to help them restart seamlessly.
Keep responses engaging, structured with markdown formatting (bullet points, bold headers), and concise. Do NOT give medical advice.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are FitMate AI Personal Trainer. Be warm, direct, inspiring, and concise. Never provide medical advice.',
      },
    });

    res.json({ 
      success: true, 
      reply: response.text || 'I am here to help you hit your fitness goals! What workout are you planning today?' 
    });
  } catch (error: any) {
    console.error('Error in AI Assistant Chat:', error);
    res.status(500).json({ success: false, error: 'AI Assistant temporary error.' });
  }
});

// 3. AI Progress Analysis & Adaptive Recommendations
app.post('/api/ai/analyze-progress', async (req, res) => {
  try {
    const { workoutHistory = [], goals = [], streak = 0, activityLogs = [] } = req.body;

    const prompt = `Analyze this user's fitness progress data:
- Consecutive Workout Streak: ${streak} days
- Recent Workout Logs (last 14 days): ${JSON.stringify(workoutHistory.slice(0, 10))}
- Other Physical Activities: ${JSON.stringify(activityLogs.slice(0, 10))}
- Active Fitness Goals: ${JSON.stringify(goals)}

Generate a personalized progress analysis report in JSON format:
{
  "headline": "A short inspiring summary headline (e.g., 'Consistency Champion! You completed 80% of your weekly targets')",
  "consistencyScore": 85,
  "keyObservations": [
    "Observation 1 about workout frequency or strength gains",
    "Observation 2 about consistency or missed days"
  ],
  "adaptiveRecommendations": [
    {
      "type": "schedule | intensity | exercise | recovery",
      "title": "Actionable Recommendation Title",
      "description": "Clear step-by-step recommendation"
    }
  ],
  "encouragement": "A warm motivational message tailored to their recent performance."
}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonResult = JSON.parse(response.text || '{}');
    res.json({ success: true, analysis: jsonResult });
  } catch (error: any) {
    console.error('Error analyzing progress:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze progress.' });
  }
});

// 4. Adapt Workout Plan based on feedback or missed days
app.post('/api/ai/adapt-plan', async (req, res) => {
  try {
    const { currentPlan, feedback, missedDaysCount } = req.body;

    const prompt = `The user has provided feedback on their current workout plan:
- User Feedback: "${feedback}"
- Missed Days recently: ${missedDaysCount || 0}
- Current Plan Title: ${currentPlan?.planTitle || 'Weekly Plan'}

Please adapt the plan by adjusting difficulty, duration, or rest periods to better fit the user's current situation. Return the adapted plan in the same JSON format as a standard plan.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const adaptedPlan = JSON.parse(response.text || '{}');
    res.json({ success: true, plan: adaptedPlan });
  } catch (error: any) {
    console.error('Error adapting plan:', error);
    res.status(500).json({ success: false, error: 'Failed to adapt plan.' });
  }
});

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

if (process.env.RUN_STANDALONE === 'true') {
  app.listen(PORT, () => {
    console.log(`FitMate backend running on port ${PORT}`);
  });
}

export default app;
