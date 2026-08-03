import { View, Text } from 'react-native';
import ScreenContainer from '../../components/layout/ScreenContainer';

/**
 * Temporary placeholder — replaced in Step 3 with real onboarding carousel.
 */
export default function OnboardingPlaceholder() {
  return (
    <ScreenContainer className="px-6">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-white">Onboarding</Text>
        <Text className="mt-2 text-center text-secondary">
          Step 3 will build the full onboarding flow here.
        </Text>
      </View>
    </ScreenContainer>
  );
}
