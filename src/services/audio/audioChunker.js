import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { convertToMp3, deleteAudioFile } from './mp3Converter';

class AudioChunkerService {
  constructor() {
    this.recording = null;
    this.chunkTimer = null;
    this.isChunking = false;
    this.isMuted = false;
    this.isAnalysisStopped = false;
    this.chunkIndex = 0;
    this.onChunkCallback = null;
    this.intervalMs = 20000;
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
          await deleteAudioFile(rec.getURI());
        } catch {
          // silent
        }
      }
    } else if (!this.isMuted && wasMuted && !this.isAnalysisStopped) {
      await this._startRecordingChunk();
    }
  }

  async setAnalysisStopped(stopped) {
    this.isAnalysisStopped = !!stopped;
    if (this.isAnalysisStopped && this.recording) {
      try {
        const rec = this.recording;
        this.recording = null;
        await rec.stopAndUnloadAsync();
        await deleteAudioFile(rec.getURI());
      } catch {
        // silent
      }
    } else if (!this.isAnalysisStopped && !this.isMuted) {
      await this._startRecordingChunk();
    }
  }

  async startChunking(onChunkCallback, intervalMs = 20000) {
    if (this.isChunking) return true;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission is required for voice analysis.');
    }

    this.onChunkCallback = onChunkCallback;
    this.intervalMs = intervalMs;
    this.chunkIndex = 0;
    this.isChunking = true;
    this.isMuted = false;
    this.isAnalysisStopped = false;

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
  }

  async _startRecordingChunk() {
    if (!this.isChunking || this.isMuted || this.isAnalysisStopped) {
      this.recording = null;
      return;
    }

    const { recording } = await Audio.Recording.createAsync({
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
    });

    this.recording = recording;
  }

  _scheduleNextCycle() {
    if (!this.isChunking) return;

    this.chunkTimer = setTimeout(async () => {
      if (!this.isChunking) return;

      const currentRecording = this.recording;
      this.recording = null;

      if (this.isMuted || this.isAnalysisStopped) {
        this.onChunkCallback?.({
          chunkIndex: this.chunkIndex,
          mp3Uri: null,
          isMuted: this.isMuted,
          isAnalysisStopped: this.isAnalysisStopped,
          timestamp: new Date().toISOString(),
          durationMs: this.intervalMs,
        });
        this.chunkIndex += 1;

        if (currentRecording) {
          try {
            await currentRecording.stopAndUnloadAsync();
            await deleteAudioFile(currentRecording.getURI());
          } catch {
            // silent
          }
        }

        this._scheduleNextCycle();
        return;
      }

      if (currentRecording) {
        await this._processAndEmitChunk(currentRecording, this.chunkIndex);
        this.chunkIndex += 1;
      }

      if (this.isChunking) {
        await this._startRecordingChunk();
        this._scheduleNextCycle();
      }
    }, this.intervalMs);
  }

  async _processAndEmitChunk(recordingInstance, index) {
    let sourceUri = null;
    let mp3Uri = null;

    try {
      const status = await recordingInstance.getStatusAsync();
      if (status.canRecord && status.isRecording) {
        await recordingInstance.stopAndUnloadAsync();
      }

      sourceUri = recordingInstance.getURI();
      if (!sourceUri) return;

      mp3Uri = await convertToMp3(sourceUri);

      this.onChunkCallback?.({
        chunkIndex: index,
        mp3Uri,
        mimeType: 'audio/mpeg',
        fileName: `truvoice_chunk_${index}.mp3`,
        isMuted: false,
        isAnalysisStopped: false,
        timestamp: new Date().toISOString(),
        durationMs: this.intervalMs,
      });
    } catch (error) {
      console.error(`Error processing MP3 chunk #${index}:`, error);
      this.onChunkCallback?.({
        chunkIndex: index,
        error: error.message,
        mp3Uri: null,
      });
    } finally {
      await deleteAudioFile(sourceUri);
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
        const status = await rec.getStatusAsync();
        if (status.canRecord && status.isRecording) {
          await rec.stopAndUnloadAsync();
        }
        await deleteAudioFile(rec.getURI());
      } catch {
        // silent
      }
    }

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
      // silent
    }
  }
}

export const audioChunker = new AudioChunkerService();
export default audioChunker;
