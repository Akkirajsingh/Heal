/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, View, Platform, AlertIOS, ToastAndroid, ActivityIndicator, NetInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOBILE_OTP_API, RESEND_OTP_API } from '../constants/APIUrl';
import { MOBILE_OTP } from '../constants/Lebel';
import { OTP_VALIDATION, OTP_MISMATCH_ERR, OTP_LIMIT_EXCEED } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Sae } from 'react-native-textinput-effects';
import Utility from '../components/Utility';
let MOBILE_OTP_API_URL = MOBILE_OTP_API;
let RESEND_OTP_API_URL = RESEND_OTP_API;
let type = '';
let CONNECTION_STATUS = false;
class RegisterOTP extends Component {
  constructor(props) {
    super(props);
    this.state = { Email: '', firstName: '', type: '', LocationId: '', password: '', loginType: true, Service_URL: '', HosName: '', SecondSecurityQuestionEncrypted: '', SecondSecurityQuestionAnswer: '', FirstSecurityQuestionEncrypted: '', FirstSecurityQuestionAnswer: '', Mobotp: '', otp: '', mobileNo: '', cnfPassword: '', Password: '', isSending: false, Forgotpassword_text: '', accountRegId: '', MobileOTPLimi: 1 };
    this.props.navigation.addListener(
      'didFocus', async () => {
        const { params } = this.props.navigation.state;
        let Service_URL = '', HosName = '', LocationId = '';
        if (!Utility.IsNullOrEmpty(params.Service_URL)) {

          Service_URL = params.Service_URL;
          MOBILE_OTP_API_URL = `${Service_URL}api/PatientSignUp/CheckMobileOTP`;
          SIGNUP_OTP_URL = `${Service_URL}api/PatientSignUp/OTP`;
          PATIENT_SIGNUP_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
          RESEND_OTP_API_URL = `${Service_URL}api/PatientSignUp/ResendSignUpMobileOTP`;
          type = params.type;
          HosName = params.HosName,
            LocationId = params.LocationId
        }
        this.setState({
          Service_URL: Service_URL,
          firstName: params.firstName,
          type: type,
          HosName: HosName,
          LocationId: LocationId,
          accountRegId: params.accountRegId
        });
        /*********************************Internet Connection Status ****************************************/
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
          CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
      }
    );
  }
  async componentDidMount() {
    const { params } = this.props.navigation.state;
    let Service_URL = '', HosName = '', LocationId = '';
    if (!Utility.IsNullOrEmpty(params) && !Utility.IsNullOrEmpty(params.Service_URL)) {

      Service_URL = params.Service_URL;
      MOBILE_OTP_API_URL = `${Service_URL}api/PatientSignUp/CheckMobileOTP`;
      SIGNUP_OTP_URL = `${Service_URL}api/PatientSignUp/OTP`;
      PATIENT_SIGNUP_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
      type = params.type;
      HosName = params.HosName,
        LocationId = params.LocationId
    }
    this.setState({
      Service_URL: Service_URL,
      firstName: params.firstName,
      type: type,
      HosName: HosName,
      LocationId: LocationId,
      accountRegId: params.accountRegId
    });
    /*********************************Internet Connection Status ****************************************/
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
  }
  /***************************************************************************************************************** */
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
  }
  /**********************************************************Signup OTP starts ******************************/
  OTP = () => {
    let { otp, Mobotp } = this.state;
    const { navigate } = this.props.navigation;
    otp = otp.trim();
    Mobotp = Mobotp.trim();
    if (Mobotp === '') {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          OTP_VALIDATION,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(OTP_VALIDATION);
      }
    } else if ((Mobotp.length < 6 || Mobotp.length >= 7)) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          OTP_MISMATCH_ERR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(OTP_MISMATCH_ERR);
      }
    } else {
      this.setState({ Otp_text: 'Please wait..' });
      const OTPData = {
        "MobileOTP": this.state.Mobotp,
        "AccountRegId": this.state.accountRegId
      }
      fetch(MOBILE_OTP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(OTPData)
      }).then((response) => response.json()).then((res) => {
        if (res.statusCode == 200) {
          navigate('AddAccount', {
            accountRegId: this.state.accountRegId,
            Service_URL: this.state.Service_URL,
            HosName: this.state.HosName,
            LocationId: this.state.LocationId,
            type: this.state.type,
            action: 'SignUp'
          });
        } else {
          if (Platform.OS !== 'ios') {
            ToastAndroid.showWithGravity(
              res.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
          } else {
            AlertIOS.alert(res.message);
          }
        }
      });
    }
  }
  resendOTP() {
    this.setState({ Otp_text: 'Please wait..' });
    const OTPData = {
      "AccountRegId": this.state.accountRegId
    }
    fetch(RESEND_OTP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(OTPData)
    }).then((response) => response.json()).then((res) => {
      const MobileOTPLimi = this.state.MobileOTPLimi + 1;
      this.setState({ MobileOTPLimi: MobileOTPLimi });
      if (res.statusCode == 200) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            res.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert(res.message);
        }
      } else if (res.statusCode != 200) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            res.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert(res.message);
        }
      }
    });
  }
  /********************************************end Signup OTP ************************************************************/
  render() {
    const { goBack } = this.props.navigation;
    return (
      <KeyboardAvoidingView behavior="padding" enabled>
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={{ marginTop: 37 }} />
          <Ionicons
            onPress={() => goBack()}
            style={{
              fontSize: 30, top: 20, textAlign: 'center', color: '#9A9797', position: 'absolute', left: 10,
            }}
            name='ios-arrow-back'
          />
          <View
            style={{
              padding: 20, flex: 1, flexDirection: 'column'
            }}
          >
            <Sae
              label={MOBILE_OTP}
              labelStyle={{ color: 'gray', fontWeight: 'bold' }}
              inputStyle={styles.inputField}
              iconClass={FontAwesomeIcon}
              iconName={'pencil'}
              maxLength={6}
              iconColor={'gray'}
              secureTextEntry={true}
              keyboardType={'numeric'}
              inputPadding={16}
              labelHeight={24}
              onChangeText={(Mobotp) => this.setState({ Mobotp })}
              borderHeight={2}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
            <View style={{ margin: 10 }} />
            {!this.state.isSending ?
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
                  <Text style={styles.cusButtonLargeGreen} onPress={() => this.OTP()}>
                    Next
                </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
                  <Text style={styles.cusButtonLargeGreen} onPress={() => this.resendOTP()}>
                    Resend OTP
                </Text>
                </View>
              </View>
              :
              <View style={{ width: '100%', height: 30 }}>
                <ActivityIndicator />
              </View>
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  inputField: {
    width: '100%',
    color: '#8D8D8D',
    backgroundColor: '#ffffff00',
    borderBottomWidth: 0.7,
    borderBottomColor: '#9E9A9B'
  },
  cusButtonLargeGreen: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 25,
    paddingRight: 25,
    textAlign: 'center',
    borderRadius: 20,
    fontSize: 13,
    color: 'white',
    backgroundColor: '#3AA6CD',
    elevation: 1
  },
});

export default RegisterOTP;
