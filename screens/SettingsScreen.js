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

// links apps with Firebase database
const firebaseConfig =
{
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  storageBucket: "",
};

// store dimensions of user's screen
const devWidth = Dimensions.get('window').width;
const devHeight = Dimensions.get('window').height;

// disables warnings to enhance user experience
console.disableYellowBox = true;

export default class SettingsScreen extends React.Component {

  constructor(props)
  {
    super(props);
    // displayed if user has not yet checked in
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

    // displays user info and sign-out button
    return (
      <View>
        <View>
          <Image
            style={styles.background}
            source={require('../assets/images/metalBG.jpg')}
          />
        </View>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {this.state.welcomeText}
          </Text>
          <View style={{height: 5}}></View>
          <Text style={styles.tableText}>
            {this.state.tableText}
          </Text>
          <TouchableOpacity onPress={this._logOutWithFacebook} style={styles.signOutContainer}>
            <Image
              style={styles.signOutButton}
              source={require('../assets/images/signout-metal.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

 // retrieves user's name and table number from Firebase
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
          settingsComp.setState({welcomeText: "Welcome back, "+firstName+"!", tableText: "Your table number is "+tableNumber+"."});
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
  background: {
    position: 'absolute',
    width: devWidth,
    height: devHeight,
    resizeMode: 'cover',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  welcomeText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: 'white',
    backgroundColor: 'transparent',
  },
  tableText: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  signOutContainer: {
    width: 0.5*devWidth,
    height: 0.5*devWidth*76/265,
    marginTop: 25,
  },
  signOutButton: {
    width: 0.5*devWidth,
    height: 0.5*devWidth*76/265,
    resizeMode: 'contain',
  },
});
