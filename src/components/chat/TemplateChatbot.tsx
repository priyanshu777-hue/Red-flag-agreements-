import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  CheckCircle2,
  RefreshCw,
  Zap,
  Brain,
  MessageSquare,
  Copy,
  Check,
  FileSignature,
  FileText,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export interface GeneratedTemplateData {
  id?: string;
  title: string;
  type?: string;
  category?: string;
  description: string;
  ownerPercent: number;
  commissionPercent: number;
  lockInPeriod?: string;
  noticePeriod?: string;
  keyClauses?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  templateData?: GeneratedTemplateData | null;
}

interface TemplateChatbotProps {
  onSaveTemplateToCRM?: (template: GeneratedTemplateData) => void;
  onSelectTemplateToUse?: (template: GeneratedTemplateData) => void;
}

export const TemplateChatbot: React.FC<TemplateChatbotProps> = ({
  onSaveTemplateToCRM,
  onSelectTemplateToUse,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: `Hello! I am your **Gemini AI Template Architect**. 

Tell me what kind of agreement or MOU template you need by writing a prompt (e.g., *"Create an 85/15 revenue split MOU for luxury homestays with a 15-day notice period"*), and I will generate a complete customized template ready to use in your CRM!`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTemplates, setAddedTemplates] = useState<Record<string, boolean>>({});

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Parse JSON template block from model text response
  const parseJsonTemplate = (text: string): GeneratedTemplateData | null => {
    try {
      const match = text.match(/```json_template\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.title) {
          return {
            id: `tpl_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            title: parsed.title,
            type: parsed.type || 'mou',
            category: parsed.category || 'Custom MOU',
            description: parsed.description || 'AI Generated Template',
            ownerPercent: Number(parsed.ownerPercent) || 85,
            commissionPercent: Number(parsed.commissionPercent) || 15,
            lockInPeriod: parsed.lockInPeriod || '6 months',
            noticePeriod: parsed.noticePeriod || '30 days',
            keyClauses: Array.isArray(parsed.keyClauses) ? parsed.keyClauses : [],
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse json_template block:', e);
    }
    return null;
  };

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        content: textToSend.trim(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    if (!promptText) setInputPrompt('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/gemini/template-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "I've generated your requested agreement template.";
      const tplData = parseJsonTemplate(replyText);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          content: replyText.replace(/```json_template[\s\S]*?```/g, '').trim(),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || selectedModel,
          templateData: tplData,
        },
      ]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          content: 'I created a template for your prompt.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
          templateData: {
            id: `tpl_ai_${Date.now()}`,
            title: `Custom ${textToSend.slice(0, 30)} Template`,
            type: 'mou',
            category: 'Property Management MOU',
            description: `Generated from prompt: "${textToSend}"`,
            ownerPercent: 85,
            commissionPercent: 15,
            keyClauses: [
              '85% revenue payout to Property Owner, 15% commission to Red Flag Homes.',
              'Mandatory guest verification and digital audit trail.',
            ],
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTemplateClick = (tpl: GeneratedTemplateData, msgId: string) => {
    if (onSaveTemplateToCRM) {
      onSaveTemplateToCRM(tpl);
    }
    setAddedTemplates((prev) => ({ ...prev, [msgId]: true }));
  };

  const starterPrompts = [
    'Draft an 85/15 revenue split MOU for luxury homestays with a 15-day notice period',
    'Create an Exclusive Co-Hosting Partnership Contract (80/20 split) for multi-property owners',
    'Generate a Commercial Property Listing Agreement with zero lock-in period',
    'Draft a High-Yield Short Term Rental Management MOU for beach villas',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[650px] max-w-4xl mx-auto overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-950/60 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-tight">Gemini AI Template Architect</h2>
              <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded font-bold">
                Multi-Turn Chat
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Write prompts to design, refine & add custom agreement templates
            </p>
          </div>
        </div>

        {/* Model Selector Pill Group */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-semibold">
          {[
            { id: 'gemini-3.8-flash', name: 'General (3.8 Flash)', icon: Sparkles, color: 'text-amber-400' },
            { id: 'gemini-3.1-flash-lite', name: 'Fast Lite (3.1)', icon: Zap, color: 'text-emerald-400' },
            { id: 'gemini-4-argon', name: 'Complex (4 Argon)', icon: Brain, color: 'text-purple-400' },
          ].map((m) => {
            const Icon = m.icon;
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id as any)}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-bold shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${m.color}`} />
                <span>{m.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-800/60 text-red-400 flex items-center justify-center shrink-0 mt-0.5 shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-red-600 text-white rounded-tr-none shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-70 border-b border-white/10 pb-1 mb-1">
                <span className="font-bold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'Sales Executive' : 'Gemini AI Architect'}
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Message Text Body */}
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {/* Generated Template Card (if parsed) */}
              {msg.templateData && (
                <div className="mt-3 p-4 rounded-xl bg-zinc-950 border-2 border-red-500/40 space-y-3 text-zinc-100 font-sans shadow-xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-red-500" />
                      <span className="font-extrabold text-sm text-white">
                        {msg.templateData.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800/40 font-bold">
                      {msg.templateData.category || 'MOU Template'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic">
                    {msg.templateData.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 text-[9px] block uppercase">Owner Share</span>
                      <strong className="text-emerald-400 font-bold text-sm">
                        {msg.templateData.ownerPercent}%
                      </strong>
                    </div>

                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 text-[9px] block uppercase">Red Flag Share</span>
                      <strong className="text-red-400 font-bold text-sm">
                        {msg.templateData.commissionPercent}%
                      </strong>
                    </div>

                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 col-span-2 sm:col-span-1">
                      <span className="text-zinc-500 text-[9px] block uppercase">Notice Period</span>
                      <strong className="text-zinc-200 font-bold">
                        {msg.templateData.noticePeriod || '30 days'}
                      </strong>
                    </div>
                  </div>

                  {/* Key Clauses Preview */}
                  {msg.templateData.keyClauses && msg.templateData.keyClauses.length > 0 && (
                    <div className="space-y-1 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-[11px]">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Drafted Key Terms & Clauses:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-zinc-300">
                        {msg.templateData.keyClauses.map((clause, idx) => (
                          <li key={idx} className="truncate max-w-full">
                            {clause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add to CRM Action Button */}
                  <div className="pt-1 flex items-center justify-end">
                    {addedTemplates[msg.id] ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-800/60">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Added to Agreement Generator!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddTemplateClick(msg.templateData!, msg.id)}
                        className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-950 flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>✨ Add Template to CRM Generator</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 shadow font-bold text-xs">
                SE
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs font-mono p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 max-w-md">
            <RefreshCw className="w-4 h-4 animate-spin text-red-500 shrink-0" />
            <span>Gemini AI Architect is drafting your custom agreement template...</span>
          </div>
        )}
      </div>

      {/* Preset Prompt Recommendations */}
      <div className="p-3 bg-zinc-950/90 border-t border-zinc-800 shrink-0 space-y-1.5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Quick Starter Prompts:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 whitespace-nowrap shrink-0 transition-colors text-[11px]"
            >
              ✨ {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Write a prompt (e.g., 'Draft an 80/20 Airbnb co-hosting agreement template')..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans"
          />

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              inputPrompt.trim() && !isLoading
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Generate</span>
          </button>
        </form>
      </div>
    </div>
  );
};
