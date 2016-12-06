import {
  createRouter,
} from '@exponent/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import SubmitScreen from '../screens/SubmitScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  home: () => HomeScreen,
  submit: () => SubmitScreen,
  settings: () => SettingsScreen,
  rootNavigation: () => RootNavigation,
}));
