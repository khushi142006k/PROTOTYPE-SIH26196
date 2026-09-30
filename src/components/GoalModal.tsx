import React, { useState } from 'react';
import { X, Target, Plus } from 'lucide-react';
import { Goal, GoalType } from '../types';
import { StorageService } from '../services/storage';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: (goal: Goal) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onGoalAdded }) => {
  const [goalType, setGoalType] = useState<GoalType>('General Fitness');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<number>(4);
  const [unit, setUnit] = useState('workouts/week');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGoal = StorageService.addGoal({
      userId: StorageService.getUserProfile().id,
      goalType,
      title: title.trim(),
      target,
      currentProgress: 0,
      unit,
      startDate: new Date().toISOString().split('T')[0],
      targetDate,
      status: 'In Progress'
    });

    onGoalAdded(newGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl relative">
        
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Set New Fitness Goal</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Goal Category</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="General Fitness">General Fitness</option>
              <option value="Improve Consistency">Improve Consistency</option>
              <option value="Build Strength">Build Strength</option>
              <option value="Improve Stamina">Improve Stamina</option>
              <option value="Improve Flexibility">Improve Flexibility</option>
              <option value="Increase Physical Activity">Increase Physical Activity</option>
              <option value="Maintain Fitness">Maintain Fitness</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Exercise 4 days every week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Amount</label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Unit</label>
              <input
                type="text"
                placeholder="e.g. workouts/week or reps"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </form>

      </div>
    </div>
  );
};
