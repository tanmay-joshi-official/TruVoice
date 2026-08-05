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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

export default function CallSummaryScreen({ navigation, route }) {
  const contact = route.params?.contact || {
    name: 'Unknown Caller',
    number: '+1 415 220',
    initials: 'UC',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.MAIN_TABS)}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Call summary</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Summary Header Card */}
          <View style={styles.summaryCard}>
            <LinearGradient colors={['#EF4444', '#3B82F6']} style={styles.avatar}>
              <Text style={styles.avatarText}>{contact.initials || 'UC'}</Text>
            </LinearGradient>

            <Text style={styles.callerName}>{contact.name || 'Unknown Caller'}</Text>
            <Text style={styles.callMeta}>03:12 · Today 08:41</Text>

            <View style={styles.syntheticBadge}>
              <Text style={styles.syntheticText}>Synthetic voice</Text>
            </View>
          </View>

          {/* Metric Cards Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>AVG AUTHENTICITY</Text>
              <Text style={styles.metricValueDanger}>18%</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MAX AI PROB.</Text>
              <Text style={styles.metricValueDanger}>94%</Text>
            </View>
          </View>

          {/* Risk Timeline Chart */}
          <Text style={styles.sectionTitle}>Risk timeline</Text>
          <View style={styles.chartCard}>
            <Svg height="100" width="100%" viewBox="0 0 300 100">
              <Defs>
                <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#EF4444" stopOpacity="0.5" />
                  <Stop offset="1" stopColor="#EF4444" stopOpacity="0.0" />
                </SvgGradient>
              </Defs>
              <Path
                d="M 10,70 Q 80,60 150,30 T 290,20 L 290,100 L 10,100 Z"
                fill="url(#grad)"
              />
              <Path
                d="M 10,70 Q 80,60 150,30 T 290,20"
                fill="none"
                stroke="#EF4444"
                strokeWidth="3"
              />
            </Svg>
          </View>

          {/* Transcript Section */}
          <View style={styles.transcriptHeader}>
            <Text style={styles.sectionTitle}>Transcript</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transcriptCard}>
            <View style={styles.tsRow}>
              <Text style={styles.tsTime}>00:04</Text>
              <Text style={styles.tsText}>
                Good morning, I&apos;m calling from the fraud department.
              </Text>
            </View>

            <View style={styles.tsRow}>
              <Text style={styles.tsTime}>00:11</Text>
              <Text style={styles.tsText}>Which bank is this exactly?</Text>
            </View>

            <View style={styles.tsRow}>
              <Text style={styles.tsTime}>00:16</Text>
              <Text style={styles.tsText}>
                Your account has been flagged. I need to verify a code sent to you.
              </Text>
            </View>

            <View style={styles.tsRow}>
              <Text style={styles.tsTime}>00:24</Text>
              <Text style={styles.tsText}>I&apos;m not sharing any code.</Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  callMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  syntheticBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 12,
  },
  syntheticText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metricValueDanger: {
    color: '#EF4444',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  transcriptCard: {
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  tsRow: {
    flexDirection: 'row',
  },
  tsTime: {
    color: colors.textMuted,
    fontSize: 12,
    width: 44,
  },
  tsText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
