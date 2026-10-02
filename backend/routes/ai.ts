import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { aiRateLimiter } from '../middleware/rateLimiter.ts';
import { supabaseAdmin } from '../lib/supabaseAdmin.ts';

const router = Router();

// Apply Auth and Rate Limiting
router.use(requireAuth);
router.use(aiRateLimiter);

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing from environment');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'fitmate-app',
      },
    },
  });
}

function getModelName() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

const SAFETY_DISCLAIMER = "FitMate provides informational fitness guidance, not medical diagnosis. Consult a healthcare professional before starting new vigorous exercise routines.";

function buildFallbackPlan(profile: any, parseData: any) {
  const goal = parseData?.goals?.[0] || profile?.preferred_activities?.[0] || 'General Fitness';
  const daysCount = parseData?.availableDays || profile?.available_days || 4;
  const duration = parseData?.duration || profile?.duration_minutes || 30;
  const level = parseData?.experience || profile?.experience || 'Beginner';
  const location = parseData?.location || profile?.location || 'Home';

  const dayTemplates = [
    {
      dayNumber: 1,
      dayName: "Day 1 — Upper Body & Core Strength",
      focus: "Chest, Shoulders & Core",
      targetArea: "Upper Body",
      durationMinutes: duration,
      estimatedCalories: Math.round(duration * 6.5),
      exercises: [
        {
          id: "ex_pushups",
          name: level === 'Beginner' ? "Knee Push-ups / Elevated Push-ups" : "Standard Push-ups",
          sets: 3,
          reps: "8-12 reps",
          restSeconds: 60,
          targetMuscles: "Chest, Triceps, Shoulders",
          instructions: "Keep core tight, lower chest with control, push up explosively.",
          safetyTip: "Do not let hips sag or strain your lower back.",
          category: "Strength"
        },
        {
          id: "ex_plank",
          name: "Core Hold Plank",
          sets: 3,
          reps: "30-45 secs",
          restSeconds: 45,
          targetMuscles: "Abdominals, Core",
          instructions: "Maintain a straight line from head to heels with engaged glutes.",
          safetyTip: "Breathe steadily and keep elbows directly under shoulders.",
          category: "Core"
        },
        {
          id: "ex_pike_pushups",
          name: "Pike Push-ups / Shoulder Press",
          sets: 3,
          reps: "8-10 reps",
          restSeconds: 60,
          targetMuscles: "Deltoids, Upper Body",
          instructions: "Hinge at hips with arms straight, lower crown of head towards floor.",
          safetyTip: "Focus on controlled speed and full range of motion.",
          category: "Strength"
        }
      ]
    },
    {
      dayNumber: 2,
      dayName: "Day 2 — Lower Body Power & Legs",
      focus: "Quads, Glutes & Hamstrings",
      targetArea: "Lower Body",
      durationMinutes: duration,
      estimatedCalories: Math.round(duration * 7.5),
      exercises: [
        {
          id: "ex_squats",
          name: "Bodyweight Air Squats",
          sets: 3,
          reps: "12-15 reps",
          restSeconds: 45,
          targetMuscles: "Quadriceps, Glutes",
          instructions: "Keep chest up and knees tracking over toes. Lower until thighs parallel to floor.",
          safetyTip: "Keep heels firmly planted on ground.",
          category: "Strength"
        },
        {
          id: "ex_lunges",
          name: "Forward & Reverse Lunges",
          sets: 3,
          reps: "10 reps per leg",
          restSeconds: 60,
          targetMuscles: "Quads, Hamstrings, Balance",
          instructions: "Step forward into a knee bend at 90 degrees, push back through front heel.",
          safetyTip: "Keep front knee behind toe line.",
          category: "Strength"
        },
        {
          id: "ex_glute_bridge",
          name: "Glute Bridges",
          sets: 3,
          reps: "12-15 reps",
          restSeconds: 45,
          targetMuscles: "Glutes, Lower Back",
          instructions: "Lying flat on back, drive through heels to lift hips towards ceiling.",
          safetyTip: "Squeeze glutes at peak without over-arching back.",
          category: "Core"
        }
      ]
    },
    {
      dayNumber: 3,
      dayName: "Day 3 — Full Body HIIT & Stamina",
      focus: "Cardiovascular Fitness & Stamina",
      targetArea: "Full Body",
      durationMinutes: duration,
      estimatedCalories: Math.round(duration * 8.5),
      exercises: [
        {
          id: "ex_jumping_jacks",
          name: "Dynamic Jumping Jacks",
          sets: 4,
          reps: "40 secs active / 20 secs rest",
          restSeconds: 30,
          targetMuscles: "Full Body, Cardio",
          instructions: "Jump feet wide while raising arms overhead with quick continuous rhythm.",
          safetyTip: "Land softly on balls of feet.",
          category: "Cardio"
        },
        {
          id: "ex_mountain_climbers",
          name: "Mountain Climbers",
          sets: 3,
          reps: "30 secs active",
          restSeconds: 45,
          targetMuscles: "Core, Shoulders, Cardio",
          instructions: "In high plank position, drive knees to chest alternating rapidly.",
          safetyTip: "Maintain flat back without lifting hips high.",
          category: "Cardio"
        },
        {
          id: "ex_high_knees",
          name: "High Knees Sprint",
          sets: 3,
          reps: "30 secs active",
          restSeconds: 45,
          targetMuscles: "Quads, Calves, Heart Rate",
          instructions: "Run in place bringing knees up to hip height briskly.",
          safetyTip: "Pump arms synchronously for momentum.",
          category: "Cardio"
        }
      ]
    },
    {
      dayNumber: 4,
      dayName: "Day 4 — Core & Active Recovery",
      focus: "Abs, Mobility & Posture",
      targetArea: "Core & Flexibility",
      durationMinutes: duration,
      estimatedCalories: Math.round(duration * 5.5),
      exercises: [
        {
          id: "ex_bicycle_crunches",
          name: "Bicycle Crunches",
          sets: 3,
          reps: "15-20 reps",
          restSeconds: 45,
          targetMuscles: "Obliques, Upper Abs",
          instructions: "Alternate touching opposite elbow to knee in smooth pedal stroke motion.",
          safetyTip: "Do not pull on back of neck.",
          category: "Core"
        },
        {
          id: "ex_bird_dog",
          name: "Bird-Dog Stability Hold",
          sets: 3,
          reps: "10 reps per side",
          restSeconds: 30,
          targetMuscles: "Lower Back, Glutes, Balance",
          instructions: "On hands and knees, extend opposite arm and leg straight out parallel to floor.",
          safetyTip: "Move under full control without twisting hips.",
          category: "Flexibility"
        },
        {
          id: "ex_cat_cow",
          name: "Cat-Cow Stretch Routine",
          sets: 2,
          reps: "60 secs continuous",
          restSeconds: 30,
          targetMuscles: "Spine Mobility & Flexion",
          instructions: "Inhale arching back downwards, exhale tucking chin and rounding spine.",
          safetyTip: "Move gently with your breath.",
          category: "Mobility"
        }
      ]
    }
  ];

  const selectedDays = dayTemplates.slice(0, Math.min(daysCount, dayTemplates.length));

  return {
    planTitle: `${daysCount}-Day Personalized ${goal} Plan`,
    summary: `Tailored ${level.toLowerCase()} routine for ${goal.toLowerCase()} at ${location.toLowerCase()} focusing on progressive consistency and safety.`,
    recommendedDays: daysCount,
    estimatedWeeklyBurn: `${daysCount * 220}-${daysCount * 320} kcal`,
    weeklySchedule: selectedDays,
    tips: [
      "Stay hydrated before, during, and after sessions.",
      "Warm up for 3-5 minutes with light dynamic stretches.",
      "Listen to your body and rest when needed."
    ],
    disclaimer: SAFETY_DISCLAIMER
  };
}

