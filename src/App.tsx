import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './Navigation';
import Db from './Db';

Db.open();

const AppContainer: () => React.ReactElement = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppContainer;
