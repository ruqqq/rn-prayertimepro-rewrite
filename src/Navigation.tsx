import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import OnboardingScreen from './screens/OnboardingScreen';
import RNHome from './screens/RNHome';
import { RootStackParamList } from './navigation-types';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainScreen: () => React.ReactElement = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="RN Dev"
        component={RNHome}
        options={{
          tabBarIcon: () => <MaterialCommunityIcons name="home" size={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
    </Stack.Navigator>
  );
};

export default Navigation;
