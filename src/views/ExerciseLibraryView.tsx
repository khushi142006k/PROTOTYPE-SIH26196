import React, { useState } from 'react';
import { Search, Dumbbell, ShieldAlert, Sparkles, X, Loader2 } from 'lucide-react';
import { Exercise, Language } from '../types';
import { useExercises } from '../hooks/useFitMateData';

interface ExerciseLibraryViewProps {
  language: Language;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({ language }) => {
  const { data: exercises = [], isLoading, error } = useExercises();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories = ['All', 'Strength', 'Cardio', 'Core', 'Flexibility', 'Mobility', 'Yoga'];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.targetArea.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-heading">
            <Dumbbell className="w-6 h-6 text-blue-600" />
            <span>Exercise & Workout Library</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Explore safe, structured exercise tutorials complete with target muscles and step-by-step form guidance.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search exercises or muscle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading exercise library from Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-xs text-red-700">
          Failed to load exercise library from database. Please retry.
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500">
          No exercises found matching your search.
        </div>
      ) : (
        /* Exercises Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-3 cursor-pointer transition-all shadow-xs group hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ex.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors font-heading">{ex.name}</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {ex.difficulty}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-500 text-[11px]"><span className="text-slate-700 font-semibold">Target:</span> {ex.targetArea}</p>
                <p className="text-slate-500 text-[11px]"><span className="text-slate-700 font-semibold">Equipment:</span> {ex.equipmentNeeded}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>Default: {ex.defaultSets} sets × {ex.defaultReps}</span>
                <span className="group-hover:translate-x-1 transition-transform">View Form →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXERCISE DETAIL MODAL */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl relative">
            
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{selectedExercise.category}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedExercise.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedExercise(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Target Muscle Group</span>
                  <span className="font-bold text-slate-800">{selectedExercise.targetArea}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Equipment Required</span>
                  <span className="font-bold text-slate-800">{selectedExercise.equipmentNeeded}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Step-by-Step Instructions:</span>
                </h4>
                <ol className="space-y-2 text-xs text-slate-700">
                  {selectedExercise.instructions.map((step, idx) => (
                    <li key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedExercise.safetyGuidance && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 block mb-0.5">Form Safety Guidance:</span>
                    <span>{selectedExercise.safetyGuidance}</span>
                  </div>
                </div>
              )}

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedExercise(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
