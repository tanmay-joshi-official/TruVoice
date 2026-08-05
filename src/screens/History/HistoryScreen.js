import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import FloatingCallButton from '../../components/buttons/FloatingCallButton';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

const FILTERS = ['All', 'Human', 'AI', 'Suspicious', 'Missed'];

const RAW_HISTORY_ITEMS = [
  {
    id: 'h1',
    name: 'Priya Nair',
    number: '+1 415 890',
    group: 'TODAY',
    time: '09:24',
    duration: '12m 04s',
    status: 'Human',
    statusType: 'success',
    filterCategory: 'Human',
    type: 'incoming',
    initials: 'PN',
    colors: ['#3B82F6', '#6366F1'],
  },
  {
    id: 'h2',
    name: 'Unknown Caller',
    number: '+1 415 220',
    group: 'TODAY',
    time: '08:41',
    duration: '01m 12s',
    status: 'AI Voice',
    statusType: 'danger',
    filterCategory: 'AI',
    type: 'missed',
    initials: 'U.',
    colors: ['#EF4444', '#3B82F6'],
  },
  {
    id: 'h3',
    name: 'Elena Voss',
    number: '+1 415 654',
    group: 'TODAY',
    time: '07:58',
    duration: '04m 33s',
    status: 'Human',
    statusType: 'success',
    filterCategory: 'Human',
    type: 'incoming',
    initials: 'EV',
    colors: ['#EC4899', '#F97316'],
  },
  {
    id: 'h4',
    name: 'Bank Support',
    number: '+1 800 555 0199',
    group: 'YESTERDAY',
    time: '22:10',
    duration: '02m 47s',
    status: 'Suspicious',
    statusType: 'warning',
    filterCategory: 'Suspicious',
    type: 'incoming',
    initials: 'BS',
    colors: ['#00B4DB', '#0083B0'],
  },
  {
    id: 'h5',
    name: 'Marcus Hale',
    number: '+1 415 332',
    group: 'YESTERDAY',
    time: '18:02',
    duration: '--',
    status: 'Missed',
    statusType: 'muted',
    filterCategory: 'Missed',
    type: 'missed',
    initials: 'MH',
    colors: ['#F97316', '#ED8936'],
  },
  {
    id: 'h6',
    name: 'Kenji Sato',
    number: '+1 415 119',
    group: 'YESTERDAY',
    time: '15:36',
    duration: '22m 51s',
    status: 'Human',
    statusType: 'success',
    filterCategory: 'Human',
    type: 'incoming',
    initials: 'KS',
    colors: ['#6366F1', '#A855F7'],
  },
];

export default function HistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredItems = RAW_HISTORY_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.number.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    return item.filterCategory === activeFilter;
  });

  // Group by date (TODAY, YESTERDAY, etc.)
  const groupsMap = filteredItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupsMap);

  const handleSelectCall = (call) => {
    if (call.status === 'AI Voice' || call.status === 'Suspicious') {
      navigation.navigate(ROUTES.CALL_DETAILS, { call });
    } else {
      navigation.navigate(ROUTES.CALL_SUMMARY, { call });
    }
  };

  const renderBadge = (status, statusType) => {
    let bg = 'rgba(34, 197, 94, 0.15)';
    let text = '#22C55E';

    if (statusType === 'danger') {
      bg = 'rgba(239, 68, 68, 0.15)';
      text = '#EF4444';
    } else if (statusType === 'warning') {
      bg = 'rgba(245, 158, 11, 0.15)';
      text = '#F59E0B';
    } else if (statusType === 'muted') {
      bg = 'rgba(255, 255, 255, 0.08)';
      text = colors.textMuted;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Every call, scored and stored locally</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search call history"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main List Scroll */}
        <ScrollView
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 110, 120) },
          ]}
        >
          {groupKeys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No call logs found</Text>
              <Text style={styles.emptySub}>No calls matched the current filter or query.</Text>
            </View>
          ) : (
            groupKeys.map((groupTitle) => (
              <View key={groupTitle} style={styles.groupSection}>
                <Text style={styles.groupTitle}>{groupTitle}</Text>
                <View style={styles.groupCard}>
                  {groupsMap[groupTitle].map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleSelectCall(item)}
                      style={[
                        styles.itemRow,
                        idx < groupsMap[groupTitle].length - 1 && styles.rowBorder,
                      ]}
                    >
                      <View style={styles.itemLeft}>
                        <LinearGradient colors={item.colors} style={styles.avatar}>
                          <Text style={styles.avatarText}>{item.initials}</Text>
                        </LinearGradient>
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name} {item.number ? `· ${item.number}` : ''}
                          </Text>
                          <View style={styles.timeRow}>
                            <Ionicons
                              name="call-outline"
                              size={13}
                              color={item.type === 'missed' ? colors.danger : colors.success}
                              style={styles.icon}
                            />
                            <Text style={styles.timeText}>
                              {item.time} · {item.duration}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {renderBadge(item.status, item.statusType)}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <FloatingCallButton onPress={() => navigation.navigate(ROUTES.OUTGOING_CALL, { contact: { name: 'Priya Nair' } })} />
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
    paddingVertical: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 50,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  filterWrapper: {
    height: 48,
    marginVertical: 6,
    justifyContent: 'center',
  },
  filterContainer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    includeFontPadding: false,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  groupSection: {
    marginTop: 12,
  },
  groupTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 68,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  itemMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    includeFontPadding: false,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    marginRight: 4,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
  },
});
