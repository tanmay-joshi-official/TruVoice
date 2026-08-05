import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

export default function OutgoingCallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const contact = route.params?.contact || {
    name: 'Priya Nair',
    number: '+1 415 890',
    initials: 'PN',
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  // Auto-connect call demo simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.ACTIVE_CALL, { contact });
    }, 4500);

    return () => clearTimeout(timer);
  }, [navigation, contact]);

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
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsSpeaker(!isSpeaker)}
            style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium-outline'} size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsVideo(!isVideo)}
            style={[styles.controlBtn, isVideo && styles.controlBtnActive]}
          >
            <Ionicons name={isVideo ? 'videocam' : 'videocam-outline'} size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.controlBtn}>
            <Ionicons name="keypad-outline" size={22} color="#FFFFFF" />
            <Text style={styles.controlLabel}>Keypad</Text>
          </TouchableOpacity>
        </View>

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
});
