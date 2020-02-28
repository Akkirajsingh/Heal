/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import {
  TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView,
  View, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity, ImageBackground, Image, Dimensions
} from 'react-native';
import { FORGOT_PASS_RESEND_OTP, FORGOT_PASS_MOBILE_OTP } from '../constants/APIUrl';
import { AntDesign } from '@expo/vector-icons';
import {
  OTP_BLANK_ERR, OTP_INVALID_TYPO_ERR, OTP_VARIFIED_SUCCESS_MSG, INVALID_OTP_TYPO_ERR, OTP_SENT_SUCCESS_MSG
} from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
let FORGOT_PASS_RESEND_OTP_URL = FORGOT_PASS_RESEND_OTP;
let FORGOT_PASS_MOBILE_OTP_URL = FORGOT_PASS_MOBILE_OTP;
let CONNECTION_STATUS = false;

class OtpPage extends Component {
  constructor(props) {
    super(props);
    this.state = { OtpData: '', type: '', OtpData1: '', isSending: false, OtpData2: '', Service_URL: '', OtpData3: '', OtpData4: '', OtpData5: '', phoneNo: '', securityQues: false, Forgotpassword_text: '', OTPVerifiedStatus: false, FirstSA: '', SecondSA: '', ThirdSA: '', SecurityQues: [], Name: '' };
  }
  async componentDidMount() {
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }

