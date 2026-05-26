'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import api from '@/lib/axios';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role:'assistant', content:'Hey! I\'m VoltBot. Need help finding the perfect gadget?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(uuidv4()).current;
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollDown = () => bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  useEffect(() => { if (open) scrollDown(); }, [msgs, open]);

  const onOpenChange = useCallback((v: boolean) => {
    setOpen(v);
    if (v) setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMsgs(m=>[...m,{role:'user',content:text}]);
    setLoading(true);
    try {
      const {data} = await api.post('/chat/message',{ sessionId, message: text, context:{} });
      setMsgs(m=>[...m,{role:'assistant',content:data.data.reply}]);
    } catch {
      setMsgs(m=>[...m,{role:'assistant',content:'Sorry, I\'m having trouble. Please try again.'}]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.85, y:20 }}
            animate={{ opacity:1, scale:1,   y:0  }}
            exit={{    opacity:0, scale:0.85, y:20 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
            className='fixed bottom-20 left-5 right-5 sm:left-auto sm:right-5 sm:w-80 max-h-[65vh] flex flex-col overflow-hidden rounded-2xl cw'
            style={{ boxShadow: '0 8px 40px var(--cw-shadow)' }}
          >
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3.5' style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'var(--cw-header)' }}>
              <div className='flex items-center gap-2.5'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full' style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Bot size={16} strokeWidth={2} style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <p className='text-[13px] font-bold leading-tight' style={{ color: '#ffffff' }}>VoltBot</p>
                  <div className='flex items-center gap-1 mt-0.5'>
                    <span className='w-1.5 h-1.5 rounded-full' style={{ background: '#22c55e' }} />
                    <span className='text-[10px] font-medium' style={{ color: 'rgba(255,255,255,0.6)' }}>Online</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>onOpenChange(false)} className='cw-btn-close flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200'>
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-3.5 space-y-3 cw-scroll' style={{ background: 'var(--cw-bg)' }}>
              {msgs.map((m,i)=>(
                <motion.div key={i}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  transition={{duration:0.2}}
                  className={`flex gap-2 ${m.role==='user'?'justify-end':''}`}
                >
                  {m.role==='assistant' && (
                    <div className='flex items-center justify-center w-7 h-7 rounded-full mt-0.5 flex-shrink-0' style={{ background: 'var(--cw-accent-dim)' }}>
                      <Bot size={13} strokeWidth={2} style={{ color: 'var(--cw-accent)' }} />
                    </div>
                  )}
                  <div className={`text-[13px] leading-relaxed px-3.5 py-2.5 max-w-[80%] rounded-2xl ${
                    m.role==='user'
                      ? 'text-white'
                      : ''
                  }`}
                    style={m.role==='user'
                      ? { background: 'var(--cw-accent)' }
                      : { background: 'var(--cw-surface)', color: 'var(--cw-text)', border: '1px solid var(--cw-bot-border)' }
                    }
                  >
                    {m.content}
                  </div>
                  {m.role==='user' && (
                    <div className='flex items-center justify-center w-7 h-7 rounded-full mt-0.5 flex-shrink-0' style={{ background: 'var(--cw-accent-dim)' }}>
                      <User size={13} strokeWidth={2} style={{ color: 'var(--cw-accent)' }} />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className='flex gap-2'>
                  <div className='flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0' style={{ background: 'var(--cw-accent-dim)' }}>
                    <Bot size={13} strokeWidth={2} style={{ color: 'var(--cw-accent)' }} />
                  </div>
                  <div className='flex items-center gap-1 px-3.5 py-3 rounded-2xl' style={{ background: 'var(--cw-surface)' }}>
                    {[0,1,2].map(i=>(
                      <motion.span key={i}
                        className='w-2 h-2 rounded-full'
                        style={{ background: 'var(--cw-accent)' }}
                        animate={{y:[0,-6,0]}}
                        transition={{duration:0.6,repeat:Infinity,delay:i*0.15}}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className='flex items-center gap-2 p-3' style={{ borderTop: '1px solid var(--cw-border)', background: 'var(--cw-bg)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&send()}
                placeholder='Ask me anything...'
                className='flex-1 rounded-xl px-4 py-2.5 text-[13px] transition-all duration-200 outline-none'
                style={{ background: 'var(--cw-surface)', color: 'var(--cw-text)', border: '1px solid var(--cw-border)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--cw-accent)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--cw-border)'; }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className='flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 disabled:opacity-40'
                style={{ background: input.trim() ? 'var(--cw-accent)' : 'var(--cw-dim)', color: input.trim() ? '#fff' : 'var(--cw-muted)' }}
              >
                <Send size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Powered by */}
            <div className='flex items-center justify-center gap-1 py-2 text-[10px] font-medium' style={{ background: 'var(--cw-dim)', color: 'var(--cw-muted)', borderTop: '1px solid var(--cw-border)' }}>
              <Zap size={10} strokeWidth={2} style={{ color: 'var(--cw-accent)' }} />
              Powered by VoltCart
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale:1.08 }}
        whileTap={{ scale:0.92 }}
        onClick={()=>onOpenChange(!open)}
        className='cw-fab flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200'
      >
        {open ? <X size={22} strokeWidth={2} /> : <MessageCircle size={22} strokeWidth={2} />}
      </motion.button>

      <style>{`
        .cw {
          --cw-bg: #f0f0f8;
          --cw-surface: #ffffff;
          --cw-header: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          --cw-border: #e2e2ec;
          --cw-text: #111111;
          --cw-muted: #8888aa;
          --cw-accent: #6366f1;
          --cw-accent-dim: rgba(99,102,241,0.1);
          --cw-dim: rgba(0,0,0,0.04);
          --cw-shadow: rgba(99,102,241,0.15);
          --cw-bot-border: rgba(99,102,241,0.08);
        }
        .dark .cw {
          --cw-bg: #08080e;
          --cw-surface: #14141f;
          --cw-header: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          --cw-border: #1e1e30;
          --cw-text: #e8e8f0;
          --cw-muted: #6b6b8a;
          --cw-accent: #818cf8;
          --cw-accent-dim: rgba(129,140,248,0.15);
          --cw-dim: rgba(255,255,255,0.04);
          --cw-shadow: rgba(129,140,248,0.1);
          --cw-bot-border: rgba(129,140,248,0.1);
        }
        .cw-scroll::-webkit-scrollbar { width: 3px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: var(--cw-dim); border-radius: 4px; }

        .cw-btn-close { color: rgba(255,255,255,0.6); background: transparent; }
        .cw-btn-close:hover { background: rgba(255,255,255,0.12); color: #ffffff; }

        .cw-fab {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .cw-fab:hover { filter: brightness(1.12); box-shadow: 0 6px 28px rgba(99,102,241,0.45); }
        .dark .cw-fab {
          background: linear-gradient(135deg, #818cf8, #6366f1);
          box-shadow: 0 4px 20px rgba(129,140,248,0.25);
        }
        .dark .cw-fab:hover { filter: brightness(1.12); box-shadow: 0 6px 28px rgba(129,140,248,0.35); }
      `}</style>
    </div>
  );
}
