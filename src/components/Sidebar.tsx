import { MessageCircle, Plus, Trash2, X } from 'lucide-react';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  setSidebarOpen
}: SidebarProps) {
  const handleNewChat = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    onNewConversation();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string, e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    onSelectConversation(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string, e: React.PointerEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Sidebar Background Overlay */}
      {isOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:relative h-screen flex flex-col overflow-hidden z-50 transition-all duration-500 ease-in-out
          ${isOpen ? 'w-full md:w-80 lg:w-96' : 'w-0'} 
          bg-gradient-to-b from-gray-900/90 to-gray-800/80 border-r border-gray-700`}
      >
        {/* Close Button for mobile */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-400 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onPointerDown={handleNewChat}
          className="flex items-center gap-3 mx-4 my-2 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-white text-lg font-semibold transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
        >
          <Plus size={20} />
          New Chat
        </button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto pb-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-4 cursor-pointer rounded-lg transition-all duration-300 ease-in-out
                hover:bg-gray-700 ${activeConversation === conv.id ? 'bg-gray-600' : ''}`}
              onPointerDown={(e) => handleSelectConversation(conv.id, e)}
            >
              <div className="flex items-center gap-3 text-gray-300 flex-1 min-w-0">
                <MessageCircle size={20} />
                <span className="truncate text-base">{conv.title}</span>
              </div>
              <button
                onPointerDown={(e) => handleDeleteConversation(conv.id, e)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-all duration-300 ease-in-out"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
