import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export function ChatMessage({ message, isTyping = false }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      className={`
        flex gap-4 p-6 mb-6 rounded-xl shadow-md border transition-all duration-300
        ${isAssistant 
          ? 'bg-gradient-to-br from-gray-800/70 to-gray-900/70 border-indigo-500/20' 
          : 'bg-gray-800/50 border-green-500/10'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isAssistant ? (
          <Bot className="w-7 h-7 text-indigo-400 hover:text-indigo-300 hover:scale-110 transition-transform" />
        ) : (
          <User className="w-7 h-7 text-green-400 hover:text-green-300 hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Label */}
        {message.model && (
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
            {isAssistant ? `Model: ${message.model}` : 'You'}
          </div>
        )}

        {/* Image or Message Content */}
        {message.isImage ? (
          <motion.img
            src={`data:image/png;base64,${message.content}`}
            alt="Generated image"
            className="max-w-full rounded-lg shadow-md hover:scale-[1.02] transition-transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="prose prose-invert prose-pre:bg-gray-900 prose-code:bg-gray-800 break-words max-w-full overflow-x-auto text-gray-200 text-base leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
