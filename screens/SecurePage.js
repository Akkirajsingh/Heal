import React, { Component } from 'react';
import {
  TextInput,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';

class Secured extends Component {
  render() {
    return (
      <ScrollView style={{padding: 20}}>
        <Text 
          style={{fontSize: 27}}>
          Welcome
        </Text>
        <View style={{margin:20}} />
        <Text style={styles.cusButtonLargeGreen} onPress={()=>this.props.navigation.navigate('Login')}>
          Logout
        </Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  cusButtonLargeGreen: {
      backgroundColor: '#41b4af',
      paddingTop: 5,
      paddingBottom:5,
      paddingLeft: 10,
      paddingRight:10,
      width: '100%',
      textAlign:'center',
      fontSize:25,
      color:'white'
  },
});


export default Secured