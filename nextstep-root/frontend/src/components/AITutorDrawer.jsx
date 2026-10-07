import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Code2, Lightbulb, Loader2 } from 'lucide-react';
import { askTutor } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AITutorDrawer({ isOpen, onClose, mission }) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) setMessages([]);
  }, [isOpen]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading || !mission) return;

    const userMsg = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const token = await getToken();
      const res = await askTutor(token, mission.id, userMsg);
      const { tutorResponse } = res;

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          explanation: tutorResponse.explanation,
          codeSnippet: tutorResponse.codeSnippet,
          keyTakeaway: tutorResponse.keyTakeaway,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: 'Couldn\'t reach AI tutor. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED = [
    'Explain this with a simple example',
    'What are common mistakes with this pattern?',
    'How does this relate to real interview problems?',
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full glass-card rounded-none rounded-l-2xl border-r-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-glow-sm">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">NextStep AI Tutor</p>
                <p className="text-xs text-brand-400">
                  {mission?.title || 'Ready to help'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600/30 to-accent-500/30 flex items-center justify-center mx-auto mb-4 border border-brand-500/30">
                  <Bot size={28} className="text-brand-400" />
                </div>
                <p className="text-white font-semibold mb-1">Ask me anything</p>
                <p className="text-sm text-slate-400 mb-6">
                  I'm here to help you understand{' '}
                  <span className="text-brand-300">{mission?.title}</span>
                </p>
                {/* Suggested questions */}
                <div className="space-y-2">
                  {SUGGESTED.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q)}
                      className="w-full text-left px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/30 text-sm text-slate-300 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => (
              <div key={i} className={`animate-fade-in ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                {msg.role === 'user' && (
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand-600/30 border border-brand-500/30">
                    <p className="text-white text-sm">{msg.content}</p>
                  </div>
                )}

                {msg.role === 'ai' && (
                  <div className="max-w-[90%] space-y-3">
                    {/* AI badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                        <Bot size={11} className="text-white" />
                      </div>
                      <span className="text-xs text-brand-400 font-medium">NextStep AI</span>
                    </div>

                    {/* Explanation */}
                    <div className="glass-card p-4">
                      <p className="text-sm text-slate-200 leading-relaxed">{msg.explanation}</p>
                    </div>

                    {/* Code snippet */}
                    {msg.codeSnippet && (
                      <div className="glass-card p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Code2 size={12} className="text-brand-400" />
                          <span className="text-xs text-brand-400 font-medium">Code</span>
                        </div>
                        <pre className="code-block text-xs overflow-x-auto">{msg.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Key takeaway */}
                    {msg.keyTakeaway && (
                      <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200">{msg.keyTakeaway}</p>
                      </div>
                    )}
                  </div>
                )}

                {msg.role === 'error' && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-300">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                  <Loader2 size={11} className="text-white animate-spin" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                id="tutor-question-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about concepts, code, or patterns..."
                className="input-field text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="btn-primary px-4 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
