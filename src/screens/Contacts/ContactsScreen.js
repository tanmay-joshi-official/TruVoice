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
import FloatingCallButton from '../../components/buttons/FloatingCallButton';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../theme';

const FAVORITES = [
  { id: 'f1', name: 'Riya', initials: 'RK', colors: ['#F97316', '#EC4899'], isOnline: true },
  { id: 'f2', name: 'Priya', initials: 'PN', colors: ['#3B82F6', '#6366F1'], isOnline: true },
  { id: 'f3', name: 'Elena', initials: 'EV', colors: ['#EC4899', '#F97316'], isOnline: true },
];

const CONTACT_GROUPS = [
  {
    letter: 'D',
    contacts: [
      { id: 'd1', name: 'Daniel Okafor', handle: '@dokafor', status: 'Last seen 2h ago', initials: 'DO', colors: ['#8B5CF6', '#3B82F6'] },
    ],
  },
  {
    letter: 'E',
    contacts: [
      { id: 'e1', name: 'Elena Voss', handle: '@evoss', status: 'Online', initials: 'EV', colors: ['#EC4899', '#F97316'], isOnline: true },
    ],
  },
  {
    letter: 'F',
    contacts: [
      { id: 'f1', name: 'Farah Idris', handle: '@farah', status: 'Last seen 2h ago', initials: 'FI', colors: ['#3B82F6', '#22C55E'] },
    ],
  },
  {
    letter: 'K',
    contacts: [
      { id: 'k1', name: 'Kenji Sato', handle: '@kenji', status: 'Last seen 2h ago', initials: 'KS', colors: ['#6366F1', '#A855F7'] },
    ],
  },
];

export default function ContactsScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const startCall = (contact) => {
    navigation.navigate(ROUTES.OUTGOING_CALL, { contact });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>8 people · 4 online</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Favorites */}
          <Text style={styles.sectionHeading}>Favorites</Text>
          <View style={styles.favoritesRow}>
            {FAVORITES.map((fav) => (
              <View key={fav.id} style={styles.favoriteCard}>
                <View style={styles.favAvatarContainer}>
                  <LinearGradient colors={fav.colors} style={styles.favAvatar}>
                    <Text style={styles.favAvatarText}>{fav.initials}</Text>
                  </LinearGradient>
                  {fav.isOnline && <View style={styles.favOnlineBadge} />}
                </View>
                <Text style={styles.favName}>{fav.name}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => startCall(fav)}
                  style={styles.favCallBtn}
                >
                  <Ionicons name="call" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Grouped Alphabetical List */}
          {CONTACT_GROUPS.map((group) => (
            <View key={group.letter} style={styles.groupContainer}>
              <Text style={styles.letterHeader}>{group.letter}</Text>
              {group.contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  activeOpacity={0.7}
                  onPress={() => startCall(contact)}
                  style={styles.contactRow}
                >
                  <View style={styles.contactLeft}>
                    <View style={styles.contactAvatarWrapper}>
                      <LinearGradient colors={contact.colors} style={styles.contactAvatar}>
                        <Text style={styles.contactAvatarText}>{contact.initials}</Text>
                      </LinearGradient>
                      {contact.isOnline && <View style={styles.contactOnlineBadge} />}
                    </View>

                    <View style={styles.contactMeta}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactSubtext}>
                        {contact.status} · {contact.handle}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shieldBtn}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        <FloatingCallButton onPress={() => startCall(FAVORITES[0])} />
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
    paddingVertical: 14,
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
    marginVertical: 10,
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
  scrollContent: {
    paddingBottom: 110,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 12,
  },
  favoritesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: '#131316',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  favAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  favAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  favOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#131316',
  },
  favName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  favCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupContainer: {
    marginBottom: 16,
  },
  letterHeader: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131316',
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contactOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#131316',
  },
  contactMeta: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  shieldBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});
