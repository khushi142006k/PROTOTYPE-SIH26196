import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  Trash2, 
  Star, 
  X
} from 'lucide-react';
import { Exercise, UserFeedback, UserProfile } from '../types';
import { StorageService } from '../services/storage';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'exercises' | 'feedback' | 'users'>('analytics');
  const [exercises, setExercises] = useState<Exercise[]>(() => StorageService.getExercises());
  const [feedbackList] = useState<UserFeedback[]>(() => StorageService.getFeedback());
  
  // Feedback filter & status state
  const [feedbackFilter, setFeedbackFilter] = useState<string>('All');
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, 'New' | 'Reviewed' | 'Resolved'>>({});

  const handleStatusChange = (id: string, status: 'New' | 'Reviewed' | 'Resolved') => {
    setFeedbackStatuses(prev => ({ ...prev, [id]: status }));
  };

  const filteredFeedback = feedbackList.filter(fb => {
    if (feedbackFilter === 'All') return true;
    return fb.category === feedbackFilter;
  });

  // New Exercise Form State
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState<Exercise['category']>('Strength');
  const [exDifficulty, setExDifficulty] = useState<Exercise['difficulty']>('Beginner');
  const [exTarget, setExTarget] = useState('');
  const [exEquipment, setExEquipment] = useState('None (Bodyweight)');
  const [exInstructions, setExInstructions] = useState('');
  const [exSafety, setExSafety] = useState('');

  // Sample platform users for admin view
  const sampleUsers: UserProfile[] = [
    StorageService.getUserProfile(),
    {
      id: 'usr_102',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      ageGroup: '18-24',
      activityLevel: 'Moderately Active',
      experience: 'Intermediate',
      location: 'Gym',
      availableDays: 5,
      durationMinutes: 45,
      preferredTime: 'Evening',
      equipment: ['Dumbbells', 'Barbell'],
      preferredActivities: ['Strength', 'Hiit'],
      preferences: 'Wants to increase bench press and squat capacity.',
      language: 'en'
    },
    {
      id: 'usr_103',
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      ageGroup: '25-34',
      activityLevel: 'Lightly Active',
      experience: 'Beginner',
      location: 'Home',
      availableDays: 3,
      durationMinutes: 20,
      preferredTime: 'Morning',
      equipment: ['Yoga Mat', 'Resistance Bands'],
      preferredActivities: ['Yoga', 'Stretching'],
      preferences: 'Focus on flexibility and lower back pain relief.',
      language: 'gu'
    }
  ];

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;

    const newEx = StorageService.addExercise({
      name: exName.trim(),
      category: exCategory,
      difficulty: exDifficulty,
      targetArea: exTarget || 'Full Body',
      instructions: exInstructions.split('\n').filter(Boolean),
      defaultReps: '12 reps',
      defaultSets: 3,
      defaultRestSeconds: 45,
      safetyGuidance: exSafety || 'Maintain proper posture.',
      equipmentNeeded: exEquipment,
      iconType: 'generic'
    });

    setExercises([newEx, ...exercises]);
    setShowAddExModal(false);
    setExName('');
    setExInstructions('');
    setExSafety('');
  };

  const handleDeleteExercise = (id: string) => {
    StorageService.deleteExercise(id);
    setExercises(exercises.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Admin Header */}
      <div className="bg-blue-900 border border-blue-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">FitMate Administrative Portal</h1>
            <p className="text-xs text-blue-100/90">Manage exercises, inspect platform analytics, and review user feedback.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-blue-950 p-1.5 rounded-xl border border-blue-800 text-xs">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'exercises', label: 'Exercise Catalog', icon: Dumbbell },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Registered Users</span>
              <span className="text-2xl font-black text-slate-900 font-mono">1,248</span>
              <span className="text-[10px] text-green-600 font-semibold block mt-1">+12% this month</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Workouts Completed</span>
              <span className="text-2xl font-black text-slate-900 font-mono">8,920</span>
              <span className="text-[10px] text-blue-600 font-semibold block mt-1">78% average consistency</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Exercise Catalog Size</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{exercises.length} Exercises</span>
              <span className="text-[10px] text-blue-600 font-semibold block mt-1">6 Active Categories</span>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">User CSAT Rating</span>
              <span className="text-2xl font-black text-slate-900 font-mono">4.9 / 5.0</span>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">Based on feedback</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXERCISES MANAGEMENT TAB */}
      {activeTab === 'exercises' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Exercise Catalog Management</h3>
            <button
              onClick={() => setShowAddExModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Add New Exercise
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{ex.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ex.name}</h4>
                  <p className="text-[11px] text-slate-500">Target: {ex.targetArea} • Equipment: {ex.equipmentNeeded}</p>
                </div>

                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-slate-900">Registered Users Monitor</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Weekly Target</th>
                  <th className="p-3">Preferred Equipment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {u.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{u.email}</span>
                    </td>
                    <td className="p-3">{u.experience}</td>
                    <td className="p-3">{u.location}</td>
                    <td className="p-3 font-mono text-blue-600 font-bold">{u.availableDays} Days / Week</td>
                    <td className="p-3 text-slate-600">{u.equipment.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">User Experience & Bug Report Management</h3>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Categories ({feedbackList.length})</option>
                <option value="General Feedback">General Feedback</option>
                <option value="AI Assistant">AI Assistant</option>
                <option value="Workout">Workout</option>
                <option value="Exercise">Exercise</option>
                <option value="Progress Tracking">Progress Tracking</option>
                <option value="Recommendations">Recommendations</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                No feedback items found for this filter.
              </div>
            ) : (
              filteredFeedback.map((fb) => (
                <div key={fb.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fb.userName || 'User'}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
                        {fb.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(fb.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>

                      {/* Status Selector */}
                      <select
                        value={feedbackStatuses[fb.id] || 'New'}
                        onChange={(e) => handleStatusChange(fb.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          (feedbackStatuses[fb.id] || 'New') === 'New'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : (feedbackStatuses[fb.id] || 'New') === 'Reviewed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <option value="New">Status: New</option>
                        <option value="Reviewed">Status: Reviewed</option>
                        <option value="Resolved">Status: Resolved</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{fb.message}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>User ID: {fb.userId}</span>
                    <span>Submitted: {new Date(fb.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD EXERCISE MODAL */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Exercise</h3>
              <button onClick={() => setShowAddExModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Category</label>
                  <select
                    value={exCategory}
                    onChange={(e) => setExCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Core">Core</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Difficulty</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Target Muscle Group</label>
                <input
                  type="text"
                  placeholder="e.g. Upper Chest & Shoulders"
                  value={exTarget}
                  onChange={(e) => setExTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Instructions (1 step per line)</label>
                <textarea
                  rows={3}
                  placeholder="Step 1...&#10;Step 2..."
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all mt-2"
              >
                Save Exercise
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
