import { api } from '../api/client';
import { mapAnalysisResponse } from '../../utils/analysisMapper';

const assertMp3Uri = (uri) => {
  if (!uri) throw new Error('Audio file URI is missing.');
  const str = String(uri);
  const isMp3 =
    /\.mp3($|\?)/i.test(str) || /truvoice_.*\.mp3/i.test(str);
  if (!isMp3) {
    throw new Error('Invalid audio format. Only MP3 files are accepted for analysis.');
  }
};

export const analysisService = {
  analyzeChunk: async (mp3Uri, callerNumber) => {
    assertMp3Uri(mp3Uri);
    if (!callerNumber || !String(callerNumber).trim()) {
      throw new Error('Caller number is required for AI analysis.');
    }
    const response = await api.analyzeAudio(mp3Uri, callerNumber);
    return mapAnalysisResponse(response.data);
  },

  fetchHistory: async () => {
    const response = await api.getAnalysisHistory();
    return response.data?.items || [];
  },

  checkSpamStatus: async (phoneNumber) => {
    const response = await api.getSpamStatus(phoneNumber);
    return response.data;
  },

  reportSpam: async (phoneNumber) => {
    const response = await api.reportSpam(phoneNumber);
    return response.data;
  },

  submitScamComplaint: async (phoneNumber, description) => {
    const response = await api.submitScamComplaint(phoneNumber, description);
    return response.data;
  },
};

export default analysisService;
