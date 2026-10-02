import React, { useState } from 'react';
import { X, Activity, Clock, MapPin, Check, AlertCircle } from 'lucide-react';
import { ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { SupabaseService } from '../services/supabaseClient';

interface ActivityLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityLogged: (activity: ActivityLog) => void;
}

export const ActivityLoggerModal: React.FC<ActivityLoggerModalProps> = ({
  isOpen,
  onClose,
  onActivityLogged,
}) => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState<ActivityLog['activityType']>('Walking');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activityOptions: ActivityLog['activityType'][] = [
    'Walking',
    'Running',
    'Cycling',
    'Yoga',
    'Swimming',
    'Sports',
    'Strength',
    'Home Workout',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    const ratePerMinMap: Record<string, number> = {
      Walking: 4.5,
      Running: 10,
      Cycling: 7.5,
      Yoga: 3.5,
      Swimming: 9,
      Sports: 8,
      Strength: 6,
      'Home Workout': 6.5,
      Other: 5
    };

    const rate = ratePerMinMap[activityType] || 5;
    const estCalories = Math.round(durationMinutes * rate);

    setIsLoading(true);

    try {
      const newActivity = await SupabaseService.saveActivityLog({
        userId: user.id,
        activityType,
        durationMinutes,
        distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
        caloriesEstimated: estCalories,
        date: new Date().toISOString().split('T')[0],
        notes
      });

      setIsLoading(false);
      onActivityLogged(newActivity);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to save activity log');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl relative">
        
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Log Physical Activity</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Activity Type</label>
            <div className="grid grid-cols-3 gap-2">
              {activityOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivityType(type)}
                  className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                    activityType === type
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Distance (km, optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 3.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Evening walk in the park"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Activity</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