    const { params } = this.props.navigation.state;
    console.log("params", params)
    if (!Utility.IsNullOrEmpty(params)) {
      let type = params.type;
      if (type == "SignUp") {
        Service_URL = params.Service_URL;
        FORGOT_PASS_RESEND_OTP_URL = `${Service_URL}api/PatientSignUp/ResendForgotPWDMobileOTP`;
        FORGOT_PASS_MOBILE_OTP_URL = `${Service_URL}api/PatientSignUp/ForgotPwdMobOTP`;
      }
      console.log(FORGOT_PASS_RESEND_OTP_URL);
      console.log(FORGOT_PASS_MOBILE_OTP_URL);
      this.setState({
        Name: params.Name,
        phoneNo: params.phoneNo,
        Service_URL: Service_URL,
        type: type
      });
      console.log("Name", this.state.Name);
      console.log("phoneNo", this.state.phoneNo);
    }
  }
  /************************************** componentWillUnmount ********************************************/
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
  }
  /*************************************************Textbox Key Event **************************************/
  OTPKeyEvent(index, value) {
    if (value.length == 0) return;
    if (index == 0) {
      this.secondTextInput.focus();
    } else if (index == 1) {
      this.thirdTextInput.focus();
    }
    if (index == 2) {
      this.fourthTextInput.focus();
    }
    if (index == 3) {
      this.fifthTextInput.focus();
    }
    if (index == 4) {
      this.sixthTextInput.focus();
    }
    if (index == 5) {
      this.sixthTextInput.blur();
    }
  }
  /*************************ForgotPassOTP Verify *******************************************************/
  ForgtPassOTPVerify = () => {
    this.setState({ isSending: true });
    // this.GetSecurityQuestion();
    const otpInput = this.state.OtpData + this.state.OtpData1 +
      this.state.OtpData2 + this.state.OtpData3 + this.state.OtpData4 + this.state.OtpData5;
    if (otpInput == '') {
      ToastAndroid.showWithGravity(
        OTP_BLANK_ERR,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
      this.setState({
        isSending: false
      }); return;
    } else if (otpInput.length < 6 || otpInput.length >= 7) {
      ToastAndroid.showWithGravity(
        OTP_INVALID_TYPO_ERR,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      ); this.setState({
        isSending: false
      }); return;
    }
    const { params } = this.props.navigation.state;
    const OtpNum = `Name=${params.Name}&MobileOTP=${otpInput}&phone=${params.phoneNo}`;
    console.log("OtpNum", OtpNum);
    fetch(FORGOT_PASS_MOBILE_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: OtpNum
    })//.then(aPIStatusInfo.handleResponse)
      .then((response) => response.json())
      .then((res) => {
        console.log("otpres", res);
        if (res.statusCode == 409) {
          ToastAndroid.showWithGravity(
            INVALID_OTP_TYPO_ERR,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({
            isSending: false
          }); return;
        } else if (res.statusCode == 500) {
          ToastAndroid.showWithGravity(
            'Server error has occured',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({
            isSending: false
          }); return;
        }
        if (res.message.indexOf('OTP Verified Sucessfully') > -1) {
          ToastAndroid.showWithGravity(
            OTP_VARIFIED_SUCCESS_MSG,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({ isSending: false }, function () {
            this.props.navigation.navigate('ResetPassword', {
              Name: params.Name, Service_URL: this.state.Service_URL, type:this.state.type
          });
            });
          }
      })
      .catch(() => {
        this.setState({
          isSending: false,
        });
        const errMSg = '';
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      });
  }
  /***************************************end Forgotpassword OTP *********************************************************/

  /************************************Resend Email OTP  **************************************************************/
  ResendOTP = () => {
    const { params } = this.props.navigation.state;
    const ResendOtpData = `Username=${params.Name}&phone=${params.phoneNo}&MobileOTPLimit=1`;
    fetch(FORGOT_PASS_RESEND_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: ResendOtpData
    })//.then(aPIStatusInfo.handleResponse)
      .then((response) => response.json())
      .then((res) => {
        console.log("resendOTP", res);
        if (res.statusCode == 409) {
          ToastAndroid.showWithGravity(
            INVALID_OTP_TYPO_ERR,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({
            isSending: false
          }); return;
        } else if (res.statusCode == 500) {
          ToastAndroid.showWithGravity(
            'Server Error has occured',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({
            isSending: false
          }); return;
        } else {
          ToastAndroid.showWithGravity(
            OTP_SENT_SUCCESS_MSG,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      }).catch(() => {
        this.setState({
          isSending: false
        });
        const errMSg = '';
        this.props.dispatch(ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        ));
      });
  }
  /************************************** End of Resend Email OTP **************************************************************/
  render() {
    const { goBack } = this.props.navigation;
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <ScrollView keyboardShouldPersistTaps='always'>
          {/* <ImageBackground source={require('../assets/images/ForgotpasswordBG.jpg')} style={{ width: '100%', height: '100%' }}> */}
            <View style={styles.mainContainer}>
              <AntDesign
                onPress={() => goBack()}
                style={{ fontSize: 30, width: '12%', alignItems: 'flex-start', justifyContent: 'flex-start', color: '#000', marginLeft: 5, marginTop: 12 }}
                name='arrowleft'
              />
              <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
                <Text style={{ fontSize: 22, color: '#000000', marginLeft: 10, fontWeight: 'bold' }}>Verification</Text>
              </View>
              <View
                style={{
                  padding: 20, alignItems: 'center', justifyContent: 'center'
                }}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={require('../assets/images/OTP-Verification-illustration.png')} style={{ width: 170, height: 170 }} />
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, marginBottom: 20, color: '#000', fontWeight: 'bold' }}>We have an OTP on your number {"\n"}       </Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={styles.OtpinputField}
                    // autoFocus
                    // placeholder={'x'}
                    keyboardType={'numeric'}
                    maxLength={1}
                    value={this.state.OtpData}
                    placeholderTextColor={'#8ECAE0'}
                    secureTextEntry={false}
                    onChangeText={(OtpData) => { this.OTPKeyEvent(0, OtpData); this.setState({ OtpData }); }}
                    onSubmitEditing={() => { this.secondTextInput.focus(); }}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.OtpinputField}
                    maxLength={1}
                    keyboardType={'numeric'}
                    value={this.state.OtpData1}
                    placeholderTextColor={'#8ECAE0'}
                    secureTextEntry={false}
                    onChangeText={(OtpData1) => { this.OTPKeyEvent(1, OtpData1); this.setState({ OtpData1 }); }}
                    ref={(input) => { this.secondTextInput = input; }}
                    onSubmitEditing={() => { this.thirdTextInput.focus(); }}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.OtpinputField}
                    maxLength={1}
                    keyboardType={'numeric'}
                    value={this.state.OtpData2}
                    placeholderTextColor={'#8ECAE0'}
                    secureTextEntry={false}
                    onChangeText={(OtpData2) => { this.OTPKeyEvent(2, OtpData2); this.setState({ OtpData2 }); }}
                    ref={(input) => { this.thirdTextInput = input; }}
                    onSubmitEditing={() => { this.fourthTextInput.focus(); }}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.OtpinputField}
                    maxLength={1}
                    keyboardType={'numeric'}
                    placeholderTextColor={'#8ECAE0'}
                    value={this.state.OtpData3}
                    secureTextEntry={false}
                    onChangeText={(OtpData3) => { this.OTPKeyEvent(3, OtpData3); this.setState({ OtpData3 }); }}
                    ref={(input) => { this.fourthTextInput = input; }}
                    onSubmitEditing={() => { this.fifthTextInput.focus(); }}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.OtpinputField}
                    maxLength={1}
                    keyboardType={'numeric'}
                    placeholderTextColor={'#8ECAE0'}
                    secureTextEntry={false}
                    value={this.state.OtpData4}
                    onChangeText={(OtpData4) => { this.OTPKeyEvent(4, OtpData4); this.setState({ OtpData4 }); }}
                    ref={(input) => { this.fifthTextInput = input; }}
                    onSubmitEditing={() => { this.sixthTextInput.focus(); }}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    style={styles.OtpinputField}
                    maxLength={1}
                    keyboardType={'numeric'}
                    placeholderTextColor={'#8ECAE0'}
                    value={this.state.OtpData5}
                    secureTextEntry={false}
                    onChangeText={(OtpData5) => { this.OTPKeyEvent(5, OtpData5); this.setState({ OtpData5 }); }}
                    ref={(input) => { this.sixthTextInput = input; }}
                  />
                </View>
                <View style={{ margin: 16 }} />

                <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                  <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.ForgtPassOTPVerify()}>
                    <View style={{ flexDirection: 'row' }}>
                      {this.state.isSending ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 9 }} /> : undefined}
                      <Text
                        style={styles.LoginButton}
                      >
                        Verify
                          </Text>
                    </View>
                  </TouchableOpacity>
                </View>
             
                <View
                  style={{ flexDirection: 'row', marginTop: 10 }}>
                  <Text style={{ color: '#7a7a7a', fontSize: 15 }}>
                    Didn't received OTP?    
                        </Text>
                  <Text
                    style={{
                      color: '#0da4da', fontWeight: 'bold', fontSize: 15
                    }}
                    onPress={() => this.ResendOTP()}
                  > RESEND OTP
                        </Text>
                </View>
              </View>
              </View>
          {/* </ImageBackground> */}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  inputField: {
    height: 35, width: '10%', marginBottom: 20, color: '#333333', paddingLeft: 10, marginRight: 10, backgroundColor: '#ffffff00', borderWidth: 0.6, borderColor: '#3AA6CD', borderRadius: 5
  },
  inputField1: {
    height: 35, width: '100%', marginBottom: 20, color: '#333333', paddingLeft: 10, marginRight: 10, backgroundColor: '#ffffff00', borderRadius: 5, borderColor: '#3AA6CD', borderWidth: 0.6
  },
  OtpinputField: {
    height: 35, width: '10%', marginBottom: 20, color: '#333333', paddingLeft: 10, marginRight: 10, backgroundColor: '#ffffff00', borderBottomWidth: 0.6, borderBottomColor: '#3AA6CD',
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
    width: (Dimensions.get('window').width) / 2 - 20,
    borderWidth: 2,
    borderColor: '#3aa6cd',
    borderRadius: 5,
    elevation: 1,
    fontWeight: 'bold',
    flexDirection: 'row'
  },
  LoginButton: {
    color: 'white',
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17
  },
});
export default OtpPage;
