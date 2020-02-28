import React, { Component } from 'react';
import {
  TextInput,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Button,
  TouchableOpacity,
  AsyncStorage,
  View,
  ImageBackground,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

class Layout extends Component {

  render() {
    return (
      <View style={{flex:1}}>
        <ImageBackground source={require('../assets/images/bg.jpg')}
          style={styles.backgroundImage}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', top:20}}>
            <AntDesign style={{ fontSize: 30, paddingTop:20, textAlign: 'center', color: '#41b4af'}} name='arrowleft' />
            <Image source={require('../assets/images/logoWhite.png')}/>
            <Entypo style={{ fontSize: 30, paddingTop:20, textAlign: 'center', color: '#41b4af'}} name='menu' />
          </View>

          {this.props.children}
          
          <View style={{flexDirection: 'row', justifyContent: 'center', bottom:0}}>
            <Text style={{color:"white",alignItems:"center"}}>
              Copyrights © 2018 Patient Care Terms & Conditions
            </Text>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover'
  },
});

export default Layout