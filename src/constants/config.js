import { Platform } from 'react-native';
import Constants from 'expo-constants';

const appConfigApiUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest?.extra?.apiUrl;
const envApiUrl =
  appConfigApiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.REACT_NATIVE_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_API_BASE_URL = envApiUrl
  ? envApiUrl
  : Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

export const config = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  apiTimeout: 60000,
  splashDuration: 2500,
  onboardingSlides: 3,
  audioChunkIntervalMs: 20000,
  otpResendCooldownSec: 60,
  maxTranscriptLines: 100,
  historyLimit: 30,
};

export const ENDPOINTS = {
  health: '/',
  signupInitiate: '/auth/signup/initiate',
  signupVerify: '/auth/signup/verify',
  loginInitiate: '/auth/login/initiate',
  loginVerify: '/auth/login/verify',
  resendOtp: '/auth/resend-otp',
  logout: '/auth/logout',
  analyze: '/api/v1/analyze',
  analysisHistory: '/api/v1/analysis-history',
  spamStatus: (phone) =>
    `/api/v1/spam-status/${encodeURIComponent(phone)}`,
  spamReports: '/api/v1/spam-reports',
  scamComplaints: '/api/v1/scam-complaints',
};

export default config;
