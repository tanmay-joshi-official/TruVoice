import React, { useEffect, useState } from 'react';
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
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

import { voiceService } from '../../services/voice/voiceService';
import { useCallStore } from '../../store/callStore';

export default function OutgoingCallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const contact = route.params?.contact || {
    name: 'Unknown Caller',
    number: '',
    initials: 'UC',
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dtmfText, setDtmfText] = useState('');
  const [callStatusText, setCallStatusText] = useState('Calling...');

  const setCallId = useCallStore((s) => s.setCallId);
  const setPhoneNumber = useCallStore((s) => s.setPhoneNumber);

  useEffect(() => {
    let isMounted = true;

    async function startCall() {
      try {
        const targetNumber = contact.number || contact.phone_number || '+1234567890';
        setPhoneNumber(targetNumber);
        
        const response = await voiceService.startOutgoingCall(targetNumber);
        if (isMounted && response?.call_id) {
          setCallId(response.call_id);
          setCallStatusText('Ringing...');
          
          setTimeout(() => {
            if (isMounted) {
              navigation.replace(ROUTES.ACTIVE_CALL, {
                contact,
                callId: response.call_id,
              });
            }
          }, 2000);
        }
      } catch (err) {
        console.warn('Outgoing call error:', err);
        if (isMounted) {
          setCallStatusText('Connecting fallback call...');
          setTimeout(() => {
            if (isMounted) {
              navigation.replace(ROUTES.ACTIVE_CALL, { contact });
            }
          }, 2500);
        }
      }
    }

    startCall();

    return () => {
      isMounted = false;
    };
  }, [navigation, contact, setCallId, setPhoneNumber]);


  const handleToggleSpeaker = async () => {
    try {
      const next = !isSpeaker;
      setIsSpeaker(next);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !next, // true means earpiece, false means speakerphone
      });
    } catch (e) {
      console.warn('Error setting audio mode:', e);
    }
  };

  const handleEnd = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View
        style={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom + 20, 40) },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleEnd}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center Caller Section */}
        <View style={styles.centerSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#3B82F6', '#6366F1']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{contact.initials || 'PN'}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.callerName}>{contact.name}</Text>
          <Text style={styles.callStatus}>Calling...</Text>

          <Text style={styles.timerText}>00:00</Text>
        </View>

        {/* Shield Status Note */}
        <View style={styles.shieldNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#22C55E" style={styles.shieldIcon} />
          <Text style={styles.shieldNoteText}>
            Voice analysis starts the moment they answer.
          </Text>
        </View>

        {/* Call Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMuted(!isMuted)}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={22} color={isMuted ? '#EF4444' : '#FFFFFF'} />
            <Text style={[styles.controlLabel, isMuted && { color: '#EF4444' }]}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleSpeaker}
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium-outline'} size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowKeypad(true)}
            style={[styles.controlBtn, showKeypad && styles.controlBtnActive]}
          >
            <Ionicons name="keypad-outline" size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Keypad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Add Caller',
                'Conference calling is not supported in demo mode. Choose a contact to add once connected to backend.',
                [{ text: 'OK' }],
              );
            }}
            style={styles.controlBtn}
          >
            <Ionicons name="person-add-outline" size={22} color="#FFFFFF" />
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

        {/* End Call Button */}
        <View style={styles.endCallContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEnd}
            style={styles.endCallBtn}
          >
            <Ionicons name="call-sharp" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.endLabel}>End</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    marginBottom: 24,
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  callStatus: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 6,
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: 36,
    fontWeight: '600',
    marginTop: 20,
  },
  shieldNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131316',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shieldIcon: {
    marginRight: 10,
  },
  shieldNoteText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  controlLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    position: 'absolute',
    bottom: -22,
  },
  endCallContainer: {
    alignItems: 'center',
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
  endLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
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
