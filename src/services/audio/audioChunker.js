import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

class AudioChunkerService {
  constructor() {
    this.recording = null;
    this.chunkTimer = null;
    this.isChunking = false;
    this.isMuted = false;
    this.isAnalysisStopped = false;
    this.chunkIndex = 0;
    this.onChunkCallback = null;
    this.intervalMs = 20000; // 20 second chunks for backend AI analysis
  }

  async requestPermissions() {
    try {
      const response = await Audio.requestPermissionsAsync();
      return response.granted;
    } catch (error) {
      console.warn('Audio permission error:', error);
      return false;
    }
  }

  /**
   * Mute/unmute mic — completely releases or re-acquires hardware
   */
  async setMuted(muted) {
    const wasMuted = this.isMuted;
    this.isMuted = !!muted;
    if (!this.isChunking) return;

    if (this.isMuted && !wasMuted) {
      if (this.recording) {
        try {
          const rec = this.recording;
          this.recording = null;
          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (e) { /* silent */ }
      }
    } else if (!this.isMuted && wasMuted && !this.isAnalysisStopped) {
      await this._startRecordingChunk();
    }
  }

  /**
   * Stop or resume AI analysis (user toggle for sensitive calls)
   */
  async setAnalysisStopped(stopped) {
    this.isAnalysisStopped = !!stopped;
    if (this.isAnalysisStopped) {
      // Stop current recording chunk immediately
      if (this.recording) {
        try {
          const rec = this.recording;
          this.recording = null;
          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (e) { /* silent */ }
      }
    } else if (!this.isMuted) {
      // Resume recording
      await this._startRecordingChunk();
    }
  }

  /**
   * Start 20-second audio chunking cycle
   */
  async startChunking(onChunkCallback, intervalMs = 20000) {
    if (this.isChunking) return true;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Cannot start audio chunker: Mic permission not granted.');
      return false;
    }

    this.onChunkCallback = onChunkCallback;
    this.intervalMs = intervalMs;
    this.chunkIndex = 0;
    this.isChunking = true;
    this.isMuted = false;
    this.isAnalysisStopped = false;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await this._startRecordingChunk();
      this._scheduleNextCycle();
      return true;
    } catch (error) {
      console.error('Failed to start audio chunker:', error);
      await this.stopChunking();
      return false;
    }
  }

  /**
   * Record as AAC/.m4a — backend will receive high quality audio for AI analysis
   */
  async _startRecordingChunk() {
    if (!this.isChunking || this.isMuted || this.isAnalysisStopped) {
      this.recording = null;
      return;
    }

    try {
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
    } catch (error) {
      console.error('Error starting recording chunk:', error);
    }
  }

  _scheduleNextCycle() {
    if (!this.isChunking) return;

    this.chunkTimer = setTimeout(async () => {
      if (!this.isChunking) return;

      const currentRecording = this.recording;
      this.recording = null;

      if (this.isMuted || this.isAnalysisStopped) {
        // Silent cycle
        if (this.onChunkCallback) {
          this.onChunkCallback({
            chunkIndex: this.chunkIndex,
            fileUri: null,
            base64Data: null,
            isMuted: this.isMuted,
            isAnalysisStopped: this.isAnalysisStopped,
            timestamp: new Date().toISOString(),
            durationMs: this.intervalMs,
          });
        }
        this.chunkIndex += 1;

        // Discard any lingering recording
        if (currentRecording) {
          try {
            await currentRecording.stopAndUnloadAsync();
            const uri = currentRecording.getURI();
            if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (e) { /* silent */ }
        }

        this._scheduleNextCycle();
      } else {
        // Active cycle: stop previous, emit, start next
        if (currentRecording) {
          await this._processAndEmitChunk(currentRecording, this.chunkIndex);
          this.chunkIndex += 1;
        }

        if (this.isChunking) {
          await this._startRecordingChunk();
          this._scheduleNextCycle();
        }
      }
    }, this.intervalMs);
  }

  /**
   * Stop recording, read file as Base64 for socket/HTTP upload, emit callback, cleanup
   */
  async _processAndEmitChunk(recordingInstance, index) {
    try {
      let isRecordingActive = false;
      try {
        const status = await recordingInstance.getStatusAsync();
        isRecordingActive = status.canRecord && status.isRecording;
      } catch (e) {
        isRecordingActive = true;
      }

      if (isRecordingActive) {
        await recordingInstance.stopAndUnloadAsync();
      }

      const uri = recordingInstance.getURI();

      if (uri) {
        // Read file as Base64 for transmission
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });

        if (this.onChunkCallback) {
          this.onChunkCallback({
            chunkIndex: index,
            fileUri: uri,
            base64Data,
            isMuted: false,
            isAnalysisStopped: false,
            timestamp: new Date().toISOString(),
            durationMs: this.intervalMs,
            mimeType: 'audio/mp4', // .m4a with AAC encoding
          });
        }

        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error(`Error processing chunk #${index}:`, error);
    }
  }

  async stopChunking() {
    this.isChunking = false;

    if (this.chunkTimer) {
      clearTimeout(this.chunkTimer);
      this.chunkTimer = null;
    }

    if (this.recording) {
      try {
        const rec = this.recording;
        this.recording = null;
        let isRecordingActive = false;
        try {
          const status = await rec.getStatusAsync();
          isRecordingActive = status.canRecord && status.isRecording;
        } catch (e) { isRecordingActive = true; }
        if (isRecordingActive) await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) { /* silent */ }
    }

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (e) { /* silent */ }
  }
}

export const audioChunker = new AudioChunkerService();
export default audioChunker;
