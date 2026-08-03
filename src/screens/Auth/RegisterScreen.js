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

import ScreenContainer from '../../components/layout/ScreenContainer';
import TruVoiceLogo from '../../components/common/TruVoiceLogo';
import AppInput from '../../components/inputs/AppInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import OrDivider from '../../components/common/OrDivider';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import SecurityNote from '../../components/cards/SecurityNote';

import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const navigation = useNavigation();

  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');

    await register({
      name,
      email,
      password,
    });

    navigation.navigate(ROUTES.OTP);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-6 pb-10 pt-4"
        >
          <TruVoiceLogo
            size={44}
            color="#3B82F6"
          />

          <Text className="mt-6 text-[28px] font-bold text-white">
            Create account
          </Text>

          <Text className="mt-2 text-base text-secondary">
            Secure your conversations with AI powered protection.
          </Text>

          <View className="mt-8">

            <AppInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              leftIcon="account-outline"
            />

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
              rightIcon={
                showPassword
                  ? 'eye-off-outline'
                  : 'eye-outline'
              }
              onRightIconPress={() =>
                setShowPassword(!showPassword)
              }
            />

            <AppInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              leftIcon="lock-check-outline"
              rightIcon={
                showConfirm
                  ? 'eye-off-outline'
                  : 'eye-outline'
              }
              onRightIconPress={() =>
                setShowConfirm(!showConfirm)
              }
            />

          </View>

          {error ? (
            <Text className="mt-3 text-danger">
              {error}
            </Text>
          ) : null}

          <PrimaryButton
            label="Create Account"
            loading={isLoading}
            onPress={handleRegister}
            className="mt-6"
          />

          <OrDivider />

          <SecondaryButton
            label="Continue with Google"
            icon="google"
            onPress={() => {}}
          />

          <SecurityNote className="mt-8" />

          <View className="mt-8 flex-row justify-center">
            <Text className="text-secondary">
              Already have an account?
            </Text>

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
            >
              <Text className="ml-1 font-semibold text-primary">
                Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}