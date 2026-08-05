import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

class AudioChunkerService {
  constructor() {
    this.recording = null;
    this.chunkTimer = null;
    this.isChunking = false;
    this.isMuted = false;
    this.chunkIndex = 0;
    this.onChunkCallback = null;
    this.intervalMs = 5000;
  }

  /**
   * Request mic permissions and prepare audio session for active VoIP recording
   */
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
   * Set Mic Mute state dynamically
   */
  async setMuted(muted) {
    const wasMuted = this.isMuted;
    this.isMuted = !!muted;

    if (!this.isChunking) return;

    if (this.isMuted && !wasMuted) {
      // User just muted: stop and discard current recording immediately
      if (this.recording) {
        try {
          const rec = this.recording;
          this.recording = null;
          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          if (uri) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        } catch (e) {
          // Silent catch
        }
      }
    } else if (!this.isMuted && wasMuted) {
      // User just unmuted: start a fresh recording chunk immediately
      await this._startRecordingChunk();
    }
  }

  /**
   * Start 5-second audio chunking cycle
   */
  async startChunking(onChunkCallback, intervalMs = 5000) {
    if (this.isChunking) {
      console.log('Audio chunker is already running.');
      return true;
    }

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
   * Internal method to create and start a single recording instance (only if NOT muted)
   */
  async _startRecordingChunk() {
    if (!this.isChunking || this.isMuted) {
      this.recording = null;
      return;
    }
    
    try {
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
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

  /**
   * Sequential loop: Process/emit finished chunk and schedule the next
   */
  _scheduleNextCycle() {
    if (!this.isChunking) return;

    this.chunkTimer = setTimeout(async () => {
      if (!this.isChunking) return;

      const currentRecording = this.recording;
      this.recording = null;

      if (this.isMuted) {
        // Muted cycle: emit silent/empty chunk info directly without touching hardware
        if (this.onChunkCallback) {
          this.onChunkCallback({
            chunkIndex: this.chunkIndex,
            base64Data: null,
            isMuted: true,
            timestamp: new Date().toISOString(),
            durationMs: this.intervalMs,
          });
        }
        this.chunkIndex += 1;

        // Continue muted cycle
        this._scheduleNextCycle();
      } else {
        // Active cycle: stop previous recording, then start new recording chunk
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
   * Stop recording the completed chunk, read as Base64, emit callback, and delete file
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
        let base64Data = null;
        if (!this.isMuted) {
          base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
        }

        if (this.onChunkCallback) {
          this.onChunkCallback({
            chunkIndex: index,
            base64Data,
            isMuted: this.isMuted,
            timestamp: new Date().toISOString(),
            durationMs: this.intervalMs,
            fileUri: uri,
          });
        }

        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error(`Error processing chunk #${index}:`, error);
    }
  }

  /**
   * Stop the chunking engine and release mic resources
   */
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
        } catch (e) {
          isRecordingActive = true;
        }

        if (isRecordingActive) {
          await rec.stopAndUnloadAsync();
        }
        
        const uri = rec.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (e) {
        // Ignore
      }
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (e) {
      // Ignore
    }
  }
}

export const audioChunker = new AudioChunkerService();
export default audioChunker;
