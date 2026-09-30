import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { StorageService } from '../services/storage';

interface UserProfileViewProps {
  user: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onProfileUpdated,
  language,
  onLanguageChange
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [experience, setExperience] = useState<UserProfile['experience']>(user.experience);
  const [location, setLocation] = useState<UserProfile['location']>(user.location);
  const [availableDays, setAvailableDays] = useState(user.availableDays);
  const [durationMinutes, setDurationMinutes] = useState(user.durationMinutes);
  const [preferences, setPreferences] = useState(user.preferences);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      experience,
      location,
      availableDays,
      durationMinutes,
      preferences,
      language
    };

    StorageService.saveUserProfile(updated);
    onProfileUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 font-black text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          {user.experience} Level
        </span>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Profile & fitness preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Fitness Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Workout Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
            >
              <option value="Home">Home</option>
              <option value="Gym">Gym</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Available Days per Week</label>
            <input
              type="number"
              min="1"
              max="7"
              value={availableDays}
              onChange={(e) => setAvailableDays(parseInt(e.target.value) || 3)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Preferred Duration (Minutes)</label>
            <input
              type="number"
              min="10"
              max="120"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-700 font-semibold block mb-1">Language Preference</label>
          <div className="flex items-center gap-3">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी (Hindi)' },
              { id: 'gu', label: 'ગુજરાતી (Gujarati)' }
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onLanguageChange(lang.id as Language)}
                className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-all ${
                  language === lang.id
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-700 font-semibold block mb-1">Custom Preferences / Focus Notes</label>
          <textarea
            rows={3}
            placeholder="e.g. Focus on core stability and low impact knee exercises."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Preferences</span>
        </button>

      </form>

    </div>
  );
};
