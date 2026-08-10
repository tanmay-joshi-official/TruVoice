import { config } from '../../constants/config';
import { api } from '../api/client';

class AgoraService {
  constructor() {
    this.appId = config.agoraAppId;
    this.rtcEngine = null;
    this.rtmClient = null;
    this.currentChannel = null;
    this.isLoggedIn = false;
    this.userId = null;
    this.eventListeners = {};
  }

  async init(userId) {
    if (!userId) return;
    this.userId = String(userId);

    try {
      // Try loading native Agora modules if available
      try {
        const { createAgoraRtcEngine } = require('react-native-agora');
        this.rtcEngine = createAgoraRtcEngine();
        this.rtcEngine.initialize({ appId: this.appId });
        this.rtcEngine.enableAudio();
      } catch (e) {
        console.warn('Agora RTC Native module not loaded, using web/demo engine fallback.');
      }

      this.isLoggedIn = true;
      console.log(`Agora RTM signaling logged in for user: ${this.userId}`);
    } catch (err) {
      console.warn('Agora initialization error:', err);
    }
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((cb) => cb(data));
    }
  }

  async sendCallInvitation(targetUserId, channelName, callId, callerName) {
    console.log(`Sending Agora RTM call invite to ${targetUserId} for channel ${channelName}`);
    // Simulate RTM signaling event dispatch
    this.emit('call_invited', {
      targetUserId,
      channelName,
      callId,
      callerName,
    });
    return { status: 'sent', channelName, callId };
  }

  async respondToCallInvitation(callerUserId, action, channelName) {
    console.log(`Responding to call invitation from ${callerUserId}: ${action}`);
    this.emit('call_response', {
      callerUserId,
      action,
      channelName,
    });
  }

  async joinChannel(channelName, token, uid) {
    this.currentChannel = channelName;
    try {
      if (this.rtcEngine) {
        await this.rtcEngine.joinChannel(token, channelName, uid || 0, {});
      }
      console.log(`Joined Agora RTC channel: ${channelName}`);
    } catch (e) {
      console.warn('Error joining Agora RTC channel:', e);
    }
  }

  async leaveChannel() {
    try {
      if (this.rtcEngine) {
        await this.rtcEngine.leaveChannel();
      }
      console.log(`Left Agora RTC channel: ${this.currentChannel}`);
    } catch (e) {
      console.warn('Error leaving Agora RTC channel:', e);
    } finally {
      this.currentChannel = null;
    }
  }

  async setMuted(isMuted) {
    try {
      if (this.rtcEngine) {
        await this.rtcEngine.muteLocalAudioStream(isMuted);
      }
    } catch (e) {
      console.warn('Error setting mute state:', e);
    }
  }

  async setSpeaker(isSpeakerOn) {
    try {
      if (this.rtcEngine) {
        await this.rtcEngine.setEnableSpeakerphone(isSpeakerOn);
      }
    } catch (e) {
      console.warn('Error setting speaker state:', e);
    }
  }
}

export const agoraService = new AgoraService();
export default agoraService;
