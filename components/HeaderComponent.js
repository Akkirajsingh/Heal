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
import Layout from '../screens/Layout';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { withNavigation} from 'react-navigation';

class HeaderComponent extends Component {
    render() {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', top:20}}>
                <AntDesign onPress={() => this.props.navigation.goBack(null)} style={{ fontSize: 30, paddingTop:20, textAlign: 'center', color: '#41b4af00'}} name='arrowleft' />
                <Image source={require('../assets/images/logoWhite.png')}/>
                <Entypo onPress={()=>this.toggleDrawer()} style={{ fontSize: 30, paddingTop:20, textAlign: 'center', color: '#41b4af'}} name='menu' />
              </View>
        );
    }
    toggleDrawer = ()=>{
    //alert('here')
    if(this.state.showMenu){
        this.setState({
            showMenu:false
        });
    }else{
        this.setState({
            showMenu:true
        });
    }
}
  closeDrawer = () =>{
      this.setState({
            showMenu:false
        });
  }
}
export default withNavigation(HeaderComponent)