/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerPushBackgroundHandler } from './src/lib/notifications';

registerPushBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
