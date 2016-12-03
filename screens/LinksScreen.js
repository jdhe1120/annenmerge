import React from 'react';
import Button from 'react-native-button';
import
{
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableOpacity,
} from 'react-native';
import
{
  ExponentLinksView,
} from '@exponent/samples';

import * as firebase from 'firebase';
import { Facebook } from 'exponent';
import PubSub from 'pubsub-js';

export default class LinksScreen extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {text: 'Enter table number:'};
  }

  {/* Submits input on press */}
  async _handlePress()
  {
    try
    {
      const nameinfo = await AsyncStorage.getItem('sessionid');
      if (nameinfo !== null)
      {
        // We have data!!
        console.log(nameinfo);
        var jsonnameinfo = JSON.parse(nameinfo);
      }
    }
    catch (error)
    {
      console.log("error getting data");
    }

    var submitTableNum = this.state.text.toUpperCase();

    var userId = jsonnameinfo.id;

    let length = submitTableNum.length;

    { /* Form validation */}
    if (length < 2 || length > 3)
    {
      Alert.alert('Error', 'Insert a valid table number.');
      this.setState({text: ''});
    }
    else
    {
      var tableLetter = submitTableNum[0];
      if (tableLetter != "A" && tableLetter != "B" && tableLetter != "C")
      {
        Alert.alert('Error', 'Your table should start with A, B, or C.');
      }
      else
      {
        var tableDigits = parseInt(submitTableNum.substring(1));

      {/* Enters a valid table number into Firebase */}
        if (tableDigits <= 17)
        {

            firebase.database().ref('users/' + userId).set({
            name: jsonnameinfo.name,
            tablenumber: submitTableNum,
            time: new Date().getTime(),
            });
            Alert.alert('Your table has been submitted!');
        }
        else
        {
          Alert.alert('Error', 'The table number must be between 1 and 17.');
          this.setState({text: ''});
        }
      }
    }
  }
  static route = 
  {
    navigationBar: 
    {
      title: 'Check In',
    },
  }

  render() 
  {
    return (
      <View>
      <View><TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => this.setState({text})}
        value={this.state.text}
        selectTextOnFocus={true}
      />
      <Button
        style={{fontSize: 20, color: 'black'}}
        styleDisabled={{color: 'red'}}
        onPress={() => this._handlePress()}>
        Submit
      </Button>

      <Text>
      </Text>

      <TouchableOpacity onPress={this._logOutWithFacebook} style={styles.helpLink}>
          <Text>
            Logout with Facebook
          </Text>
        </TouchableOpacity>
      </View>

      </View>

    );
  }

  _logOutWithFacebook = async () => 
  {
      try 
      {
        await AsyncStorage.removeItem('sessionid');
        console.log("success deleting sessionid");
      } 
      catch (error) 
      {
        console.log("error deleting session id");
      }
      this.props.navigator.replace('logIn');
      // this.props.navigator.pop('links');
      // this.setState({loggedIn: false});
      PubSub.publish('loggedin', false);
  }
}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    paddingTop: 15,
  },
});
