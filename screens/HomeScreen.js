import React from 'react';
import
{
  AppRegistry,
  Image,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
  ListView,
  NavigatorIOS,
  StatusBar
} from 'react-native';
import
{
  withNavigation,
} from '@exponent/ex-navigation';

import { MonoText } from '../components/StyledText';
import { Facebook } from 'exponent';
import PubSub from 'pubsub-js';
import * as firebase from 'firebase';

// links app to Firebase database
// a new firebase configuration has been created and not included for security reasons
const firebaseConfig =
{
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  storageBucket: "",
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

// store dimensions of user's screen
const devHeight = Dimensions.get('window').height;
const devWidth = Dimensions.get('window').width;

// height of status bar varies on Android and iOS
const statusBarHeight = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

const milSecPerHour = 3600000;

// listens for authentication state to change.
firebase.auth().onAuthStateChanged(
  function(user)
  {
    if(user != null)
      {
        console.log("We are authenticated now!");
        PubSub.publish('authentication', true);
      }
  });

// decorator necessary to call a jump to another tab
@withNavigation
export default class HomeScreen extends React.Component
{
  constructor(props)
  {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (Loading) => row1 !== row2});
    this.state =
    {
      loggedIn: false,
      friendsExist: true,
      fbfrienddata: "",
      objectdisplaydata: {},
      dataSource: this.ds.cloneWithRows(['Loading...']),
      authentication: false,
    };
  }



  /* Updates screen if log-in state changes.
   * If log-in state doesn't change, update only when data changes.
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.authentication !== this.state.authentication)
    {
      console.log("update HomeScreen as authentication has changed");
      return true;
    }
    if (nextState.loggedIn !== this.state.loggedIn)
    {
      console.log("update HomeScreen as loggedIn is now " + nextState.loggedIn);
      return true;
    }
    else
    {
      console.log("update HomeScreen as dataSource has changed");
      return JSON.stringify(nextState.dataSource) !== JSON.stringify(this.state.dataSource);
    }
  }

  render() {
    var homecomp = this;

    // listens for changes in login state
    var homeSubscriber = function(msg, data)
    {
      // upon user logout, resets data and switches view to HomeScreen
      if (!data)
      {
        console.log("user has now logged out");
        homecomp.setState({
          loggedIn: false,
          fbfrienddata: "",
          objectdisplaydata: {},
          dataSource: homecomp.ds.cloneWithRows(['Loading...'])
        });
        homecomp.props.navigation.performAction(({ tabs, stacks }) => {
          tabs('main').jumpToTab('home');
        });
      }
    }

  	var token = PubSub.subscribe('loggedin', homeSubscriber);

    // listens for changes in authentication
    var authSubscriber = function(msg, data)
    {
      // upon first authentication, reload screen
      if (data)
      {
        homecomp.setState({authentication: true});
      }
    }

    var tokentwo = PubSub.subscribe('authentication', authSubscriber);

    // displays logo and Facebook login button
    if (!this.state.loggedIn)
    {
      return (
        <View style={styles.container}>
          <StatusBar
            backgroundColor="white"
            barStyle="light-content"
          />
          <View>
            <Image
              style={styles.homeBG}
              source={require('../assets/images/background.jpg')}
            />
          </View>
          <View style={styles.imageContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/images/logo.png')}
            />
            <TouchableOpacity onPress={this._signInWithFacebook} style={styles.loginButtonContainer}>
              <Image style={styles.loginButton}
                source={require('../assets/images/login-button.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
    );

    }
    // return list of friends' info, if it exists
    else
    {
      var jsonfbdata = JSON.parse(this.state.fbfrienddata);
      var friendsExist = false;
      // loops over each friend in the friend list
      for (var i = 0; i < jsonfbdata.length; i++)
      {
        console.log("by now we MUST be Firebase authenticated already");
        // friend's Facebook ID
        var userId = jsonfbdata[i].id;
        if (firebase.auth().currentUser != null)
        {
          // accesses directory corresponding to the given friend
          firebase.database().ref('/users/' + userId).once('value').then(function(snapshot)
          {
            try
            {
              var userId = snapshot.key;

              // returns time elasped since friend has checked in
              var hoursFloat = (new Date().getTime() - parseInt(snapshot.val().time)) / milSecPerHour;
              var hours = Math.floor(hoursFloat);

              // rounds remainder to nearest 5 minutes
              var minutes = Math.round(((hoursFloat % 1) * 60) / 5) * 5;

              // large for testing purposes; will be 3 on release
              var timeThresh = 30000;
              if (hours <= timeThresh)
              {
                var tablenumber = snapshot.val().tablenumber;
                var name = snapshot.val().name;
                var objectcopy = JSON.parse(JSON.stringify(homecomp.state.objectdisplaydata));

                // if someone checked in <1 hour ago, "0h" is not shown
                let dispTime = hours > 0 ? hours + "h " + minutes : minutes;
                objectcopy[userId] = [name, tablenumber, hours, minutes, dispTime];
                var finaldisplaydata = [];

                // creates row of data for each friend
                for(var x in objectcopy)
                {
                  finaldisplaydata.push(objectcopy[x][0] + " - " + objectcopy[x][1] + " - " + objectcopy[x][4] + "m ago");
                }
                friendsExist = true;
                finaldisplaydata.sort();
                homecomp.setState({objectdisplaydata: objectcopy, dataSource: homecomp.ds.cloneWithRows(finaldisplaydata)});
              }
              console.log("found " + name);
            }
            catch (error)
            {
              console.log("One of the users has null data.");
              console.log("this was the error: " + error);
            }
          });
        }
      }
      if (friendsExist)
      {
        homecomp.setState({friendsExist: true});
      }
      if (this.state.friendsExist)
      {
        // returns list of friends with their data
        return (
          <View style={styles.container}>
            <StatusBar
              backgroundColor="white"
              barStyle="light-content"
            />
            <View>
              <Image
                style={styles.homeBG}
                source={require('../assets/images/metalBG.jpg')}
              />
            </View>
            <View style={styles.friendContainer}>
              <Text style={styles.friendTitle}>
                Friends
              </Text>
              <View style={{height: 20}}></View>
              <ListView
                style={{}}
                dataSource={this.state.dataSource}
                renderRow={(data) => <View><Text style={styles.friendText}>{data}</Text></View>}
              />
            </View>
          </View>
        );
      }
      else
      {
        return (
          <View style={styles.container}>
            <Text style={styles.friendContainer}>
              No friends found.
            </Text>
          </View>
        );
      }

    }
  }

  _signInWithFacebook = async () => {
    const result = await Facebook.logInWithReadPermissionsAsync('1501095743264612', {
      permissions: ['public_profile', 'email', 'user_friends'],
      behavior: Platform.OS === 'ios' ? 'web' : 'system',
    });

    if (result.type === 'success') {
      // pubsub in order to display the nav bar
      PubSub.publish('loggedin', true);

      // build Firebase credential with the Facebook access token.
      var credential = firebase.auth.FacebookAuthProvider.credential(result.token);

      // sign in with credential from the Facebook user.
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // handle Errors here.
        console.log("error signing into Firebase");
      });

      // fetch friend information from facebook
      let responseone = await fetch(`https://graph.facebook.com/me/friends?access_token=${result.token}`);
      let friendinfo = await responseone.json();
      this.setState({fbfrienddata: JSON.stringify(friendinfo.data), loggedIn: true});

      // fetch user fb id and corresponding data
      let responsetwo = await fetch(`https://graph.facebook.com/me?access_token=${result.token}`);
      let nameinfo = await responsetwo.json();

      // store fb data with fb id as key into global storage
      try
      {
        await AsyncStorage.setItem('sessionid', JSON.stringify(nameinfo));
        console.log("success storing session id");
        PubSub.publish('sessionexists', true);
      }
      catch (error)
      {
        console.log("error saving session id");
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  homeBG: {
    position: 'absolute',
    width: devWidth,
    height: devHeight,
    resizeMode: 'cover',
  },
  logo: {
    position: 'absolute',
    width: devWidth,
    resizeMode: 'contain',
  },
  loginButtonContainer: {
    width: 0.75*devWidth,
    height: 0.75*devWidth*159/713,
    marginTop: 150,
  },
  loginButton: {
    width: 0.75*devWidth,
    height: 0.75*devWidth*159/713,
    resizeMode: 'contain',
  },
  friendContainer: {
    marginLeft: 0.035*devWidth,
    marginTop: statusBarHeight,
  },
  friendTitle: {
    fontSize: 30,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontWeight: '500',
  },
  friendText: {
    color: 'white',
    backgroundColor: 'transparent',
    fontWeight: '500',
    lineHeight: 17,
  },
  imageContainer: {
    marginTop: .25*devHeight,
    alignItems: 'center',
  },
});
