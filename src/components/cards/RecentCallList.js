import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

const MOCK_RECENT_CALLS = [
  {
    id: 'c1',
    name: 'Priya Nair',
    number: '+1 415 890',
    type: 'incoming',
    time: '09:24',
    duration: '12m 04s',
    status: 'Human',
    statusType: 'success',
    initials: 'PN',
    colors: ['#3B82F6', '#6366F1'],
  },
  {
    id: 'c2',
    name: 'Unknown',
    number: '+1 415 220',
    type: 'missed',
    time: '08:41',
    duration: '01m 12s',
    status: 'AI Voice',
    statusType: 'danger',
    initials: 'U.',
    colors: ['#EF4444', '#3B82F6'],
  },
];

export default function RecentCallList({ onSelectCall, onHistoryPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent calls</Text>
        <TouchableOpacity onPress={onHistoryPress} activeOpacity={0.7}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listCard}>
        {MOCK_RECENT_CALLS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => onSelectCall && onSelectCall(item)}
            style={[
              styles.callRow,
              index < MOCK_RECENT_CALLS.length - 1 && styles.borderBottom,
            ]}
          >
            <View style={styles.leftSection}>
              <LinearGradient colors={item.colors} style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </LinearGradient>
              <View style={styles.callDetails}>
                <Text style={styles.callerName}>{item.name} {item.number ? `· ${item.number}` : ''}</Text>
                <View style={styles.subtextRow}>
                  <Ionicons
                    name={item.type === 'incoming' ? 'call-outline' : 'call-outline'}
                    size={14}
                    color={item.type === 'missed' ? colors.danger : colors.success}
                    style={styles.callIcon}
                  />
                  <Text style={styles.timeDurationText}>
                    {item.time} · {item.duration}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.badge,
                item.statusType === 'success' ? styles.badgeSuccess : styles.badgeDanger,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  item.statusType === 'success' ? styles.badgeTextSuccess : styles.badgeTextDanger,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  historyText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  listCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  callDetails: {
    flex: 1,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  callIcon: {
    marginRight: 4,
  },
  timeDurationText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#22C55E',
  },
  badgeTextDanger: {
    color: '#EF4444',
  },
});
