import {
  createRouter,
} from '@exponent/ex-navigation';

import LogInScreen from '../screens/LogInScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  logIn: () => LogInScreen,
  links: () => LinksScreen,
  settings: () => SettingsScreen,
  rootNavigation: () => RootNavigation,
}));
