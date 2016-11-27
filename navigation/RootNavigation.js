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

  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }



  render() {

  	var that = this;

    var mySubscriber = function(msg, data)
    {
      if (data === true)
      {
          console.log("this is happening 100 times");
          that.setState({visibility: true});
          PubSub.unsubscribe(token);
      }
    }
  	var token = PubSub.subscribe('loggedin', mySubscriber);
    // firebase.auth().onAuthStateChanged(
    // function(user) {
    //     if(user != null) {
    //         console.log("We are authenticated now!");
    //         that.setState({visibility: true});
    //     }
    // });

if (this.state.visibility === true)
{

	  return (


	    <TabNavigation
	      tabBarHeight={56}
	      initialTab="logIn">
	      <TabNavigationItem
	        id="logIn"
	        renderIcon={isSelected => this._renderIcon('home', isSelected)}>
	        <StackNavigation initialRoute="logIn" />
	      </TabNavigationItem>

	      <TabNavigationItem
	        id="links"
	        renderIcon={isSelected => this._renderIcon('book', isSelected)}>
	        <StackNavigation initialRoute="links" />
	      </TabNavigationItem>

	      <TabNavigationItem
	        id="settings"
	        renderIcon={isSelected => this._renderIcon('cog', isSelected)}>
	        <StackNavigation initialRoute="settings" />
	      </TabNavigationItem>
	    </TabNavigation>
	  );

	}
	else
	{
		return (


	    <TabNavigation
	      tabBarHeight={0}
	      initialTab="logIn">
	      <TabNavigationItem
	        id="logIn"
	        >
	        <StackNavigation initialRoute="logIn" />
	      </TabNavigationItem>
	    </TabNavigation>
	  );
	}

  }


  _renderIcon(name, isSelected) {
    return (
      <FontAwesome
        name={name}
        size={32}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({origin, data}) => {
    this.props.navigator.showLocalAlert(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`,
      Alerts.notice
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
