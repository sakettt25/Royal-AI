import React, { useRef, useState, useEffect } from 'react';
import { Image, Paperclip } from 'lucide-react';
import { FiSend } from 'react-icons/fi';
import { REAL_NAME_MAP, VISION_MODELS, IMAGE_GENERATION_MODELS } from '../types';

interface ChatBoxProps {
  onSubmit: (prompt: string, model: string, useSearch: boolean, image?: string, files?: string[]) => void;
}

export function ChatBox({ onSubmit }: ChatBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(Object.keys(REAL_NAME_MAP)[0]);
  const [image, setImage] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const base64Files = await Promise.all(
      selectedFiles.map(file =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(`${reader.result as string}*${file.name}`);
          reader.readAsDataURL(file);
        })
      )
    );
    setFiles(base64Files);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, selectedModel, false, image, files);
      setPrompt('');
      setImage('');
      setFiles([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 rounded-xl bg-transparent md:flex-row md:items-center md:gap-4">
      {/* Model Selector */}
      <div className="relative w-full md:w-auto">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="
            w-full md:w-36 h-10 px-3 pr-8 text-sm text-white rounded appearance-none
            bg-[rgba(42,42,64,0.4)] backdrop-blur-md border border-[#444]
            shadow-[inset_4px_4px_10px_#1a1a2a,inset_-4px_-4px_10px_#262640]
            hover:shadow-[inset_-2px_-2px_6px_rgba(53,53,83,0.6),inset_2px_2px_6px_rgba(26,26,42,0.6)]
            focus:outline-none focus:ring-2 focus:ring-white transition-all
          "
        >
          {Object.entries(REAL_NAME_MAP).map(([model]) => (
            <option key={model} value={model} className="bg-[#2a2a40] text-white">
              {model}
            </option>
          ))}
        </select>
        
        {/* Dropdown Chevron Icon */}
        <svg
          className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
        placeholder="Type a message..."
        rows={1}
        className="
          flex-1 max-h-[120px] min-h-[40px] px-3 py-2 text-white text-sm resize-none
          bg-[rgba(42,42,64,0.4)] backdrop-blur-md border border-[#444] rounded
          shadow-[inset_4px_4px_10px_#1a1a2a,inset_-4px_-4px_10px_#262640]
          transition
        "
      />

      {/* File Upload and Send Button Section */}
      <div className="flex w-full md:w-auto items-center justify-between gap-2 mt-2 sm:mt-0">
        {/* Left: Image and File Upload Buttons */}
        <div className="flex gap-2">
          {!IMAGE_GENERATION_MODELS.includes(selectedModel) && (
            <>
              {VISION_MODELS.includes(selectedModel) && (
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              )}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                title="Attach image"
                className="
                  h-10 w-10 flex items-center justify-center text-white rounded
                  bg-[rgba(42,42,64,0.4)] backdrop-blur-md
                  shadow-[-5px_-5px_10px_rgba(53,53,83,0.6),5px_5px_10px_rgba(26,26,42,0.6)]
                  hover:shadow-[inset_-2px_-2px_5px_rgba(53,53,83,0.7),inset_2px_2px_4px_rgba(26,26,42,0.7)]
                  hover:text-violet-400 transition-all
                "
              >
                <Image size={18} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesChange}
                multiple
                accept=".pdf,.png,.jpg,.txt"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                className="
                  h-10 w-10 flex items-center justify-center text-white rounded
                  bg-[rgba(42,42,64,0.4)] backdrop-blur-md
                  shadow-[-5px_-5px_10px_rgba(53,53,83,0.6),5px_5px_10px_rgba(26,26,42,0.6)]
                  hover:shadow-[inset_-2px_-2px_5px_rgba(53,53,83,0.7),inset_2px_2px_4px_rgba(26,26,42,0.7)]
                  hover:text-violet-400 transition-all
                "
              >
                <Paperclip size={18} />
              </button>
            </>
          )}
        </div>

        {/* Right: Send Button */}
        <NeumorphismButton />
      </div>

      {/* Image Preview */}
      {image && VISION_MODELS.includes(selectedModel) && (
        <div className="relative mt-1">
          <img src={image} alt="Selected" className="max-h-32 rounded shadow" />
          <button
            onClick={() => setImage('')}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center bg-[#2a2a40] px-2 py-1 rounded text-xs text-white">
              <span className="mr-2">{file.split('*')[1]}</span>
              <button
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                className="text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

// Neumorphism Send Button
const NeumorphismButton = () => {
  return (
    <button
      type="submit"
      className={`
        px-4 py-2 rounded-full
        flex items-center gap-2
        text-slate-300
        bg-[rgba(42,42,64,0.4)] backdrop-blur-md
        shadow-[-5px_-5px_10px_rgba(53,53,83,0.6),5px_5px_10px_rgba(26,26,42,0.6)]
        transition-all
        hover:shadow-[inset_-2px_-2px_5px_rgba(53,53,83,0.7),inset_2px_2px_4px_rgba(26,26,42,0.7)]
        hover:text-violet-400
      `}
    >
      <FiSend size={18} />
      <span>Send</span>
    </button>
  );
};
