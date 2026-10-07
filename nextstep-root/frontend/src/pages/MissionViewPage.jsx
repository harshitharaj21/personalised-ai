import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMission, completeMission } from '../services/api';
import Navbar from '../components/Navbar';
import CompletionModal from '../components/CompletionModal';
import AITutorDrawer from '../components/AITutorDrawer';
import { ArrowLeft, Clock, BookOpen, Code2, Target, Bot, CheckCircle2, ChevronRight, Lightbulb } from 'lucide-react';

export default function MissionViewPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadMission();
  }, [id]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadMission = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const result = await fetchMission(token, id);
      setData(result);
      setTimerActive(true); // auto-start timer
    } catch (err) {
      setError(err.message || 'Mission not found or locked.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (difficultyRating, userNotes) => {
    setCompleting(true);
    try {
      const token = await getToken();
      const result = await completeMission(token, id, difficultyRating, userNotes);
      setShowCompletion(false);
      setTimerActive(false);
      // Navigate to dashboard or next mission
      if (result.nextMissionId) {
        navigate(`/mission/${result.nextMissionId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Completion error:', err);
    } finally {
      setCompleting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-white/5 rounded w-32" />
            <div className="h-64 skeleton rounded-2xl" />
            <div className="h-48 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="glass-card p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { mission } = data || {};

  return (
    <div className="min-h-screen bg-surface-900 bg-grid">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Back + timer */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost gap-2">
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm ${
              timer > mission?.estimated_minutes * 60
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-white/8 border-white/10 text-slate-300'
            }`}>
              <Clock size={13} />
              {formatTime(timer)}
            </div>
            <button
              id="open-ai-tutor"
              onClick={() => setShowTutor(true)}
              className="btn-secondary gap-2 text-sm"
            >
              <Bot size={15} className="text-brand-400" />
              AI Tutor
            </button>
          </div>
        </div>

        {/* Mission header */}
        <div className="glass-card p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-mono text-brand-400 mb-1">
                DSA-{String(mission?.sequence_order).padStart(2, '0')} · {mission?.estimated_minutes}min
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{mission?.title}</h1>
              <p className="text-slate-400 mt-2">{mission?.summary}</p>
            </div>
          </div>

          {/* Progress estimate */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Target size={12} />
              <span>Mission {mission?.sequence_order} of 12</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              <span>Est. {mission?.estimated_minutes} min</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Concept Breakdown */}
            <div className="glass-card p-5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen size={17} className="text-brand-400" />
                Concept Breakdown
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">{mission?.concept_breakdown}</p>
            </div>

            {/* Code Snippet */}
            {mission?.code_snippet && (
              <div className="glass-card p-5">
                <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Code2 size={17} className="text-accent-400" />
                  Reference Implementation
                </h2>
                <pre className="code-block text-sm overflow-x-auto">{mission.code_snippet}</pre>
              </div>
            )}

            {/* Practice Prompt */}
            <div className="glass-card p-5 border border-amber-500/20">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <Lightbulb size={17} className="text-amber-400" />
                Practice Challenge
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">{mission?.practice_prompt}</p>
            </div>

            {/* Notes */}
            <div className="glass-card p-5">
              <label className="block font-semibold text-white mb-3 text-sm">Your Notes</label>
              <textarea
                id="mission-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you learn? Any patterns you noticed? Questions for later?"
                rows={5}
                className="input-field resize-none text-sm"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Complete CTA */}
            <div className="glass-card p-5 border border-brand-500/20">
              <h3 className="font-semibold text-white mb-2">Ready to log completion?</h3>
              <p className="text-xs text-slate-400 mb-4">
                Finished studying? Rate the difficulty to help us personalize your next mission.
              </p>
              <button
                id="mark-complete-btn"
                onClick={() => setShowCompletion(true)}
                className="btn-accent w-full text-sm"
              >
                <CheckCircle2 size={15} />
                Mark Complete
              </button>
            </div>

            {/* AI Tutor CTA */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Bot size={16} className="text-brand-400" />
                Need help?
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Ask the AI Tutor to explain any concept, walk through the code, or suggest similar problems.
              </p>
              <button
                onClick={() => setShowTutor(true)}
                className="btn-secondary w-full text-sm"
              >
                Open AI Tutor
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Mission tips */}
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Study Tips</p>
              <ul className="space-y-2">
                {[
                  'Read the concept first — no code',
                  'Trace through the example manually',
                  'Write the code from memory',
                  'Test edge cases before moving on',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-brand-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompletionModal
        isOpen={showCompletion}
        missionTitle={mission?.title}
        onSubmit={handleComplete}
        onClose={() => setShowCompletion(false)}
        isLoading={completing}
      />

      <AITutorDrawer
        isOpen={showTutor}
        onClose={() => setShowTutor(false)}
        mission={mission}
      />
    </div>
  );
}
