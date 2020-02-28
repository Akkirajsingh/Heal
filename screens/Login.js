/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import {
  TextInput, Image, ScrollView, StyleSheet, Text, KeyboardAvoidingView, Platform, AlertIOS,
  AsyncStorage, View, ToastAndroid, Dimensions, StatusBar, NetInfo, ActivityIndicator, TouchableOpacity, ImageBackground
} from 'react-native';
import { LOGIN_MSG } from '../constants/Lebel';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { Entypo } from '@expo/vector-icons';
import { VALIDATION_ERR, VALIDATION_EMAIL_ERR, INTERNET_CONN_ERR } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { LOGIN_TOKEN_URL, USER_PROFILE } from '../constants/APIUrl';
import Utility from '../components/Utility';

let CONNECTION_STATUS = false;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '', isLoading: true, iconName: 'eye-with-line', isLoggingIn: false, hidePassword: true, };
    this.props.navigation.addListener(
      'didFocus',
      async () => {
        this.setState({ username: '', password: '' });
      }
    );
  }
  async componentDidMount() {
    let USER_DATA = await AsyncStorage.getItem('USER_DATA');
    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
    if (USER_DATA.ACCESS_TOKEN != null) {
      this.setState({
        isLoading: false
      });
      this.props.navigation.navigate('Dashboard');
    } else {
      this.setState({
        isLoading: false
      });
    }
  }
  /***
 * toggle password
 * */
  togglePassword = () => {
    if (this.state.hidePassword) {
      this.setState({
        hidePassword: false,
        iconName: 'eye'
      });
    } else {
      this.setState({
        hidePassword: true,
        iconName: 'eye-with-line'
      });
    }
  };
  /**
* Login starts
*/
  async Login() {
    console.log(LOGIN_TOKEN_URL);
    this.setState({ isLoggingIn: true });
    const { username, password } = this.state;
    // let username="akki";
    // let password="Pass@1234";
    const { navigate } = this.props.navigation;
    const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    if (!CONNECTION_STATUS) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          INTERNET_CONN_ERR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(INTERNET_CONN_ERR);
      }
      this.setState({ isLoggingIn: false }); return;
    }
    if (username === '' || password === '') {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          VALIDATION_ERR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(VALIDATION_ERR);
      }
      this.setState({ isLoggingIn: false }); return;
    }

    const data = `grant_type=password&username=${username.trim()}&password=${password}&scope=patient`;
    console.log("data", data)
    fetch(LOGIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: data
    }).then((response) => response.json()).then((res) => {
      if (res.hasOwnProperty('error')) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            res.error_description,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        } else {
          AlertIOS.alert(res.error_description);
        }
        this.setState({ isLoading: false, isLoggingIn: false });
      } else {
        const loginAsync = res;
        loginAsync.fullName = res.fullName;
        loginAsync.ACCESS_TOKEN = res.access_token;
        loginAsync.User_Id = res.userId;
        loginAsync.userName = res.userName;
        loginAsync.Id = res.id;
        loginAsync.LastLogin_Date = res.LastLoginDate;
        loginAsync.HealId = res.HealId;
        loginAsync.token_type = res.token_type;
        loginAsync.expires_in = res.expires_in;
        loginAsync.emailId = res.emailId;
        loginAsync.roles = res.roles;
        loginAsync.modules = res.modules;
        loginAsync.StaffId = res.StaffId;
        loginAsync.PracticeCode = res.PracticeCode;
        loginAsync.PracticeId = res.PracticeId;
        loginAsync['.issued'] = res['.issued'];
        loginAsync['.expires'] = res['.expires'];
        AsyncStorage.setItem('USER_DATA', JSON.stringify(loginAsync)).then(() => {
          fetch(USER_PROFILE, {
            method: 'POST',
            headers: {
              'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `id=${res.userId}`
          }).then(aPIStatusInfo.handleResponse).then((resp) => resp.json()).then((respon) => {
            const dashBoardData = {};
            dashBoardData.ProfileImage = respon.responseData[0].photoContent;
            dashBoardData.gender = respon.responseData[0].gender;
            dashBoardData.email_id = respon.responseData[0].otherEmail;
            dashBoardData.firstName = respon.responseData[0].firstName;
            AsyncStorage.setItem('DASHBOARD_DATA', JSON.stringify(dashBoardData)).then(() => {
              this.setState({ isLoading: false, isLoggingIn: false, });
              navigate('Dashboard');
            });
          }).catch(err => {
            this.setState({ isLoading: false, isLoggingIn: false, });
            const errMSg = '';
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } else {
              AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
            }
          });
        });
      }
    }).catch(err => {
      this.setState({
        isLoggingIn: false,
      });
      const errMSg = '';
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
      }
    });
  }
  //end login
  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}
        >
          <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
        </View>
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" enabled >
        <StatusBar hidden />
        <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} >
          <View style={styles.mainContainer}>
            <ImageBackground source={require('../assets/images/backgroundImage.jpg')} style={{ width: '100%', height: '100%' }}>
              <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 30, color: '#000000', marginLeft: 20, fontWeight: 'bold' }}>{LOGIN_MSG}</Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                  <Image source={require('../assets/images/Heal-Logo1.png')} style={{ width: 170, height: 170 }} />
                </View>
                </View>
                <View style={{ paddingLeft: 15, paddingRight: 15 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>UserName</Text>
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder={'Enter Username'}
                  // keyboardType={'email-address'}
                  value={this.state.username}
                  keyboardType={'email-address'}
                  secureTextEntry={false}
                  onChangeText={(username) => this.setState({ username })}
                  // placeholderTextColor="#000000"
                />
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>Password</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TextInput
                    value={this.state.password}
                    style={styles.inputField}
                    placeholder='Enter Password'
                    secureTextEntry={this.state.hidePassword}
                    onChangeText={password => this.setState({ password })}
                    // placeholderTextColor="#000000"
                    autoCapitalize='none'
                  />
                  <Entypo name={this.state.iconName} size={16} style={{ color: '#0da4da', top: 10, right: 25 }} onPress={() => this.togglePassword()} />
                </View></View>
              <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.Login()}>
                  <View style={{ flexDirection: 'row' }}>
                    {this.state.isLoggingIn ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 9 }} /> : undefined}
                    <Text
                      style={styles.LoginButton}
                    >
                      Login
                          </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 17, alignItems: 'center', justifyContent: 'center' }} >
                <Text
                  style={{ textAlign: 'right', color: '#000000', fontWeight: 'bold', fontSize: 15 }}
                  onPress={() => this.props.navigation.navigate('ForgotPassword1', { type: 'Patientsignup' })}
                >Forgot password?</Text>
              </View>
              <View
                style={styles.SignUpLinkBottom}
              >
                <Text style={{ color: '#7a7a7a', fontSize: 15 }}>
                  Don't have an account?
                        </Text>
                <Text
                  style={{
                    color: '#3aa6cd', fontWeight: 'bold', fontSize: 15
                  }}
                  onPress={() => this.props.navigation.navigate('Register1', { type: 'PatientSignup' })}
                > Sign up
                        </Text>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      </KeyboardAvoidingView >
    );
  }
}
const styles = StyleSheet.create({
  inputField: {
    width: '100%',
    marginBottom: 27,
    color: '#000000',
    fontSize: 14,
    // paddingLeft: 10,
    padding: 2,
    backgroundColor: '#ffffff00',
    borderBottomWidth: 2,
    borderBottomColor: '#86d1ec'
  },
  LoginButton: {
    color: 'white',
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17
  },
  SignUpLinkBottom: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1,
    width: (Dimensions.get("window").width)
  },
  label_text: {
    fontSize: 15, color: 'black', fontWeight: 'bold'
},
  cusButtonLargeGreen1: {
    backgroundColor: '#0da4da',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 15,
    color: 'white',
    width: (Dimensions.get('window').width) - 20,
    borderWidth: 2,
    borderColor: '#3aa6cd',
    borderRadius: 5,
    elevation: 1,
    fontWeight: 'bold',
    flexDirection: 'row'
  },
  mainContainer: { height: DEVICE_HEIGHT, width: DEVICE_WIDTH }
});
export default Login;
