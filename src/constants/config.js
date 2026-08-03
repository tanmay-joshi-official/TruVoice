const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000';

export const config = {
  apiBaseUrl: API_BASE_URL,
  wsBaseUrl: WS_BASE_URL,
  apiTimeout: 15000,
  splashDuration: 2500,
  onboardingSlides: 3,
  callAnalysisInterval: 5000,
  maxTranscriptLines: 100,
};

export const ENDPOINTS = {
  login: '/login',
  register: '/register',
  contacts: '/contacts',
  history: '/history',
  profile: '/profile',
  notifications: '/notifications',
};

export const WS_CHANNELS = {
  call: '/call',
  voiceAnalysis: '/voice-analysis',
};

export default config;
