const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const config = {
  apiBaseUrl: API_BASE_URL,
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
