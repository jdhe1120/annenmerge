import React from 'react';
import {
  StyleSheet,
  View,
  AysncStorage,
} from 'react-native';
import {
  Notifications,
} from 'exponent';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

import Alerts from '../constants/Alerts';
import Colors from '../constants/Colors';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import PubSub from 'pubsub-js';

import * as firebase from 'firebase';

export default class RootNavigation extends React.Component {
  constructor(props) {
      super(props);
      this.state = {visibility: false};
    }

  render() {
    // hides navigation bar when user is logged out
  	var navComp = this;
    var navSub = function(msg, data)
    {
      if (data === true)
      {
        navComp.setState({visibility: true});
        console.log("user logged in, show nav bar");
      }
      else
      {
        navComp.setState({visibility: false});
        console.log("user logged out, hide nav bar");
      }
    }
  	var token = PubSub.subscribe('loggedin', navSub);

    if (this.state.visibility === true)
    {
  	  return (
  	    <TabNavigation
  	      tabBarHeight={56}
          id="main"
          navigatorUID="main"
  	      initialTab="home">
  	      <TabNavigationItem
  	        id="home"
  	        renderIcon={isSelected => this._renderIcon('map-marker', isSelected)}>
  	        <StackNavigation initialRoute="home" />
  	      </TabNavigationItem>
  	      <TabNavigationItem
  	        id="submit"
  	        renderIcon={isSelected => this._renderIcon('pencil', isSelected)}>
  	        <StackNavigation initialRoute="submit" />
  	      </TabNavigationItem>
  	      <TabNavigationItem
  	        id="settings"
  	        renderIcon={isSelected => this._renderIcon('gears', isSelected)}>
  	        <StackNavigation initialRoute="settings" />
  	      </TabNavigationItem>
  	    </TabNavigation>
  	  );
  	}
  	else
  	{
  		return (
  	    <TabNavigation
          id="main"
          navigatorUID="main"
  	      tabBarHeight={0.1}
  	      initialTab="home">
          <TabNavigationItem
  	        id="home">
  	        <StackNavigation initialRoute="home" />
  	      </TabNavigationItem>
          <TabNavigationItem
  	        id="submit"
  	        >
  	      </TabNavigationItem>
  	      <TabNavigationItem
  	        id="settings"
  	        >
  	      </TabNavigationItem>
  	    </TabNavigation>
  	  );
  	}
  }

  // displays different icon when tab is selected
  _renderIcon(name, isSelected) {
    return (
      <FontAwesome
        name={name}
        size={32}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectedTab: {
    color: Colors.tabIconSelected,
  },
});
