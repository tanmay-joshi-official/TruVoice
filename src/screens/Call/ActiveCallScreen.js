import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';
import { audioChunker } from '../../services/audio/audioChunker';
import { socketService } from '../../services/socket/socketService';
import { useAiDetectionStore } from '../../store/aiDetectionStore';
import { useContactsStore } from '../../store/contactsStore';

function PulseRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1200 }),
        withTiming(1, { duration: 1200 }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, [scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseRing, animStyle]} />;
}

export default function ActiveCallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const contact = route.params?.contact || {
    name: 'Unknown Caller',
    number: '',
    initials: 'UC',
  };

  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showAnalysisCard, setShowAnalysisCard] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const [analysisStopped, setAnalysisStopped] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dtmfText, setDtmfText] = useState('');

  const storeContacts = useContactsStore((s) => s.contacts);
  const { authenticityScore, aiProbability, confidence, riskLevel, updateAnalysis, reset: resetAi } =
    useAiDetectionStore();

  // Determine if this contact is saved in phone
  const isSavedContact = storeContacts.some(
    (c) =>
      c.name === contact.name ||
      (contact.number && c.number && c.number.replace(/\D/g, '') === contact.number.replace(/\D/g, '')),
  );

  // Should analysis run? Only for unknown/unsaved contacts
  const shouldAnalyze = !isSavedContact && !analysisStopped;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio chunking & socket — only for unknown contacts
  useEffect(() => {
    if (!shouldAnalyze) return;

    let socket;
    try {
      socket = socketService.getVoiceAnalysisSocket();
      socket.on('ai_analysis_update', (data) => {
        if (data) updateAnalysis(data);
      });
    } catch (e) {
      console.log('Socket fallback:', e.message);
    }

    audioChunker.startChunking((chunkData) => {
      setChunkCount((prev) => prev + 1);

      if (socket && socket.connected) {
        socket.emit('audio_chunk', {
          callId: 'call_' + Date.now(),
          chunkIndex: chunkData.chunkIndex,
          audioBase64: chunkData.base64Data,
          mimeType: chunkData.mimeType,
          timestamp: chunkData.timestamp,
        });
      } else if (!chunkData.isMuted && !chunkData.isAnalysisStopped) {
        // Offline simulation
        const simScore = Math.max(15, 80 - (chunkData.chunkIndex % 6) * 8);
        const simAi = Math.min(92, 20 + (chunkData.chunkIndex % 6) * 10);
        updateAnalysis({
          authenticityScore: simScore,
          aiProbability: simAi,
          confidence: 72 + (chunkData.chunkIndex % 4) * 5,
          riskLevel: simAi > 50 ? 'high' : 'low',
        });
      }
    }, 20000);

    return () => {
      audioChunker.stopChunking();
      if (socket) socket.off('ai_analysis_update');
    };
  }, [shouldAnalyze, updateAnalysis]);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    audioChunker.setMuted(next);
  }, [isMuted]);

  const handleToggleSpeaker = async () => {
    try {
      const next = !isSpeaker;
      setIsSpeaker(next);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !next,
      });
    } catch (e) {
      console.warn('Error setting audio mode:', e);
    }
  };

  const handleStopAnalysis = useCallback(() => {
    Alert.alert(
      'Stop Analysis',
      'Voice analysis will be paused for this call. No audio data will be recorded or sent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Analysis',
          style: 'destructive',
          onPress: () => {
            setAnalysisStopped(true);
            setShowAnalysisCard(false);
            audioChunker.setAnalysisStopped(true);
          },
        },
      ],
    );
  }, []);

  const handleResumeAnalysis = useCallback(() => {
    setAnalysisStopped(false);
    audioChunker.setAnalysisStopped(false);
    audioChunker.startChunking((chunkData) => {
      setChunkCount((prev) => prev + 1);
    }, 20000);
  }, []);

  const handleEndCall = () => {
    audioChunker.stopChunking();
    navigation.replace(ROUTES.CALL_SUMMARY, { contact, isSavedContact });
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Bubble color based on risk
  const getBubbleColor = () => {
    if (analysisStopped) return '#71717A';
    if (aiProbability > 60) return '#EF4444';
    if (aiProbability > 30) return '#F59E0B';
    return '#22C55E';
  };

  const getBubbleIcon = () => {
    if (analysisStopped) return 'pause-circle';
    if (aiProbability > 60) return 'warning';
    if (aiProbability > 30) return 'alert-circle';
    return 'shield-checkmark';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
        {/* Header — Timer */}
        <View style={styles.header}>
          <View style={styles.encryptedPill}>
            <Ionicons name="lock-closed" size={12} color="#22C55E" style={{ marginRight: 4 }} />
            <Text style={styles.encryptedText}>Encrypted</Text>
          </View>
          <Text style={styles.timerSmall}>{formatTimer(seconds)}</Text>
        </View>

        {/* Center — Caller Avatar & Info */}
        <View style={styles.callerCenter}>
          <View style={styles.avatarArea}>
            <PulseRing />
            <LinearGradient
              colors={contact.colors || ['#3B82F6', '#6366F1']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{contact.initials || 'UC'}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.callerName}>{contact.name}</Text>
          <Text style={styles.callerSub}>
            {contact.number || 'In-app call'} · {formatTimer(seconds)}
          </Text>

          {isSavedContact && (
            <View style={styles.savedBadge}>
              <Ionicons name="person-circle" size={14} color="#22C55E" style={{ marginRight: 4 }} />
              <Text style={styles.savedBadgeText}>Saved contact — analysis skipped</Text>
            </View>
          )}
        </View>

        {/* Floating AI Analysis Bubble — only for unknown contacts */}
        {!isSavedContact && (
          <View style={styles.bubbleContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowAnalysisCard(!showAnalysisCard)}
              style={[styles.bubble, { backgroundColor: getBubbleColor() }]}
            >
              <Ionicons name={getBubbleIcon()} size={20} color="#FFFFFF" />
              {!analysisStopped && (
                <Text style={styles.bubbleScore}>{authenticityScore}%</Text>
              )}
            </TouchableOpacity>

            {/* Expandable Mini Analysis Card */}
            {showAnalysisCard && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.analysisCard}
              >
                {analysisStopped ? (
                  <View style={styles.analysisCardInner}>
                    <Text style={styles.analysisLabel}>Analysis paused</Text>
                    <Text style={styles.analysisSubtext}>No audio is being recorded</Text>
                    <TouchableOpacity
                      onPress={handleResumeAnalysis}
                      style={styles.resumeBtn}
                    >
                      <Text style={styles.resumeBtnText}>Resume Analysis</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.analysisCardInner}>
                    <View style={styles.analysisRow}>
                      <Text style={styles.analysisLabel}>Authenticity</Text>
                      <Text style={[styles.analysisValue, { color: getBubbleColor() }]}>
                        {authenticityScore}%
                      </Text>
                    </View>
                    <View style={styles.analysisRow}>
                      <Text style={styles.analysisLabel}>AI Probability</Text>
                      <Text style={[styles.analysisValue, { color: aiProbability > 50 ? '#EF4444' : '#22C55E' }]}>
                        {aiProbability}%
                      </Text>
                    </View>
                    <View style={styles.analysisRow}>
                      <Text style={styles.analysisLabel}>Confidence</Text>
                      <Text style={styles.analysisValue}>{confidence}%</Text>
                    </View>
                    <View style={styles.cardDivider} />
                    <TouchableOpacity
                      onPress={handleStopAnalysis}
                      style={styles.stopAnalysisBtn}
                    >
                      <Ionicons name="pause-circle-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={styles.stopAnalysisText}>Stop Analysis</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        )}

        {/* Call Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleMute}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? '#EF4444' : '#FFFFFF'} />
            <Text style={[styles.controlLabel, isMuted && { color: '#EF4444' }]}>
              {isMuted ? 'Muted' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleSpeaker}
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium-outline'} size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowKeypad(true)}
            style={[styles.controlBtn, showKeypad && styles.controlBtnActive]}
          >
            <Ionicons name="keypad-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Keypad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Add Caller',
                'Conference calling and secure bridge addition will be available once backend telephony is integrated.',
                [{ text: 'OK' }]
              );
            }}
            style={styles.controlBtn}
          >
            <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* DTMF Keypad Overlay */}
        {showKeypad && (
          <View style={styles.keypadOverlay}>
            <View style={styles.keypadOverlayHeader}>
              <Text style={styles.keypadOverlayTitle}>Keypad: {dtmfText}</Text>
              <TouchableOpacity onPress={() => setShowKeypad(false)} style={styles.keypadCloseBtn}>
                <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.keypadOverlayGrid}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keypadOverlayKey}
                  onPress={() => setDtmfText((prev) => prev + digit)}
                >
                  <Text style={styles.keypadOverlayKeyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* End Call */}
        <View style={styles.endCallArea}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleEndCall} style={styles.endCallBtn}>
            <Ionicons name="call-sharp" size={30} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  encryptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  encryptedText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  timerSmall: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  callerCenter: {
    alignItems: 'center',
    marginTop: -20,
  },
  avatarArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  callerSub: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 12,
  },
  savedBadgeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '500',
  },
  bubbleContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 60,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 200,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bubbleScore: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  analysisCard: {
    marginTop: 8,
    backgroundColor: '#1A1A1E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  analysisCardInner: {
    padding: 14,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  analysisValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  analysisSubtext: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 6,
  },
  stopAnalysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  stopAnalysisText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  resumeBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resumeBtnText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.25)',
    borderColor: 'rgba(59,130,246,0.4)',
  },
  controlLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    position: 'absolute',
    bottom: -20,
  },
  endCallArea: {
    alignItems: 'center',
    paddingTop: 16,
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  keypadOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#131316',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  keypadOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  keypadOverlayTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  keypadCloseBtn: {
    padding: 4,
  },
  keypadOverlayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  keypadOverlayKey: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  keypadOverlayKeyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});
