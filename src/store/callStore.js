import { create } from 'zustand';

export const CALL_STATUS = {
  IDLE: 'idle',
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  ACTIVE: 'active',
  ENDED: 'ended',
};

export const useCallStore = create((set, get) => ({
  status: CALL_STATUS.IDLE,
  activeCall: null,
  callDuration: 0,
  isMuted: false,
  isSpeakerOn: false,
  isVideoEnabled: false,

  setStatus: (status) => set({ status }),
  setActiveCall: (activeCall) => set({ activeCall }),
  setCallDuration: (callDuration) => set({ callDuration }),
  incrementDuration: () => set({ callDuration: get().callDuration + 1 }),
  toggleMute: () => set({ isMuted: !get().isMuted }),
  toggleSpeaker: () => set({ isSpeakerOn: !get().isSpeakerOn }),
  toggleVideo: () => set({ isVideoEnabled: !get().isVideoEnabled }),
  resetCall: () =>
    set({
      status: CALL_STATUS.IDLE,
      activeCall: null,
      callDuration: 0,
      isMuted: false,
      isSpeakerOn: false,
      isVideoEnabled: false,
    }),
}));

export default useCallStore;
