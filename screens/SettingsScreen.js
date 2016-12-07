import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  AsyncStorage,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  ExponentConfigView,
} from '@exponent/samples';
import PubSub from 'pubsub-js';
import * as firebase from 'firebase';

{/* Initialize Firebase */}
const firebaseConfig =
{
  apiKey: "***REMOVED***",
  authDomain: "annenmerge-94bee.firebaseapp.com",
  databaseURL: "https://annenmerge-94bee.firebaseio.com/",
  storageBucket: "gs://annenmerge-94bee.appspot.com",
};

const devWidth = Dimensions.get('window').width;

export default class SettingsScreen extends React.Component {
  static route =
  {
    navigationBar:
    {
      title: 'Settings'
    },
  }

  constructor(props)
  {
    super(props);
    this.state =
    {
      firstName: "User",
      tableNumber: "A1",
      sessionExists: false,
    };
  }

  componentWillMount()
  {
    var settingsComp = this;
    settingsComp.getUserInfo();
  }

  render() {

    var settingsComp = this;
    var settingsSubscriber = function(msg, data)
    {
      if (data)
      {
        console.log("user's session has been stored - settings screen");
        console.log("get the user's name and table");
        settingsComp.getUserInfo();
        settingsComp.setState({sessionExists: true});
      }
    }
    var token = PubSub.subscribe('sessionexists', settingsSubscriber);

    return (
      <View style={{alignItems: 'center', marginTop: 10}}>
        <Text style={{fontSize: 20, fontStyle: 'italic'}}>
          Welcome back, {this.state.firstName}!
        </Text>
        <View style={{height: 5}}></View>
        <Text verticalPadding>
          Your table number is {this.state.tableNumber}.
        </Text>
        <TouchableOpacity onPress={this._logOutWithFacebook} style={{width: 0.75*devWidth, height: 0.75*devWidth*130/620, marginTop: 25}}>
          <Image
            style={{width: 0.75*devWidth, height: 0.75*devWidth*130/620, resizeMode: 'contain'}}
            source={require('../assets/images/logout-button.png')}
          />
        </TouchableOpacity>
      </View>
    );
  }

  async getUserInfo()
  {
    var settingsComp = this;
    try
    {
      // get users name and fb id from the data that was stored before globally
      const userfbdata = await AsyncStorage.getItem('sessionid');

      // if the userdata is there, set userId to the fb id and usersName to the user's name
      if (userfbdata !== null)
      {
        var objectuserdata = JSON.parse(userfbdata);
        var userId = objectuserdata.id;
        var firstName = objectuserdata.name.split(" ")[0];
      }
    }
    catch (error)
    {
      console.log("error getting data from AsyncStorage");
    }
    if (firebase.auth().currentUser != null)
    {
      firebase.database().ref('/users/' + userId).once('value').then(function(snapshot)
      {
        try
        {
          var tableNumber = snapshot.val().tablenumber;
          console.log(tableNumber);
          settingsComp.setState({firstName: firstName, tableNumber: tableNumber});
        }
        catch (error)
        {
          console.log("error finding user's own table number");
        }
      });
    }
  }

  _logOutWithFacebook = async () =>
  {
      try
      {
        await AsyncStorage.removeItem('sessionid');
        console.log("sessionid deleted");
      }
      catch (error)
      {
        console.log("error deleting session id");
      }
      PubSub.publish('loggedin', false);
      this.setState({sessionExists: false});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
