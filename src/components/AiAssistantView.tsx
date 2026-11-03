import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  Stethoscope,
} from 'lucide-react';
import { ChatMessage, AnalysisResult } from '../types';

interface AiAssistantViewProps {
  currentAnalysis: AnalysisResult | null;
  initialQuestion?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  currentAnalysis,
  initialQuestion = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your LabWise AI health educator. I can help explain what specific laboratory tests measure, translate medical jargon into plain English, and clarify why certain parameters might be flagged.

${
  currentAnalysis
    ? `I have your report loaded (${currentAnalysis.tests.length} tests evaluated). What would you like to explore?`
    : 'You can ask general questions about lab tests, or upload a report to receive personalized explanations.'
}

Please remember: I am here for educational awareness and health risk understanding. I cannot provide a medical diagnosis or prescribe medications.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'What does high cholesterol mean?',
        'Why is my hemoglobin low?',
        'What does HbA1c measure?',
        'What questions should I ask my doctor?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState(initialQuestion);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Handle passed initial question
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          currentAnalysis: currentAnalysis,
          chatHistory: messages.slice(-4),
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Thank you for your question. Always discuss these tests directly with your doctor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: data.suggestedFollowUps || [
          'What questions should I ask my physician?',
          'How can lifestyle changes affect these tests?',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a network issue communicating with the AI service. Please verify your connection or consult your healthcare provider directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    'What does high cholesterol mean?',
    'Why is my hemoglobin low?',
    'What does HbA1c measure?',
    'What questions should I ask my doctor?',
    'How do triglycerides relate to diet?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4" id="ai-assistant-container">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ask LabWise AI</h2>
            <p className="text-xs text-slate-500">
              Personalized laboratory biomarker explanations and educational guidance
            </p>
          </div>
        </div>

        {currentAnalysis && (
          <div className="text-xs bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-200 self-start sm:self-auto font-medium">
            Active Context: {currentAnalysis.patientProfile.name || 'Patient'} • {currentAnalysis.tests.length} tests
          </div>
        )}
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-amber-900 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
        </span>
      </div>

      {/* Chat Transcript Window */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>

                <div
                  className={`text-[10px] text-slate-400 px-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] font-medium bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 mr-auto max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>LabWise AI is formulating a patient-friendly response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold whitespace-nowrap text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" /> Quick Ask:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your question about your lab results (e.g. 'Why is my glucose high?')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
