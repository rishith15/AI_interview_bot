// Configuration for AI Interview Bot
export const CONFIG = {
  // Local AI Model Configuration
  localModel: {
    name: 'Xenova/flan-t5-small', // Smaller, faster model (~80MB)
    maxTokens: 100,
    temperature: 0.7,
    cacheModel: true // Cache model for offline use
  },

  // Speech Recognition Settings
  speechRecognition: {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
  },

  // Text-to-Speech Settings
  tts: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: null, // Will be set to preferred voice
    lang: 'en-US'
  },

  // Avatar Settings
  avatar: {
    idleAnimationSpeed: 2000, // ms
    talkingAnimationSpeed: 150, // ms per phoneme
    enableLipSync: true,
    expressions: {
      idle: 'neutral',
      listening: 'attentive',
      thinking: 'contemplative',
      speaking: 'friendly'
    }
  },

  // Audio Settings
  audio: {
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },

  // Conversation Settings
  conversation: {
    maxHistoryLength: 10, // Keep last 10 exchanges
    systemPrompt: `You are a professional job interviewer. Ask clear questions about the candidate's experience and skills. Keep responses brief and professional.`,
    interviewContext: 'software engineering position',
    interviewTypes: {
      technical: 'Focus on technical skills, coding experience, and problem-solving abilities.',
      behavioral: 'Focus on past experiences, teamwork, and soft skills.',
      general: 'Mix of technical and behavioral questions.'
    }
  },

  // UI Settings
  ui: {
    showTranscript: true,
    showDebugInfo: false,
    theme: 'dark',
    animationDuration: 300 // ms
  }
};
