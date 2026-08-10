import axios from 'axios';
import { config, ENDPOINTS } from '../../constants/config';
import { getApiErrorMessage } from '../../utils/apiError';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(getApiErrorMessage(error))),
);

export const api = {
  healthCheck: () => apiClient.get(ENDPOINTS.health),

  signupInitiate: (payload) =>
    apiClient.post(ENDPOINTS.signupInitiate, payload),

  signupVerify: (payload) =>
    apiClient.post(ENDPOINTS.signupVerify, payload),

  loginInitiate: (payload) =>
    apiClient.post(ENDPOINTS.loginInitiate, payload),

  loginVerify: (payload) =>
    apiClient.post(ENDPOINTS.loginVerify, payload),

  resendOtp: (payload) =>
    apiClient.post(ENDPOINTS.resendOtp, payload),

  logout: () => apiClient.post(ENDPOINTS.logout),

  analyzeAudio: (fileUri, callerNumber) => {
    if (!fileUri) {
      return Promise.reject(new Error('Audio file is missing.'));
    }

    const isMp3 = /\.mp3($|\?)/i.test(fileUri) || /truvoice_.*\.mp3/i.test(fileUri);
    if (!isMp3) {
      return Promise.reject(
        new Error('Invalid audio format. Only MP3 files are accepted for analysis.'),
      );
    }

    if (!callerNumber || !String(callerNumber).trim()) {
      return Promise.reject(new Error('Caller number is required for analysis.'));
    }

    const fileName = /[^/\\]+\.mp3$/i.exec(fileUri)?.[0] || `truvoice_chunk_${Date.now()}.mp3`;

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'audio/mpeg',
      name: fileName,
    });
    formData.append('caller_number', String(callerNumber).trim());

    return apiClient.post(ENDPOINTS.analyze, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  getAnalysisHistory: () => apiClient.get(ENDPOINTS.analysisHistory),

  getSpamStatus: (phoneNumber) =>
    apiClient.get(ENDPOINTS.spamStatus(phoneNumber)),

  reportSpam: (phoneNumber) =>
    apiClient.post(ENDPOINTS.spamReports, { phone_number: phoneNumber }),

  submitScamComplaint: (phoneNumber, description) =>
    apiClient.post(ENDPOINTS.scamComplaints, {
      phone_number: phoneNumber,
      description,
    }),

  // Agora Voice Calling API
  getAgoraToken: (channelName) =>
    apiClient.post(ENDPOINTS.voiceToken, { channelName }),

  logCall: (channelName, targetUserId) =>
    apiClient.post(ENDPOINTS.voiceLogCall, { channelName, targetUserId }),

  updateCallStatus: (callId, status, duration = 0) =>
    apiClient.post(ENDPOINTS.voiceUpdateCall, { call_id: callId, status, duration }),

  getAppUsers: () => apiClient.get(ENDPOINTS.voiceUsers),

  getVoiceCalls: () => apiClient.get(ENDPOINTS.voiceCalls),

  getPendingCall: () => apiClient.get(ENDPOINTS.voicePendingCall),

  getVoiceCallDetail: (callId) => apiClient.get(ENDPOINTS.voiceCallDetail(callId)),
};




export default apiClient;
