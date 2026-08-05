import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export default function RecentCallList({ onSelectCall, onHistoryPress }) {
  // Real call history will be populated from backend API
  // No hardcoded/dummy data
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent calls</Text>
        <TouchableOpacity onPress={onHistoryPress} activeOpacity={0.7}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyCard}>
        <Ionicons name="call-outline" size={28} color={colors.textMuted} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyText}>No recent calls</Text>
        <Text style={styles.emptySub}>Your call history will appear here</Text>
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
  emptyCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
