import { config, ENDPOINTS } from '../../constants/config';
import { api } from '../api/client';
import { useCallStore } from '../../store/callStore';

class AgoraService {
  constructor() {
    this.appId = config.agoraAppId;
    this.rtcEngine = null;
    this.rtmClient = null;
    this.currentChannel = null;
    this.isLoggedIn = false;
    this.userId = null;
    this.eventListeners = {};
    this.ws = null;
    this.pollerInterval = null;
    this.pingInterval = null;
    this.authToken = null;
  }

  async init(userId, authToken) {
    if (!userId) return;
    this.userId = String(userId);
    if (authToken) this.authToken = authToken;

    try {
      // Try loading native Agora RTC modules if available
      try {
        const { createAgoraRtcEngine } = require('react-native-agora');
        this.rtcEngine = createAgoraRtcEngine();
        this.rtcEngine.initialize({ appId: this.appId });
        this.rtcEngine.enableAudio();
      } catch (e) {
        console.warn('Agora RTC Native module not loaded, using web/demo engine fallback.');
      }

      this.isLoggedIn = true;
      console.log(`Agora service initialized for user: ${this.userId}`);

      // Start real-time WebSocket signaling connection & poller
      if (this.authToken) {
        this.connectSignaling(this.authToken);
      }
      this.startPendingCallPoller();
    } catch (err) {
      console.warn('Agora initialization error:', err);
    }
  }

  connectSignaling(token) {
    if (!token) return;
    this.authToken = token;

    try {
      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
      }

      const wsUrl = ENDPOINTS.wsSignaling(token);
      console.log('Connecting to user call signaling WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('User call signaling WebSocket connected.');
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const msg = JSON.parse(event.data);
          console.log('Signaling message received:', msg);

          if (msg.type === 'incoming_call') {
            useCallStore.getState().setIncomingCall({
              callId: msg.callId,
              channelName: msg.channelName,
              callerUserId: msg.callerUserId,
              callerName: msg.callerName || 'Incoming Caller',
            });
          } else if (msg.type === 'call_response') {
            this.emit('call_response', {
              callId: msg.callId,
              action: msg.action,
              channelName: msg.channelName,
            });
          }
        } catch (e) {
          console.warn('Error parsing signaling message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('User signaling WebSocket closed. Reconnecting in 5s...');
        if (this.pingInterval) clearInterval(this.pingInterval);
        setTimeout(() => {
          if (this.authToken && this.isLoggedIn) {
            this.connectSignaling(this.authToken);
          }
        }, 5000);
      };

      this.ws.onerror = (err) => {
        console.warn('User signaling WebSocket error:', err.message);
      };
    } catch (e) {
      console.warn('Failed to establish user signaling WebSocket:', e);
    }
  }

  startPendingCallPoller() {
    if (this.pollerInterval) clearInterval(this.pollerInterval);
    this.pollerInterval = setInterval(async () => {
      try {
        if (!this.isLoggedIn) return;
        const state = useCallStore.getState();
        if (state.incomingCall || state.status === 'active') return;

        const res = await api.getPendingCall();
        if (res.data?.has_pending) {
          const { callId, channelName, callerUserId, callerName } = res.data;
          console.log('Pending call detected via poller:', res.data);
          useCallStore.getState().setIncomingCall({
            callId,
            channelName,
            callerUserId,
            callerName: callerName || 'Incoming Caller',
          });
        }
      } catch (e) {
        // Silent poller catch
      }
    }, 4000);
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
    console.log(`Sending call invite to ${targetUserId} for channel ${channelName}`);
    // api.logCall automatically dispatches real-time WebSocket invite to target user
    return { status: 'sent', channelName, callId };
  }

  async respondToCallInvitation(callerUserId, action, channelName, callId) {
    console.log(`Responding to call invitation: ${action}`);
    if (callId) {
      await api.updateCallStatus(callId, action);
    }
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

  cleanup() {
    if (this.pollerInterval) clearInterval(this.pollerInterval);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
  }
}

export const agoraService = new AgoraService();
export default agoraService;