// Helper to log AI usage to DB
async function logAiUsage(userId: string, endpoint: string, status: string, latencyMs: number, error?: string) {
  try {
    await supabaseAdmin.from('ai_usage_logs').insert({
      user_id: userId,
      endpoint,
      status,
      latency_ms: latencyMs,
      error: error || null
    });
  } catch (err) {
    console.error('Error logging AI usage:', err);
  }
}

// Zod Schemas for Request Validation
const GeneratePlanSchema = z.object({
  goals: z.array(z.string()).optional(),
  duration: z.number().optional(),
  availableDays: z.number().optional(),
  equipment: z.array(z.string()).optional(),
  location: z.string().optional(),
  experience: z.string().optional()
});

const ChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z.array(z.object({
    role: z.enum(['user', 'model', 'system']),
    content: z.string()
  })).optional()
});

const AdaptPlanSchema = z.object({
  feedback: z.string().min(1, "Feedback is required"),
  missedDaysCount: z.number().optional()
});

// 1. Generate Personalized Workout Plan
router.post('/generate-plan', async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    const parseResult = GeneratePlanSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: parseResult.error.format() });
    }

    // Load actual user profile from DB
    const { data: dbProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    
    // Load existing active exercises catalog to allow real catalog exercise linking
    const { data: catalogExercises } = await supabaseAdmin.from('exercises').select('id, name, category, difficulty, target_area').eq('is_active', true);
    const catalogSummary = (catalogExercises || []).map(e => `${e.id}: ${e.name} (${e.category}, ${e.difficulty})`).join('\n');

    const profile = dbProfile || req.profile;

    const prompt = `Act as an expert fitness trainer. Generate a highly structured, personalized weekly workout plan for a user with the following verified profile:
- Name: ${profile.name}
- Fitness Level / Experience: ${parseResult.data.experience || profile.experience || 'Beginner'}
- Primary Goals: ${parseResult.data.goals ? parseResult.data.goals.join(', ') : 'General Fitness'}
- Available Workout Days per Week: ${parseResult.data.availableDays || profile.available_days || 4} days
- Target Session Duration: ${parseResult.data.duration || profile.duration_minutes || 30} minutes
- Workout Location: ${parseResult.data.location || profile.location || 'Home'}
- Available Equipment: ${parseResult.data.equipment ? parseResult.data.equipment.join(', ') : (profile.equipment ? profile.equipment.join(', ') : 'Bodyweight only')}
- Special Preferences / Focus: ${profile.preferences || 'Balanced body workout'}

Available Exercise Catalog (prefer using these IDs where relevant):
${catalogSummary}

Format the output strictly as JSON following this structure:
{
  "planTitle": "4-Week Personalized Plan for ${profile.name}",
  "summary": "Short 2-sentence plan description tailored to their goals",
  "recommendedDays": ${parseResult.data.availableDays || profile.available_days || 4},
  "estimatedWeeklyBurn": "800-1200 kcal",
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Upper Body & Core",
      "focus": "Strength & Stability",
      "targetArea": "Upper Body",
      "durationMinutes": ${parseResult.data.duration || profile.duration_minutes || 30},
      "estimatedCalories": 180,
      "exercises": [
        {
          "id": "ex_pushups",
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
    const model = getModelName();

    let jsonResult: any = null;
    let attempts = 0;

    if (process.env.GEMINI_API_KEY) {
      while (attempts < 2 && !jsonResult) {
        attempts++;
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              systemInstruction: 'You are FitMate AI, a friendly, encouraging, science-backed personal fitness coach. Always return clean valid JSON.',
            },
          });

          jsonResult = JSON.parse(response.text || '{}');
        } catch (err) {
          console.warn(`Gemini API generation attempt ${attempts} failed:`, err);
        }
      }
    }

    if (!jsonResult || !jsonResult.weeklySchedule || jsonResult.weeklySchedule.length === 0) {
      console.log('Using robust AI fitness plan generator fallback');
      jsonResult = buildFallbackPlan(profile, parseResult.data);
    }

    jsonResult.disclaimer = SAFETY_DISCLAIMER;

    // Persist new plan in DB (automatic archive trigger handles previous active plan)
    const { data: savedPlan, error: planErr } = await supabaseAdmin
      .from('workout_plans')
      .insert({
        user_id: userId,
        plan_title: jsonResult.planTitle || 'Personalized Workout Plan',
        summary: jsonResult.summary || 'AI Custom Plan',
        recommended_days: jsonResult.recommendedDays || 4,
        estimated_weekly_burn: jsonResult.estimatedWeeklyBurn || '800-1200 kcal',
        weekly_schedule: jsonResult.weeklySchedule || [],
        created_by_ai: true,
        status: 'Active',
        disclaimer: SAFETY_DISCLAIMER
      })
      .select()
      .single();

    if (planErr) console.error('Failed to persist plan in DB:', planErr);

    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/generate-plan', 'success', latency);

    res.json({
      success: true,
      plan: savedPlan ? {
        id: savedPlan.id,
        userId: savedPlan.user_id,
        planTitle: savedPlan.plan_title,
        summary: savedPlan.summary,
        recommendedDays: savedPlan.recommended_days,
        estimatedWeeklyBurn: savedPlan.estimated_weekly_burn,
        weeklySchedule: savedPlan.weekly_schedule,
        createdByAI: savedPlan.created_by_ai,
        status: savedPlan.status,
        disclaimer: savedPlan.disclaimer,
        createdAt: savedPlan.created_at
      } : jsonResult
    });
  } catch (error: any) {
    console.error('Error in plan generation endpoint, providing fallback plan:', error);
    try {
      const fallback = buildFallbackPlan(req.profile || {}, req.body || {});
      return res.json({ success: true, plan: fallback });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Failed to generate AI workout plan.', details: error.message });
    }
  }
});

// 2. AI Fitness Assistant Chat
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    const parseResult = ChatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'Invalid message content' });
    }

    const userMessage = parseResult.data.message;

    // Load actual user profile, active plan, and recent logs directly from DB
    const { data: dbProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    const { data: activePlan } = await supabaseAdmin.from('workout_plans').select('plan_title').eq('user_id', userId).eq('status', 'Active').maybeSingle();
    const { data: recentLogs } = await supabaseAdmin.from('workout_logs').select('day_name, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }).limit(5);

    // Save User message in DB
    await supabaseAdmin.from('chat_messages').insert({ user_id: userId, role: 'user', content: userMessage });

    // Load history from DB if not provided
    const { data: dbHistory } = await supabaseAdmin.from('chat_messages').select('role, content').eq('user_id', userId).order('created_at', { ascending: true }).limit(20);
    const historyList = (dbHistory || []).map(h => `${h.role === 'user' ? 'User' : 'FitMate'}: ${h.content}`).join('\n');

    const profile = dbProfile || req.profile;

    const prompt = `User Context (Verified DB Data):
- Name: ${profile.name}
- Fitness Goal: ${profile.preferred_activities ? profile.preferred_activities.join(', ') : 'General Fitness'}
- Experience: ${profile.experience || 'Beginner'}
- Active Plan: ${activePlan?.plan_title || 'None'}
- Workouts Completed Recently: ${recentLogs?.length || 0} sessions

Conversation History:
${historyList}

Current User Message: "${userMessage}"

Respond as FitMate, an empathetic, encouraging, and knowledgeable AI Fitness Companion.
If the user asks for a workout suggestion, provide clear exercise steps with sets/reps.
If they ask about missed workouts or motivation, provide compassionate, actionable advice.
Keep responses engaging, structured with markdown formatting, concise, and non-medical.`;

    const ai = getAiClient();
    const model = getModelName();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: 'You are FitMate AI Personal Trainer. Be warm, direct, inspiring, and concise. Never provide medical advice.',
      },
    });

    const replyText = response.text || 'I am here to help you hit your fitness goals! What workout are you planning today?';

    // Save AI reply in DB
    await supabaseAdmin.from('chat_messages').insert({ user_id: userId, role: 'model', content: replyText });

    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/chat', 'success', latency);

    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/chat', 'error', latency, error.message);
    console.error('Error in AI Chat:', error);
    res.status(500).json({ success: false, error: 'AI Assistant temporary error.' });
  }
});

// 3. AI Progress Analysis & Adaptive Recommendations
router.post('/analyze-progress', async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    // Fetch actual user data from DB on server side
    const { data: workoutHistory } = await supabaseAdmin.from('workout_logs').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(14);
    const { data: activityLogs } = await supabaseAdmin.from('activity_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14);
    const { data: goals } = await supabaseAdmin.from('goals').select('*').eq('user_id', userId);

    const logsCount = workoutHistory?.length || 0;
    const streak = logsCount; // calculate real streak if needed

    const prompt = `Analyze this user's verified fitness progress data:
- Consecutive Workout Streak: ${streak} days
- Recent Workout Logs (last 14 days): ${JSON.stringify(workoutHistory || [])}
- Other Physical Activities: ${JSON.stringify(activityLogs || [])}
- Active Fitness Goals: ${JSON.stringify(goals || [])}

Generate a personalized progress analysis report in JSON format:
{
  "headline": "A short inspiring summary headline based on real progress",
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
    const model = getModelName();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const jsonResult = JSON.parse(response.text || '{}');

    // Save analysis to DB
    await supabaseAdmin.from('ai_analyses').insert({
      user_id: userId,
      headline: jsonResult.headline || 'Progress Insights',
      consistency_score: jsonResult.consistencyScore || 80,
      observations: jsonResult.keyObservations || [],
      recommendations: jsonResult.adaptiveRecommendations || [],
      encouragement: jsonResult.encouragement || 'Keep pushing forward!'
    });

    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/analyze-progress', 'success', latency);

    res.json({ success: true, analysis: jsonResult });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/analyze-progress', 'error', latency, error.message);
    console.error('Error analyzing progress:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze progress.' });
  }
});

