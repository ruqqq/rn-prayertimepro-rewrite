import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './Navigation';
import useAppInitEffect from './useAppInitEffect';
import { CombinedDarkTheme } from './theme';

const AppContainer = () => {
  const { isReady, initialRouteName } = useAppInitEffect();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={CombinedDarkTheme}>
        {isReady ? (
          <NavigationContainer theme={CombinedDarkTheme}>
            <Navigation initialRouteName={initialRouteName} />
          </NavigationContainer>
        ) : null}
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default AppContainer;
