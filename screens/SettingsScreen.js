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
const devHeight = Dimensions.get('window').height;

console.disableYellowBox = true;



export default class SettingsScreen extends React.Component {

  constructor(props)
  {
    super(props);
    this.state =
    {
      welcomeText: "Welcome!",
      tableText: "Please submit a table number.",
    };
  }

  componentDidMount()
  {
    var settingsComp = this;
    settingsComp.getUserInfo();
  }

  render() {

    var settingsComp = this;
    var settingsSessionSubscriber = function(msg, data)
    {
      if (data)
      {
        console.log("user's session has been stored - settings screen, get user's table");
        settingsComp.getUserInfo();
      }
    }
    var token = PubSub.subscribe('sessionexists', settingsSessionSubscriber);

    var settingsTableSubscriber = function(msg, data)
    {
      if (data)
      {
        console.log("user has submitted new data - settings screen, get user's table");
        settingsComp.getUserInfo();
      }
    }
    var token = PubSub.subscribe('newtablesubmit', settingsTableSubscriber);

    return (
      <View>
        <View>
          <Image
            style={{position: 'absolute', width: devWidth, height: devHeight, resizeMode: 'cover'}}
            source={require('../assets/images/metalBG.jpg')}
          />
        </View>
        <View style={{alignItems: 'center', marginTop: 50}}>
          <Text style={{fontSize: 20, fontStyle: 'italic', color: 'white', backgroundColor: 'transparent'}}>
            {this.state.welcomeText}
          </Text>
          <View style={{height: 5}}></View>
          <Text style={{color: 'white', backgroundColor: 'transparent'}}>
            {this.state.tableText}.
          </Text>
          <TouchableOpacity onPress={this._logOutWithFacebook} style={{width: 0.5*devWidth, height: 0.5*devWidth*76/265, marginTop: 25}}>
            <Image
              style={{width: 0.5*devWidth, height: 0.5*devWidth*76/265, resizeMode: 'contain'}}
              source={require('../assets/images/signout-metal.png')}
            />
          </TouchableOpacity>
        </View>
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
          settingsComp.setState({welcomeText: "Welcome back, "+firstName+"!", tableText: "Your table number is "+tableNumber});
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
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
