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
import {
  withNavigation,
} from '@exponent/ex-navigation';

import { MonoText } from '../components/StyledText';
import { Facebook } from 'exponent';
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

const firebaseApp = firebase.initializeApp(firebaseConfig);

const devHeight = Dimensions.get('window').height;
const devWidth = Dimensions.get('window').width;
const statusBarHeight = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;
const milSecPerHour = 3600000;

// Listen for authentication state to change.
firebase.auth().onAuthStateChanged(
    function(user) {
        if(user != null) {
            console.log("We are authenticated now!");
        }
    });

@withNavigation
export default class HomeScreen extends React.Component {

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
    };
  }



  /* Updates screen if log-in state changes. If log-in state doesn't change, update only when data changes. */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loggedIn !== this.state.loggedIn)
    {
      console.log("update HomeScreen component as loggedIn is now " + nextState.loggedIn);
      return true;
    }
    else
    {
      return JSON.stringify(nextState.dataSource) !== JSON.stringify(this.state.dataSource);
    }
  }

  render() {

    var homecomp = this;

    var homeSubscriber = function(msg, data)
    {
      if (!data)
      {
        console.log("user has now logged out");
        homecomp.setState({loggedIn: false});
        homecomp.props.navigation.performAction(({ tabs, stacks }) => {
          tabs('main').jumpToTab('home');
        });
      }
    }
  	var token = PubSub.subscribe('loggedin', homeSubscriber);

    if (!this.state.loggedIn)
    {
      return (
        <View style={styles.container}>
          <StatusBar
            backgroundColor="white"
            barStyle="light-content"
          />
          <View style={{}}>
            <Image
              style={{position: 'absolute', width: devWidth, height: devHeight, resizeMode: 'cover'}}
              source={require('../assets/images/background.jpg')}
            />
          </View>
          <View style={styles.imageContainer}>
            <Image
              style={{position: 'absolute', width: devWidth, resizeMode: 'contain'}}
              source={require('../assets/images/logo.png')}
            />
            <TouchableOpacity onPress={this._signInWithFacebook} style={{width: 0.75*devWidth, height: 0.75*devWidth*159/713, marginTop: 150}}>
              <Image style={{width: 0.75*devWidth, height: 0.75*devWidth*159/713, resizeMode: 'contain'}}
                source={require('../assets/images/login-button.png')}
              />
            </TouchableOpacity>
          </View>

        </View>
    );

    }
    else
    {
      var jsonfbdata = JSON.parse(this.state.fbfrienddata);
      var friendsExist = false;
      /* Loops over each friend in the friend list */
      for (var i = 0; i < jsonfbdata.length; i++)
      {
        var userId = jsonfbdata[i].id;
        if (firebase.auth().currentUser != null)
        {
          firebase.database().ref('/users/' + userId).once('value').then(function(snapshot)
          {
            try
            {
              var userId = snapshot.key;
              var hoursFloat = (new Date().getTime() - parseInt(snapshot.val().time)) / milSecPerHour;
              var hours = Math.floor(hoursFloat);

              /* Rounds remainder to nearest 5 minutes */
              var minutes = Math.round(((hoursFloat % 1) * 60) / 5) * 5;
              if (hours <= 300000)
              {
                var tablenumber = snapshot.val().tablenumber;
                var name = snapshot.val().name;
                var objectcopy = JSON.parse(JSON.stringify(homecomp.state.objectdisplaydata));

                /* If someone checked in <1 hour ago, "0h" is not shown */
                let dispTime = hours > 0 ? hours + "h " + minutes : minutes;
                objectcopy[userId] = [name, tablenumber, hours, minutes, dispTime];
                var finaldisplaydata = [];

                /* Creates row of data for each friend */
                for(var x in objectcopy)
                {
                  finaldisplaydata.push(objectcopy[x][0] + " - " + objectcopy[x][1] + " - " + objectcopy[x][4] + "min ago");
                }
                friendsExist = true;
                homecomp.setState({objectdisplaydata: objectcopy, dataSource: homecomp.ds.cloneWithRows(finaldisplaydata)});
              }
            }
            catch (error)
            {
              console.log("One of the users has null data.");
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
        return (
          <View style={styles.container}>
            <ListView
            style={{marginLeft: 0.025*devWidth, marginTop: statusBarHeight}}
            dataSource={this.state.dataSource}
            renderRow={(data) => <View><Text>{data}</Text></View>}
            />
          </View>
        );
      }
      else
      {
        return (
          <View style={styles.container}>
            <Text style={{marginLeft: 0.025*devWidth, marginTop: statusBarHeight}}>
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
      PubSub.publish('loggedin', true);

      // Build Firebase credential with the Facebook access token.
      var credential = firebase.auth.FacebookAuthProvider.credential(result.token);

      // Sign in with credential from the Facebook user.
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        console.log("error signing into Firebase");
      });

      // fetch friend information from facebook
      let responseone = await fetch(`https://graph.facebook.com/me/friends?access_token=${result.token}`);
      let friendinfo = await responseone.json();
      this.setState({loggedIn: true, fbfrienddata: JSON.stringify(friendinfo.data)});

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
  loginBG: {
    flex: 1,
    resizeMode: 'contain',
    width: null,
    height: null,
  },
  loginBG2: {
    width: 500,
    height: 500,
  },
  contentContainer: {
    paddingTop: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 200,
    height: 34.5,
    marginTop: 3,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 23,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  imageContainer: {
    marginTop: .25*devHeight,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 150,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
