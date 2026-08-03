import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from '../../components/layout/ScreenContainer';
import TruVoiceLogo from '../../components/common/TruVoiceLogo';
import AppInput from '../../components/inputs/AppInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';

import { ROUTES } from '../../constants/routes';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!email.trim()) return;

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);

    navigation.navigate(ROUTES.OTP);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow px-6 pt-4 pb-8"
        >

          <TruVoiceLogo
            size={44}
            color="#3B82F6"
          />

          <Text className="mt-6 text-[28px] font-bold text-white">
            Forgot Password
          </Text>

          <Text className="mt-2 text-base text-secondary">
            Enter your registered email address and we'll send you a verification code.
          </Text>

          <View className="mt-8">

            <AppInput
              label="Email Address"
              placeholder="you@truvoice.app"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon="email-outline"
            />

          </View>

          <PrimaryButton
            label="Send Verification Code"
            loading={loading}
            onPress={sendOTP}
            className="mt-8"
          />

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 self-center"
          >
            <Text className="text-primary font-semibold">
              Back to Login
            </Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}