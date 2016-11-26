import React from 'react';
import Button from 'react-native-button';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  AsyncStorage,
} from 'react-native';
import {
  ExponentLinksView,
} from '@exponent/samples';

import * as firebase from 'firebase';

export default class LinksScreen extends React.Component {
  constructor(props) {
      super(props);
      this.state = {text: 'Enter table number:'};
    }

  async _handlePress()
  {
    try {
  const nameinfo = await AsyncStorage.getItem('sessionid');
  if (nameinfo !== null){
    // We have data!!
    console.log(nameinfo);
    var jsonnameinfo = JSON.parse(nameinfo);
  }
} catch (error) {
  console.log("error getting data");
}

    var submittablenum = this.state.text;

    var userId = jsonnameinfo.id;

    firebase.database().ref('users/' + userId).set({
      name: jsonnameinfo.name,
      tablenumber: submittablenum,
    });
  }
  static route = {
    navigationBar: {
      title: 'Links',
    },
  }

  render() {
    return (

      <View><TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => this.setState({text})}
        value={this.state.text}
        selectTextOnFocus={true}
      />
      <Button
        style={{fontSize: 20, color: 'green'}}
        styleDisabled={{color: 'red'}}
        onPress={() => this._handlePress()}>
        Press Me!
      </Button>
      </View>

    );
  }

}

const onButtonPress = () => {
  Alert.alert('Submit');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
});
