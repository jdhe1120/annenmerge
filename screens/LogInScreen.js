import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
  ListView,
} from 'react-native';

import { MonoText } from '../components/StyledText';
import { Facebook } from 'exponent';
import PubSub from 'pubsub-js';
import * as firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "annenmerge-94bee.firebaseapp.com",
  databaseURL: "https://annenmerge-94bee.firebaseio.com/",
  storageBucket: "gs://annenmerge-94bee.appspot.com",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default class LogInScreen extends React.Component {

  constructor(props)
  {
    super(props);

    this.ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
    this.state = {
      loggedIn: false,
      friendlist: "",
      arrayversion: {},
      dataSource: this.ds.cloneWithRows(['row 1', 'row 2']),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState.loggedIn);
    console.log(this.state.loggedIn);
    if (nextState.loggedIn !== this.state.loggedIn)
    {
      console.log("test");
      return true;
    }
    else {
      return JSON.stringify(nextState.dataSource) !== JSON.stringify(this.state.dataSource);
    }
  }

  render() {

    var thattwo = this;

    var mySubscriber = function(msg, data)
    {
      if (data !== true)
      {
          console.log("#1 this is leading to an erorr!!");
          thattwo.setState({loggedIn: false});
        }
    }
  	var token = PubSub.subscribe('loggedin', mySubscriber);


    if (!this.state.loggedIn)
    {
        return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>

          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/images/exponent-wordmark.png')}
              style={styles.welcomeImage}
            />
          </View>


          <View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}

            <Text style={styles.getStartedText}>
              Get started by opening -- testing
            </Text>

            <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
              <MonoText style={styles.codeHighlightText}>
                screens/HomeScreen.js
              </MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Change this text and your app will automatically reload.
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._signInWithFacebook} style={styles.helpLink}>
              <Text>
                Login with Facebook
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </View>
    );

    }
    else
    {
        console.log("is this being run too much?");
        var jsondata = JSON.parse(this.state.friendlist);

        var that = this;

        for (var i = 0; i < jsondata.length; i++)
        {

        var userId = jsondata[i].id;

        firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {

          var tablenumber = snapshot.val().tablenumber;
          var name = snapshot.val().name;
          var temp = JSON.parse(JSON.stringify(that.state.arrayversion));
          temp[name] = tablenumber;

          var temparray = [];

            for(var x in temp){
              temparray.push(x + " " + temp[x]);
            }

            that.setState({arrayversion: temp, dataSource: that.ds.cloneWithRows(temparray)});
        });

      }


        return (
          // <View>
            <ListView
      style={styles.container}
      dataSource={this.state.dataSource}
      renderRow={(data) => <View><Text>{data}</Text></View>}
          >

          <TouchableOpacity onPress={this._logOutWithFacebook} style={styles.helpLink}>
              <Text>
                Logout with Facebook
              </Text>
            </TouchableOpacity>

          </ListView>

        );

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

      let responseone = await fetch(`https://graph.facebook.com/me/friends?access_token=${result.token}`);
      let friendinfo = await responseone.json();
      this.setState({loggedIn: true, friendlist: JSON.stringify(friendinfo.data)});

      let responsetwo = await fetch(`https://graph.facebook.com/me?access_token=${result.token}`);
      let nameinfo = await responsetwo.json();

      try {
        await AsyncStorage.setItem('sessionid', JSON.stringify(nameinfo));
        console.log("success storing session id");
      } catch (error) {
        console.log("error saving session id");
      }


    }
  }

  _logOutWithFacebook = async () => {

      try {
        await AsyncStorage.removeItem('sessionid');
        console.log("success deleting sessionid");
      } catch (error) {
        console.log("error deleting session id");
      }

      this.setState({loggedIn: false});
      PubSub.publish('loggedin', false);
    }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will run slightly slower but
          you have access to useful development tools. {learnMoreButton}.
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    Linking.openURL('https://docs.getexponent.com/versions/latest/guides/development-mode');
  }

  _handleHelpPress = () => {
    Linking.openURL('https://docs.getexponent.com/versions/latest/guides/up-and-running.html#can-t-see-your-changes');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 15,
    textAlign: 'center',
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
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
