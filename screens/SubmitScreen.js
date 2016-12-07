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
  Dimensions
} from 'react-native';
import
{
  ExponentLinksView,
} from '@exponent/samples';
import{
  withNavigation,
} from '@exponent/ex-navigation';


import * as firebase from 'firebase';
import { Facebook } from 'exponent';
import PubSub from 'pubsub-js';
import RootNavigation from '../navigation/RootNavigation'
@withNavigation
export default class SubmitScreen extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {text: 'Enter table number'};
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
  }

  render()
  {
    var width = Dimensions.get('window').width;
    var height = Dimensions.get('window').height;
    return (
      <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <View style={{flex: 0.4}}></View>
        <View style={{flex: 0.2, backgroundColor: 'gainsboro', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center'}}>
            <Text></Text>
            <View style={{}}>
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 2, width: width*0.8, textAlign:'center', borderRadius: 10}}
                onChangeText={(text) => this.setState({text})}
                value={this.state.text}
                selectTextOnFocus={true}
              />
            </View>
            <Text></Text>
            <Button
              style={{fontSize: 20, color: 'black'}}
              styleDisabled={{color: 'red'}}
              onPress={() => this._handlePress()}>
              Submit
            </Button>
        </View>
        <View style={{flex: 0.4}}><Text></Text></View>
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
