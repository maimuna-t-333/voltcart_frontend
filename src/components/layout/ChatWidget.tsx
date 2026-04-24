'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import api from '@/lib/axios';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role:'assistant', content:'Hi! I am TechBot. How can I help you?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(uuidv4()).current;

  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMsgs(m=>[...m,{role:'user',content:text}]);
    setLoading(true);
    try {
      const {data} = await api.post('/chat/message',{ sessionId, message: text, context:{} });
      setMsgs(m=>[...m,{role:'assistant',content:data.data.reply}]);
    } catch {
      setMsgs(m=>[...m,{role:'assistant',content:'Sorry, I am having trouble. Please try again.'}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.8, y:20 }}
            animate={{ opacity:1, scale:1,   y:0  }}
            exit={{    opacity:0, scale:0.8, y:20 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
            className='absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden'
            style={{ height: '420px' }}
          >
            <div className='bg-brand-600 text-white p-4 flex justify-between items-center'>
              <span className='font-bold'>TechBot</span>
              <button onClick={()=>setOpen(false)}><X size={18}/></button>
            </div>
            <div className='flex-1 overflow-y-auto p-3 space-y-3'>
              {msgs.map((m,i)=>(
                <motion.div key={i}
                  initial={{opacity:0,y:10}}
                  animate={{opacity:1,y:0}}
                  transition={{duration:0.2}}
                  className={`flex ${m.role==='user'?'justify-end':''}`}
                >
                  <span className={`text-sm px-3 py-2 rounded-2xl max-w-[85%] ${m.role==='user'?'bg-brand-500 text-white':'bg-gray-100 text-gray-800'}`}>
                    {m.content}
                  </span>
                </motion.div>
              ))}
              {loading && (
                <div className='flex gap-1 pl-2'>
                  {[0,1,2].map(i=>(
                    <motion.span key={i}
                      className='w-2 h-2 bg-gray-400 rounded-full'
                      animate={{y:[0,-6,0]}}
                      transition={{duration:0.6,repeat:Infinity,delay:i*0.15}}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className='p-3 border-t flex gap-2'>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&send()}
                placeholder='Ask me anything...'
                className='flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'
              />
              <button onClick={send} className='bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600'>
                <Send size={16}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale:1.1 }}
        whileTap={{ scale:0.95 }}
        onClick={()=>setOpen(o=>!o)}
        className='w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center'
      >
        <MessageCircle size={24}/>
      </motion.button>
    </div>
  );
}