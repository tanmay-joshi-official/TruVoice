import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';
import { audioChunker } from '../../services/audio/audioChunker';
import { socketService } from '../../services/socket/socketService';
import { useAiDetectionStore } from '../../store/aiDetectionStore';

function ActiveWaveBar({ delay, heightMult = 1 }) {
  const height = useSharedValue(6);

  useEffect(() => {
    height.value = withRepeat(
      withSequence(
        withTiming(28 * heightMult, { duration: 350 }),
        withTiming(4, { duration: 350 }),
      ),
      -1,
      true,
    );
  }, [heightMult, height]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.waveBar, animStyle]} />;
}

export default function ActiveCallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const contact = route.params?.contact || {
    name: 'Unknown Caller',
    number: '+1 415 220',
    initials: 'UC',
  };

  const [seconds, setSeconds] = useState(185); // 03:05
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Analyzing');
  const [chunkCount, setChunkCount] = useState(0);

  const { authenticityScore, aiProbability, confidence, updateAnalysis, addTranscriptLine } =
    useAiDetectionStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Audio Chunker Service & WebSocket
  useEffect(() => {
    let socket;
    try {
      socket = socketService.getVoiceAnalysisSocket();
      socket.on('ai_analysis_update', (data) => {
        if (data) {
          updateAnalysis(data);
        }
      });
      socket.on('transcript_chunk', (line) => {
        if (line) {
          addTranscriptLine(line);
        }
      });
    } catch (e) {
      console.log('Socket connect fallback:', e);
    }

    // Start 5-second mic chunking
    audioChunker.startChunking((chunkData) => {
      setChunkCount((prev) => prev + 1);

      // Emit chunk payload over WebSocket if connected
      if (socket && socket.connected) {
        socket.emit('audio_chunk', {
          callId: 'call_' + Date.now(),
          chunkIndex: chunkData.chunkIndex,
          audioBase64: chunkData.base64Data,
          isMuted: chunkData.isMuted,
          timestamp: chunkData.timestamp,
        });
      } else {
        // Fallback live simulation metrics for chunk processing
        if (!chunkData.isMuted) {
          const simulatedScore = Math.max(15, 62 - (chunkData.chunkIndex % 5) * 3);
          const simulatedAiProb = Math.min(88, 38 + (chunkData.chunkIndex % 5) * 4);

          updateAnalysis({
            authenticityScore: simulatedScore,
            aiProbability: simulatedAiProb,
            confidence: 84,
            riskLevel: simulatedAiProb > 50 ? 'high' : 'low',
          });
        }
      }
    });

    return () => {
      audioChunker.stopChunking();
      if (socket) {
        socket.off('ai_analysis_update');
        socket.off('transcript_chunk');
      }
    };
  }, [updateAnalysis, addTranscriptLine]);

  const handleToggleMute = () => {
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    audioChunker.setMuted(nextMuteState);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainderSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    audioChunker.stopChunking();
    navigation.replace(ROUTES.CALL_SUMMARY, { contact });
  };

  const barMultipliers = [0.4, 0.8, 1.2, 0.6, 1.5, 0.9, 1.8, 1.0, 1.4, 0.7, 1.1, 0.5, 1.3, 0.8, 0.6];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatar}>
              <Text style={styles.avatarText}>{contact.initials || 'UC'}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.callerName}>{contact.name || 'Unknown Caller'}</Text>
              <Text style={styles.callerSub}>{contact.number || '+1 415 220'} · Encrypted</Text>
            </View>
          </View>
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 110, 120) },
          ]}
        >
          {/* Radial Authenticity Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeCircle}>
              <Text style={styles.gaugeLabel}>AUTHENTICITY</Text>
              <Text style={styles.gaugeValue}>{authenticityScore || 62}%</Text>
              <Text style={styles.gaugeSub}>{isMuted ? 'Mic Muted' : 'Analyzing'}</Text>
            </View>
          </View>

          {/* Live Spectrum Waveform */}
          <View style={styles.waveformRow}>
            {barMultipliers.map((mult, idx) => (
              <ActiveWaveBar key={idx} delay={idx * 50} heightMult={isMuted ? 0.2 : mult} />
            ))}
          </View>
          <Text style={styles.chunkText}>
            {isMuted
              ? 'Microphone is muted'
              : `Processing 5s chunk ${chunkCount > 0 ? `#${chunkCount}` : '...'}`}
          </Text>

          {/* Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>AI PROBABILITY</Text>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{aiProbability || 38}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${aiProbability || 38}%`, backgroundColor: '#3B82F6' }]} />
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>CONFIDENCE</Text>
              <Text style={styles.metricValue}>{confidence || 54}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${confidence || 54}%`, backgroundColor: '#FFFFFF' }]} />
              </View>
            </View>
          </View>

          {/* Live Transcript Section */}
          <View style={styles.transcriptHeader}>
            <Text style={styles.sectionTitle}>Live transcript</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.autoText}>Auto</Text>
            </TouchableOpacity>
          </View>

          {/* Status Filter Row */}
          <View style={styles.filterRow}>
            {['Analyzing', 'Likely Human', 'Potential AI', 'AI Detected'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Transcript Lines */}
          <View style={styles.transcriptCard}>
            <View style={styles.transcriptItem}>
              <Text style={styles.tsTime}>00:04</Text>
              <View style={styles.tsBody}>
                <Text style={styles.tsSpeakerCaller}>Caller</Text>
                <Text style={styles.tsText}>
                  Good morning, I&apos;m calling from the fraud department.
                </Text>
              </View>
            </View>

            <View style={styles.transcriptItem}>
              <Text style={styles.tsTime}>00:11</Text>
              <View style={styles.tsBody}>
                <Text style={styles.tsSpeakerYou}>You</Text>
                <Text style={styles.tsText}>Which bank is this exactly?</Text>
              </View>
            </View>

            <View style={styles.transcriptItem}>
              <Text style={styles.tsTime}>00:18</Text>
              <View style={styles.tsBody}>
                <Text style={styles.tsSpeakerCaller}>Caller</Text>
                <Text style={styles.tsText}>
                  Your account has been flagged. I need to verify a code sent to you.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Call Action Bar */}
        <View
          style={[
            styles.actionBar,
            { bottom: Math.max(insets.bottom + 10, 20) },
          ]}
        >
          <TouchableOpacity
            onPress={handleToggleMute}
            style={[styles.actionBtn, isMuted && styles.actionBtnActive]}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={20} color={isMuted ? '#EF4444' : '#FFFFFF'} />
            <Text style={[styles.actionBtnLabel, isMuted && { color: '#EF4444' }]}>
              {isMuted ? 'Muted' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSpeaker(!isSpeaker)}
            style={[styles.actionBtn, isSpeaker && styles.actionBtnActive]}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium-outline'} size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnLabel}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnLabel}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEndCall} style={styles.endBtn}>
            <Ionicons name="call-sharp" size={24} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={styles.endBtnLabel}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  callerSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 10,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  gaugeCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: '#3B82F6',
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  gaugeValue: {
    color: '#3B82F6',
    fontSize: 44,
    fontWeight: '800',
    marginVertical: 2,
  },
  gaugeSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
    marginTop: 14,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  chunkText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  autoText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#18181B',
  },
  filterPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  transcriptCard: {
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  transcriptItem: {
    flexDirection: 'row',
  },
  tsTime: {
    color: colors.textMuted,
    fontSize: 12,
    width: 44,
  },
  tsBody: {
    flex: 1,
  },
  tsSpeakerCaller: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tsSpeakerYou: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  tsText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(19, 19, 22, 0.95)',
    borderRadius: 30,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtn: {
    alignItems: 'center',
    width: 60,
  },
  actionBtnActive: {
    opacity: 0.8,
  },
  actionBtnLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  endBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EF4444',
  },
  endBtnLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
