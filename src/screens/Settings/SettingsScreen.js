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
import FloatingCallButton from '../../components/buttons/FloatingCallButton';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store';
import { colors } from '../../theme';

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>Pro</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>AM</Text>
              </LinearGradient>
              <View style={styles.avatarRing} />
            </View>

            <Text style={styles.userName}>Aarav Mehta</Text>
            <Text style={styles.userEmail}>aarav@truvoice.app</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>128</Text>
                <Text style={styles.statLabel}>Trusted</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Blocked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>42h</Text>
                <Text style={styles.statLabel}>Protected</Text>
              </View>
            </View>
          </View>

          {/* Achievements Section */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsRow}>
            <View style={styles.achievementCard}>
              <Ionicons name="ribbon-outline" size={24} color="#EF4444" style={styles.achIcon} />
              <Text style={styles.achTitle}>Scam Slayer</Text>
            </View>

            <View style={styles.achievementCard}>
              <Ionicons name="ribbon-outline" size={24} color="#22C55E" style={styles.achIcon} />
              <Text style={styles.achTitle}>Verified 100</Text>
            </View>

            <View style={styles.achievementCard}>
              <Ionicons name="ribbon-outline" size={24} color="#3B82F6" style={styles.achIcon} />
              <Text style={styles.achTitle}>Early Access</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuCard}>
            <TouchableOpacity activeOpacity={0.7} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="sparkles-outline" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Subscription</Text>
                  <Text style={styles.menuSubtitle}>Pro · renews 12 Aug</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity activeOpacity={0.7} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Security settings</Text>
                  <Text style={styles.menuSubtitle}>Encryption, permissions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity activeOpacity={0.7} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Help center</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={logout}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  proBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  avatarRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  achIcon: {
    marginBottom: 8,
  },
  achTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: '#131316',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
