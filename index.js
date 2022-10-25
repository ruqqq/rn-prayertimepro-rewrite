/**
 * @format
 */

// require('react-native-ui-lib/config').setConfig({appScheme: 'default'});
import _ from './src/colorScheme';
import { AppRegistry } from 'react-native';
import AppContainer from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => AppContainer);
