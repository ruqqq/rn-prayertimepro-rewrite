import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import OnboardingScreen from './screens/OnboardingScreen';
import LocationPickerScreen from './screens/LocationPickerScreen';
import RNHome from './screens/RNHome';
import { RootStackParamList } from './navigation-types';
import { NavigationBar } from './NavigationBar';

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

interface Props {
  initialRouteName?: keyof RootStackParamList;
}

const Navigation: React.FC<Props> = ({ initialRouteName }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ header: props => <NavigationBar {...props} /> }}>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="LocationPicker"
          component={LocationPickerScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default Navigation;
