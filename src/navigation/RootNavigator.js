import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingPlaceholder from '../screens/Onboarding/OnboardingPlaceholder';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#09090B',
    card: '#09090B',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#3B82F6',
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#09090B' },
        }}
      >
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen
          name={ROUTES.ONBOARDING}
          component={OnboardingPlaceholder}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
