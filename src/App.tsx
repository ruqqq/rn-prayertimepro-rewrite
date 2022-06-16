import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './Navigation';
import useAppInitEffect from './useAppInitEffect';

const AppContainer = () => {
  const { isReady, initialRouteName } = useAppInitEffect();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isReady ? (
        <NavigationContainer>
          <Navigation initialRouteName={initialRouteName} />
        </NavigationContainer>
      ) : null}
    </GestureHandlerRootView>
  );
};

export default AppContainer;
