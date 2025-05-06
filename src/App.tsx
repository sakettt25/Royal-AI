import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import axios from 'axios';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';
import { ChatMessage } from './components/ChatMessage';
import { Header } from './components/Header';
import { Toaster, toast } from 'react-hot-toast';
import { saveConversations, loadConversations } from './db';
import type { Conversation, Message, ApiRequest } from './types';
import { BACKEND_URL, REAL_NAME_MAP, MODEL_PROVIDER_MAP } from './types';

const starTextStyle = `
  .hoverText {
    display: inline-block;
    transition: 0.35s font-weight, 0.35s color;
    cursor: default;
  }

  .hoverText:hover {
    font-weight: 900;
    color: rgb(238, 242, 255);
  }

  .hoverText:hover + .hoverText {
    font-weight: 500;
    color: rgb(199, 210, 254);
  }

  .hoverText:hover + .hoverText + .hoverText {
    font-weight: 300;
  }

  .hoverText:has(+ .hoverText:hover) {
    font-weight: 500;
    color: rgb(199, 210, 254);
  }

  .hoverText:has(+ .hoverText + .hoverText:hover) {
    font-weight: 300;
  }
`;

const Starfield = () => {
  const meshRef = useRef<THREE.Points>(null);
  const { size } = useThree();

  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    return geometry;
  }, []);

  const direction = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      direction.current.x = (e.clientX / size.width - 0.5) * 2;
      direction.current.y = -(e.clientY / size.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [size]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001 + direction.current.x * 0.005;
      meshRef.current.rotation.x += 0.001 + direction.current.y * 0.005;
    }
  });

  return (
    <points ref={meshRef} geometry={starsGeometry}>
      <pointsMaterial color="white" size={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
};

function simplifyConversation(conversation: Conversation) {
  return conversation.messages
    .filter(msg => !msg.isImage && msg.content.trim() !== '')
    .map(({ role, content }) => ({ role, content }));
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await loadConversations();
        if (data?.length) {
          setConversations(data);
          setActiveConversation(data[0].id);
        } else {
          createNewConversation(true);
        }
      } catch (err) {
        console.error('IndexedDB load error:', err);
        createNewConversation(true);
      }

      try {
        await axios.get(BACKEND_URL);
      } catch (error) {
        console.error('Backend connection error:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const nonEmpty = conversations.filter(c => c.messages.length > 0);
    saveConversations(nonEmpty).catch(console.error);
  }, [conversations]);

  const createNewConversation = (fromInit = false) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    setIsChatStarted(false);
    if (!fromInit && window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(conv => conv.id !== id);
    setConversations(updated);
    if (activeConversation === id) {
      setActiveConversation(updated[0]?.id || null);
      if (!updated.length) createNewConversation();
    }
  };

  const getCurrentConversation = () =>
    conversations.find(conv => conv.id === activeConversation);

  const handleSubmit = async (
    prompt: string,
    model: string,
    useSearch: boolean,
    image?: string,
    files?: string[]
  ) => {
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      model: model
    };

    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversation ? {
        ...conv,
        messages: [...conv.messages, userMessage],
        title: conv.messages.length === 0 ? prompt.slice(0, 30) : conv.title
      } : conv
    );

    setConversations(updatedConversations);

    try {
      const currentConv = updatedConversations.find(c => c.id === activeConversation);
      if (!currentConv) return;

      const apiRequest: ApiRequest = {
        model: REAL_NAME_MAP[model as keyof typeof REAL_NAME_MAP],
        provider: MODEL_PROVIDER_MAP[model as keyof typeof MODEL_PROVIDER_MAP],
        use_search: useSearch,
        image_base64: image?.split(',')[1] || '',
        file_base64: files?.map(file => file.split(',')[1]) || [],
        messages: simplifyConversation(currentConv)
      };

      const loadingToast = toast.loading('Generating Response...');
      const response = await axios.post(`${BACKEND_URL}g4f`, apiRequest);
      toast.dismiss(loadingToast);

      if (response.data.message || response.data.image_base64) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message || response.data.image_base64,
          model: model,
          isImage: !!response.data.image_base64
        };

        setConversations(convs => convs.map(conv =>
          conv.id === activeConversation ? 
            { ...conv, messages: [...conv.messages, assistantMessage] } : conv
        ));
        toast.success('Response received');
      }
    } catch (error) {
      toast.error('Failed to get response');
      console.error('API Error:', error);
    }

    setIsChatStarted(true);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white">
      <div className="fixed inset-0 z-0 h-full w-full">
        <Canvas>
          <color attach="background" args={['black']} />
          <Starfield />
        </Canvas>
      </div>

      <Toaster position="top-right" />

      <div className="flex h-full relative z-10">
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          isOpen={isSidebarOpen}
          setSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 flex flex-col relative min-w-0 bg-transparent">
          <Header onMenuClick={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />

          {!isChatStarted && (
            <div className="flex justify-center items-center h-full text-xl text-gray-300">
              <BubbleText />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-600">
            {getCurrentConversation()?.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
          <div className="p-4 bg-black/70">
            <ChatBox onSubmit={handleSubmit} />
          </div>
        </div>
      </div>

      {/* Bubble animation styles */}
      <style>{starTextStyle}</style>
    </div>
  );
}

const BubbleText = () => {
  return (
    <h2 className="text-center text-5xl font-thin text-indigo-300">
      {"What can I help with ?"
        .split("")
        .map((char, idx) => (
          <span className="hoverText" key={idx}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
    </h2>
  );
};

export default App;
