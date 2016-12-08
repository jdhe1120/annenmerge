import React from 'react';
import Button from 'react-native-button';
import
{
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  AsyncStorage,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import
{
  ExponentLinksView,
} from '@exponent/samples';
import {
  withNavigation,
} from '@exponent/ex-navigation';


import * as firebase from 'firebase';
import { Facebook } from 'exponent';
import PubSub from 'pubsub-js';
import RootNavigation from '../navigation/RootNavigation'

const devWidth = Dimensions.get('window').width;
const devHeight = Dimensions.get('window').height;

@withNavigation
export default class SubmitScreen extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {text: ''};
  }

  /* Submits input on press */
  async _handlePress()
  {
    try
    {
      // get users name and fb id from the data that was stored before globally
      const userfbdata = await AsyncStorage.getItem('sessionid');

      // if the userdata is there, set userId to the fb id and usersName to the user's name
      if (userfbdata !== null)
      {
        var objectuserdata = JSON.parse(userfbdata);
        var userId = objectuserdata.id;
        var usersName = objectuserdata.name;
      }
    }
    catch (error)
    {
      console.log("error getting data from AsyncStorage");
    }

    // change the submitted number to upperacse
    var submitTableNum = this.state.text.toUpperCase();

    let length = submitTableNum.length;
    if (firebase.auth().currentUser != null)
    {
      // do form validation checking ensuring the table is A B C and <= 17
      if (length < 2 || length > 3)
      {
        Alert.alert('Error', 'Please insert a valid table number.');
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

          if (tableDigits <= 17)
          {
              // enter into database with user as key and tablenum and time as values
              firebase.database().ref('users/' + userId).set({
              name: usersName,
              tablenumber: submitTableNum,
              time: new Date().getTime(),
              });
              Alert.alert('Your table has been submitted!');
              this.props.navigation.performAction(({ tabs, stacks }) => {
                tabs('main').jumpToTab('home');
              });
          }
          else
          {
            Alert.alert('Error', 'The table number must be between 1 and 17.');
            this.setState({text: ''});
          }
        }
      }
    }
    PubSub.publish('newtablesubmit', true);
  }

  render()
  {
    return (
      <View>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Image
            style={{position: 'absolute', width: devWidth, height: devHeight, resizeMode: 'cover'}}
            source={require('../assets/images/metalBG.jpg')}
          />
          <Image
            style={{position: 'absolute', top: 0.15*devHeight, left: 0.1*devWidth, width: 0.8*devWidth, resizeMode: 'contain'}}
            source={require('../assets/images/submit-form.png')}
          />
          <TextInput
            underlineColorAndroid={'transparent'}
            style={{position: 'absolute', top: 0.41*devHeight, left: 0.35*devWidth, height: 35, borderColor: 'transparent', width: devWidth*0.3, textAlign:'center'}}
            onChangeText={(text) => this.setState({text})}
            value={this.state.text}
            selectTextOnFocus={true}
          />
          <TouchableOpacity onPress={() => this._handlePress()} style={{
              position: 'absolute',
              left: 0.25*devWidth,
              width: 0.5*devWidth, 
              height: 0.5*devWidth*76/265, 
              top: 0.55*devHeight,
              alignItems: 'center', 
              justifyContent: 'center'}}>
            <Image style={{width: 0.5*devWidth, height: 0.5*devWidth*76/265, resizeMode: 'contain'}}
              source={require('../assets/images/submit-metal.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    paddingTop: 15,
  },
});