// 4. Adapt Workout Plan
router.post('/adapt-plan', async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user.id;

  try {
    const parseResult = AdaptPlanSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'User feedback is required' });
    }

    // Load active plan from DB
    const { data: currentPlan } = await supabaseAdmin
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Active')
      .maybeSingle();

    if (!currentPlan) {
      return res.status(404).json({ success: false, error: 'No active workout plan found to adapt.' });
    }

    // Compute actual missed days from logs
    const { data: recentLogs } = await supabaseAdmin
      .from('workout_logs')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString());

    const completedThisWeek = recentLogs?.length || 0;
    const targetDays = currentPlan.recommended_days || 4;
    const missedDaysCount = Math.max(0, targetDays - completedThisWeek);

    const prompt = `The user requested an adaptation of their current active workout plan:
- Current Plan Title: "${currentPlan.plan_title}"
- User Feedback / Request: "${parseResult.data.feedback}"
- Missed Days recently: ${missedDaysCount} days
- Current Schedule: ${JSON.stringify(currentPlan.weekly_schedule)}

Please adapt the plan by adjusting difficulty, exercise selection, session duration, or rest periods to address their feedback.
Return the adapted plan in JSON format with "planTitle", "summary", "recommendedDays", "estimatedWeeklyBurn", and "weeklySchedule".`;

    const ai = getAiClient();
    const model = getModelName();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const adaptedPlanJson = JSON.parse(response.text || '{}');

    // Save adapted plan in DB as new Active plan (trigger automatically archives old plan)
    const { data: savedAdaptedPlan, error: saveErr } = await supabaseAdmin
      .from('workout_plans')
      .insert({
        user_id: userId,
        plan_title: adaptedPlanJson.planTitle || `${currentPlan.plan_title} (Adapted)`,
        summary: adaptedPlanJson.summary || `Adapted based on: ${parseResult.data.feedback}`,
        recommended_days: adaptedPlanJson.recommendedDays || currentPlan.recommended_days,
        estimated_weekly_burn: adaptedPlanJson.estimatedWeeklyBurn || currentPlan.estimated_weekly_burn,
        weekly_schedule: adaptedPlanJson.weeklySchedule || currentPlan.weekly_schedule,
        created_by_ai: true,
        status: 'Active',
        disclaimer: SAFETY_DISCLAIMER
      })
      .select()
      .single();

    if (saveErr) throw saveErr;

    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/adapt-plan', 'success', latency);

    res.json({
      success: true,
      plan: {
        id: savedAdaptedPlan.id,
        userId: savedAdaptedPlan.user_id,
        planTitle: savedAdaptedPlan.plan_title,
        summary: savedAdaptedPlan.summary,
        recommendedDays: savedAdaptedPlan.recommended_days,
        estimatedWeeklyBurn: savedAdaptedPlan.estimated_weekly_burn,
        weeklySchedule: savedAdaptedPlan.weekly_schedule,
        createdByAI: savedAdaptedPlan.created_by_ai,
        status: savedAdaptedPlan.status,
        disclaimer: savedAdaptedPlan.disclaimer,
        createdAt: savedAdaptedPlan.created_at
      }
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    await logAiUsage(userId, '/adapt-plan', 'error', latency, error.message);
    console.error('Error adapting plan:', error);
    res.status(500).json({ success: false, error: 'Failed to adapt plan.', details: error.message });
  }
});

export default router;
