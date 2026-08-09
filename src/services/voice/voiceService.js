import { api } from '../api/client';
import { Audio } from 'expo-av';

class VoiceService {
  async getVoiceToken() {
    try {
      const response = await api.getVoiceToken();
      return response.data;
    } catch (error) {
      console.warn('Failed to get voice token:', error);
      throw error;
    }
  }

  async startOutgoingCall(phoneNumber) {
    try {
      const response = await api.initiateOutgoingCall(phoneNumber);
      return response.data; // { call_id, status, phone_number }
    } catch (error) {
      console.warn('Failed to initiate outgoing call:', error);
      throw error;
    }
  }

  async setMuted(isMuted) {
    try {
      // Configure audio mode for call audio routing
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (e) {
      console.warn('Error setting mute state:', e);
    }
  }

  async setSpeaker(isSpeakerOn) {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: !isSpeakerOn,
      });
    } catch (e) {
      console.warn('Error setting speaker state:', e);
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
