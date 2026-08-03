import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ScreenContainer from '../../components/layout/ScreenContainer';
import TruVoiceLogo from '../../components/common/TruVoiceLogo';
import PrimaryButton from '../../components/buttons/PrimaryButton';

import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen() {
  const navigation = useNavigation();

  const { verifyOTP, isLoading } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const updateOTP = (value, index) => {
    const copy = [...otp];

    copy[index] = value;

    setOtp(copy);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== 6) return;

    await verifyOTP(code);

    navigation.replace(ROUTES.MAIN_TABS);
  };

  const resendOTP = () => {
    setTimer(30);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 justify-center">

          <View className="items-center">

            <TruVoiceLogo
              size={50}
              color="#3B82F6"
            />

            <Text className="mt-8 text-3xl font-bold text-white">
              Verify OTP
            </Text>

            <Text className="mt-3 text-center text-secondary text-base leading-6">
              We've sent a 6 digit verification code to your email.
            </Text>

          </View>

          <View className="mt-12 flex-row justify-between">

            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(text) =>
                  updateOTP(text.slice(-1), index)
                }
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                className="h-16 w-14 rounded-2xl border border-zinc-700 bg-zinc-900 text-center text-2xl font-bold text-white"
              />
            ))}

          </View>

          <PrimaryButton
            label="Verify"
            loading={isLoading}
            onPress={handleVerify}
            className="mt-10"
          />

          <View className="mt-8 items-center">

            {timer > 0 ? (
              <Text className="text-secondary">
                Resend code in {timer}s
              </Text>
            ) : (
              <Pressable onPress={resendOTP}>
                <Text className="font-semibold text-primary">
                  Resend OTP
                </Text>
              </Pressable>
            )}

          </View>

        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}