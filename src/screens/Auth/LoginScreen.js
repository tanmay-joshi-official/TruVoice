import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '../../components/layout/ScreenContainer';
import TruVoiceLogo from '../../components/common/TruVoiceLogo';
import AppInput from '../../components/inputs/AppInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import OrDivider from '../../components/common/OrDivider';
import SecurityNote from '../../components/cards/SecurityNote';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, loginAsGuest, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    try {
      await login({ email: email.trim(), password });
      navigation.replace(ROUTES.MAIN_TABS);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    navigation.replace(ROUTES.MAIN_TABS);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TruVoiceLogo size={44} color="#3B82F6" />

          <Text className="mt-6 text-[28px] font-bold text-white">
            Welcome back
          </Text>
          <Text className="mt-2 text-base text-secondary">
            Encrypted, on-device voice protection.
          </Text>

          <View className="mt-8">
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@truvoice.app"
              keyboardType="email-address"
              leftIcon="email-outline"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              leftIcon="lock-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            className="-mt-1 self-end active:opacity-70"
          >
            <Text className="text-sm font-medium text-primary">
              Forgot password?
            </Text>
          </Pressable>

          {error ? (
            <Text className="mt-3 text-sm text-danger">{error}</Text>
          ) : null}

          <PrimaryButton
            label="Log in"
            onPress={handleLogin}
            loading={isLoading}
            className="mt-6"
          />

          <OrDivider />

          <SecondaryButton
            label="Continue with Google"
            icon="google"
            onPress={handleLogin}
          />

          <Pressable
            onPress={handleGuest}
            className="mt-4 flex-row items-center justify-center py-3 active:opacity-70"
          >
            <MaterialCommunityIcons
              name="fingerprint"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text className="text-base font-medium text-white">
              Continue as guest
            </Text>
          </Pressable>

          <SecurityNote className="mt-8" />

          <View className="mt-8 flex-row items-center justify-center">
            <Text className="text-sm text-secondary">New to TruVoice? </Text>
            <Pressable
              onPress={() => navigation.navigate(ROUTES.REGISTER)}
              className="active:opacity-70"
            >
              <Text className="text-sm font-semibold text-primary">Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
