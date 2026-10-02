import React, { useState } from 'react';
import { X, MessageSquare, Star, Send, CheckCircle2 } from 'lucide-react';
import { UserFeedback } from '../types';
import { useAuth } from '../context/AuthContext';
import { SupabaseService } from '../services/supabaseClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: (fb: UserFeedback) => void;
}

const CATEGORIES = [
  'General Feedback',
  'AI Assistant',
  'Workout',
  'Exercise',
  'Progress Tracking',
  'Recommendations',
  'UI/UX',
  'Bug Report',
  'Other'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onFeedbackSubmitted
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>('General Feedback');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      setError('Please enter your feedback thoughts.');
      return;
    }

    if (trimmedMsg.length > 500) {
      setError('Feedback message must be 500 characters or less.');
      return;
    }

    setIsLoading(true);

    try {
      const newFb = await SupabaseService.saveFeedback({
        userId: user?.id,
        userName: user?.name || 'Anonymous User',
        category: category as UserFeedback['category'],
        message: trimmedMsg,
        rating
      });

      setIsLoading(false);
      if (onFeedbackSubmitted) onFeedbackSubmitted(newFb);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        setCategory('General Feedback');
        setRating(5);
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center border border-blue-400/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Give Us Your Feedback</h3>
              <p className="text-[11px] text-blue-200">Your feedback helps us improve your FitMate experience.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-600">Your thoughts have been safely recorded in Supabase to refine future AI workout plans.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Rating (Optional)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 block">Feedback Message</label>
                <span className="text-[10px] text-slate-400">{message.length}/500</span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Tell us what you think..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none"
                required
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
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
