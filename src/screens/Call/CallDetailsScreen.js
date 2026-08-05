import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingCallButton from '../../components/buttons/FloatingCallButton';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

// Risk events and AI explanation will come from backend analysis
// No hardcoded dummy data

export default function CallDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const call = route.params?.call || {};
  const riskEvents = call.riskEvents || [];
  const aiExplanation = call.aiExplanation || '';
  const authenticityScore = call.authenticityScore ?? '--';
  const callTime = call.time || '--';
  const callDuration = call.duration || '--';

  const handleReportScam = () => {
    Alert.alert(
      'Report Scam',
      'This call will be reported and added to TruVoice threat intelligence.\n\nOnce the backend is connected, this data will be securely submitted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Scam report queued for submission.') },
      ],
    );
  };

  const handleBlockCaller = () => {
    Alert.alert(
      'Block Caller',
      'Are you sure you want to block this caller? Future calls from this number will be automatically declined.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', 'Caller has been added to your block list.') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Call details</Text>
            <Text style={styles.headerSub}>{callTime} · {callDuration}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 110, 120) },
          ]}
        >
          {/* Authenticity Red Radial Ring */}
          <View style={styles.gaugeSection}>
            <View style={styles.gaugeCircle}>
              <Text style={styles.gaugeLabel}>AUTHENTICITY</Text>
              <Text style={styles.gaugeValue}>{authenticityScore}%</Text>
              <Text style={styles.gaugeSub}>{typeof authenticityScore === 'number' && authenticityScore < 40 ? 'AI Detected' : 'Pending'}</Text>
            </View>
          </View>

          {/* Risk Events List */}
          <Text style={styles.sectionTitle}>Risk events</Text>
          <View style={styles.card}>
            {riskEvents.length > 0 ? riskEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert(event.label, `Detected at ${event.time}\n\nSeverity: ${event.type === 'danger' ? 'High — confirmed synthetic' : 'Medium — anomalous'}`)
                }
                style={styles.eventRow}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: event.type === 'danger' ? '#EF4444' : '#F59E0B' },
                  ]}
                />
                <Text style={styles.eventTime}>{event.time}</Text>
                <Text style={styles.eventLabel}>{event.label}</Text>
              </TouchableOpacity>
            )) : (
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>No risk events detected</Text>
            )}
          </View>

          {/* AI Explanation Card */}
          <Text style={styles.sectionTitle}>AI explanation</Text>
          <View style={styles.card}>
            <Text style={styles.explanationText}>{aiExplanation || 'AI explanation will be available once call analysis is complete.'}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBlockCaller}
              style={styles.actionBtn}
            >
              <Ionicons name="ban-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Block caller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReportScam}
              style={styles.actionBtn}
            >
              <Ionicons name="flag-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>Report scam</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <FloatingCallButton onPress={() => navigation.navigate(ROUTES.CONTACTS)} />
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
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  scrollContent: {},
  gaugeSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  gaugeCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    borderColor: '#EF4444',
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
    color: '#EF4444',
    fontSize: 44,
    fontWeight: '800',
    marginVertical: 2,
  },
  gaugeSub: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 14,
  },
  eventTime: {
    color: colors.textMuted,
    fontSize: 13,
    width: 50,
  },
  eventLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131316',
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
