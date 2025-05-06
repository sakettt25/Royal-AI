export const BACKEND_URL='https://royal-ai-backend.onrender.com/';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  isImage?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ApiRequest {
  prompt?: string;
  model: string;
  provider: string;
  use_search: boolean;
  image_base64: string;
  file_base64: string[];
  messages?: { role: 'user' | 'assistant'; content: string }[];
}

export const REAL_NAME_MAP = {
  'GPT 4o': 'gpt-4o',
  'Deepseek R1': 'deepseek-r1',

 // 'Gemini 2.5 Flash': 'gemini',
  'Llama 4': 'llamascout',
  'Dall-E-3': 'dall-e-3',
  'Flux': 'flux',
}

export const MODEL_PROVIDER_MAP = {
  'GPT 4o': 'PollinationsAI',
  'Deepseek R1': 'PollinationsAI',
  //'Gemini 2.5 Flash': 'PollinationsAI',
  'Llama 4': 'PollinationsAI',
}

export const ICON_MAP: Record<string, string> = {
  'GPT 4o': " : For Text Generation",
  'Deepseek R1': " : For Text Generation",
  //'Gemini 2.5 Flash': " : For Text Generation",
  'Llama 4': " : For Text Generation",
  'Dall-E-3': " : For Image Generation",
  'Flux': " : For Image Generation",
}

export const VISION_MODELS = [ 'Gemini 2.5 Flash', 'GPT 4o'];
export const IMAGE_GENERATION_MODELS = ['Flux', 'Dall-E-3'];