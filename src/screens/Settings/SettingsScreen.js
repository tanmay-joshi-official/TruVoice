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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingCallButton from '../../components/buttons/FloatingCallButton';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store';
import { colors } from '../../theme';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Derive display values from auth store user, with fallbacks
  const displayName = user?.name || 'Aarav Mehta';
  const displayEmail = user?.email || 'aarav@truvoice.app';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of TruVoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: ROUTES.LOGIN }],
            });
          },
        },
      ],
    );
  };

  const handleSubscription = () => {
    Alert.alert('Subscription', 'TruVoice Pro is active.\n\nRenews on 12 Aug.\nManage your plan from the backend dashboard once connected.');
  };

  const handleSecuritySettings = () => {
    Alert.alert('Security Settings', 'End-to-end encryption: Active\nWebRTC transport: Secured\nOn-device AI analysis: Enabled\n\nDetailed security configuration will be available when the backend is connected.');
  };

  const handleHelpCenter = () => {
    Alert.alert('Help Center', 'TruVoice v1.0.0\n\nFor support, contact:\nsupport@truvoice.app\n\nDocumentation and FAQs will be available in a future update.');
  };

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 110, 120) },
          ]}
        >
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={['#3B82F6', '#6366F1']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
              <View style={styles.avatarRing} />
            </View>

            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>

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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Scam Slayer', 'Blocked 5+ synthetic voice calls. You are protecting yourself from AI scams!')}
              style={styles.achievementCard}
            >
              <Ionicons name="ribbon-outline" size={24} color="#EF4444" style={styles.achIcon} />
              <Text style={styles.achTitle}>Scam Slayer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Verified 100', '100+ calls verified as authentic human speech. Your network is trusted.')}
              style={styles.achievementCard}
            >
              <Ionicons name="ribbon-outline" size={24} color="#22C55E" style={styles.achIcon} />
              <Text style={styles.achTitle}>Verified 100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Early Access', 'You are among the first TruVoice users. Thank you for your trust!')}
              style={styles.achievementCard}
            >
              <Ionicons name="ribbon-outline" size={24} color="#3B82F6" style={styles.achIcon} />
              <Text style={styles.achTitle}>Early Access</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Options */}
          <View style={styles.menuCard}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleSubscription} style={styles.menuItem}>
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

            <TouchableOpacity activeOpacity={0.7} onPress={handleSecuritySettings} style={styles.menuItem}>
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

            <TouchableOpacity activeOpacity={0.7} onPress={handleHelpCenter} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Help center</Text>
                  <Text style={styles.menuSubtitle}>FAQ, support, docs</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>

        <FloatingCallButton onPress={() => navigation.navigate(ROUTES.OUTGOING_CALL, { contact: { name: displayName, initials, number: '' } })} />
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
