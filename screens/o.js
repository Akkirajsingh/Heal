/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import {
  TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView,
  View, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity
} from 'react-native';
import { VERIFY_QUESTIONS, RESEND_OTP, FORGOT_PASS_OTP, GET_SECURITY_QUESTION } from '../constants/APIUrl';
import { OTP_VERIFICATION, OTP_SUB_HEADING } from '../constants/Lebel';
import {
  SECURITY_ANS_TYPO_ERR, SECURITY_ANS_MISMATCH_ERR, SECURITY_ANS_SUCCESS_MSG,
  INVALID_OTP_TYPO_ERR_MSG, OTP_BLANK_ERR, OTP_INVALID_TYPO_ERR, OTP_VARIFIED_SUCCESS_MSG, INVALID_OTP_TYPO_ERR, OTP_SENT_SUCCESS_MSG
} from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
let VERIFY_QUESTIONS_URL = VERIFY_QUESTIONS;
let RESEND_OTP_URL = RESEND_OTP;
let FORGOT_PASS_OTP_URL = FORGOT_PASS_OTP;
let GET_SECURITY_QUESTION_URL = GET_SECURITY_QUESTION;
let CONNECTION_STATUS = false;

class OtpPage extends Component {
  constructor(props) {
    super(props);
    this.state = { OtpData: '', type: '', OtpData1: '', isSending: false, OtpData2: '', Service_URL: '', OtpData3: '', OtpData4: '', OtpData5: '', Email: '', securityQues: false, Forgotpassword_text: '', OTPVerifiedStatus: false, FirstSA: '', SecondSA: '', ThirdSA: '', SecurityQues: [] };
  }
  async componentDidMount() { let type = "SignUp";
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
  
    const { params } = this.props.navigation.state;
    console.log("Service_URL", Service_URL)
    //let Service_URL = params.Service_URL;
    let Service_URL="https://creativesmiles.patientheal.com/Creativesmileservices/";
    if (!Utility.IsNullOrEmpty(Service_URL)) {
     
      //let type = params.type;
      if (type == "SignUp") {
      //  Service_URL = params.Service_URL;
        VERIFY_QUESTIONS_URL = `${Service_URL}api/PatientSignUp/VerifyQuestions`;
        RESEND_OTP_URL = `${Service_URL}api/PatientSignUp/ResendOTP`;
        FORGOT_PASS_OTP_URL = `${Service_URL}api/PatientSignUp/ForgotPwdOTP`;
        GET_SECURITY_QUESTION_URL = `${Service_URL}api/PatientSignUp/GetSecurityQuestion`;
      }
    }
      console.log(VERIFY_QUESTIONS_URL);
      console.log(RESEND_OTP_URL);
      console.log(FORGOT_PASS_OTP_URL);
      console.log(GET_SECURITY_QUESTION_URL);
      this.setState({
        Email: "akanksha@orbiosolutions.com",
        Service_URL: Service_URL,
        type: type
      });
      // this.setState({
      //   Email: params.email,
      //   Service_URL: Service_URL,
      //   type: type
      // });
  }
  /************************************** componentWillUnmount ********************************************/
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
  }
  /***************************** GetSecurityQuestionView ************************************************************/
  GetSecurityQuestionView() {
    const QuestionList = [];
    const SecurityQuesItem = this.state.SecurityQues;
    for (let l = 0; l < SecurityQuesItem.length; l++) {
      if (SecurityQuesItem[l].question.length > 0) {
        QuestionList.push(<TextInput
          placeholder={SecurityQuesItem[l].question}
          style={styles.inputField1}
          value={l == 0 ? this.state.FirstSA : (l == 1 ? this.state.SecondSA : this.state.ThirdSA)}
          placeholderTextColor={'#8ECAE0'}
          secureTextEntry={false}
          onChangeText={l == 0 ? ((FirstSA) => this.setState({ FirstSA })) : ((l == 1 ? ((SecondSA) => this.setState({ SecondSA })) : ((ThirdSA) => this.setState({ ThirdSA }))))}
        />);
      }
    }
    if (SecurityQuesItem.length == 0) { return (<View />); }
    return (<View
      style={{
        padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center'
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, color: '#787878', fontWeight: 'bold' }}>Verification</Text>
      <Text style={{ fontSize: 12, marginBottom: 20, color: '#AEAEAE' }}>Enter the Security answer used while Signup</Text>

      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
        {QuestionList}
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.cusButtonLargeGreen1}>
          <Text
            style={{ color: 'white' }}
            onPress={() => this.SecurityQuestionVerify()}
          >
            Verify
             </Text>
        </View>
      </View>
    </View>);
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
  /*******************************************************SecurityQuestion Verify Api call *****************************************************/
  SecurityQuestionVerify = () => {
    this.setState({ isSending: true });
    const { FirstSA, SecondSA, otpInput, ThirdSA, Email } = this.state;
    const SecurityAns = `emailEncrypted=${Email}&firstSecurityQuestionAnswer=${FirstSA}&secondSecurityQuestionAnswer=${SecondSA}&thirdSecurityQuestionAnswer=${ThirdSA}&action= Verify_Questions`;
    const Otp_verify = otpInput;
    if (FirstSA == '' || SecondSA == '') {
      ToastAndroid.showWithGravity(
        SECURITY_ANS_TYPO_ERR,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      ); this.setState({
        isSending: false
      }); return;
    }
    fetch(VERIFY_QUESTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: SecurityAns
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.statusCode == 409) {
          ToastAndroid.showWithGravity(
            SECURITY_ANS_MISMATCH_ERR,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          ); this.setState({
            isSending: false
          }); return;
        }
        if (res.message.indexOf('Your security questions and answers verified successfully') > -1) {
          ToastAndroid.showWithGravity(
            SECURITY_ANS_SUCCESS_MSG,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          ); this.setState({
            isSending: false
          });
          this.props.navigation.navigate('ResetPassword', { email: this.state.Email, Service_URL: this.state.Service_URL, type: this.state.type });
        }
      })
      .catch(err => {
        this.setState({
          isSending: false
        });
        const errMSg = '';
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      });
  }
  /*********************************** GetSecurityQuestion Api**********************************************************/
  GetSecurityQuestion() {
    this.setState({ isSending: true });
    const Email = this.state.Email;
    const SecurityQuestionData = `emailEncrypted=${Email}`;
    fetch(GET_SECURITY_QUESTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: SecurityQuestionData
    })
      .then((response) => response.json())
      .then(async (res) => {
        if (res.statusCode == 409) {
          ToastAndroid.showWithGravity(
            INVALID_OTP_TYPO_ERR_MSG,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          this.setState({
            isSending: false
          }); return;
        }
        if (res.responseData.length == 0) {
          const errMSg = 'no security Question';
          this.props.dispatch(ToastAndroid.showWithGravity(
            errMSg,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          )); this.setState({ OTPVerifiedStatus: false, isSending: false }); return;
        }
        this.setState({ OTPVerifiedStatus: true, SecurityQues: res.responseData, isSending: false });
      })
      .catch(err => {
        this.setState({
          isSending: false
        });
      });
  }
  /********************************************************************************************************* */
  /*************************ForgotPassOTP Verify *******************************************************/
  ForgtPassOTPVerify = () => {
    this.setState({ isSending: true });
    this.GetSecurityQuestion();
    const otpInput = this.state.OtpData + this.state.OtpData1 +
      this.state.OtpData2 + this.state.OtpData3 + this.state.OtpData4 + this.state.OtpData5;
    const Otp_verify = otpInput;
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
    const OtpNum = `emailEncrypted=${this.state.Email}&otp=${otpInput}`;
    fetch(FORGOT_PASS_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: OtpNum
    })//.then(aPIStatusInfo.handleResponse)
      .then((response) => response.json())
      .then((res) => {
        console.log("OtpNum",OtpNum);
        console.log("FORGOT_PASS_OTP_URL",FORGOT_PASS_OTP_URL);
        console.log("res.statusCode",res.statusCode);
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
          this.GetSecurityQuestion();
          this.setState({ isSending: false });
        }
      })
      .catch(err => {
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
  ResendEmail = () => {
    const { navigate } = this.props.navigation;
    const ResendOtpData = `email=${this.state.Email}`;
    fetch(RESEND_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: ResendOtpData
    })//.then(aPIStatusInfo.handleResponse)
      .then((response) => response.json())
      .then((res) => {
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
      }).catch(err => {
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
    return (
      <KeyboardAvoidingView behavior="padding" enabled>
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={{ marginTop: 37 }} />
          {this.state.OTPVerifiedStatus == false ? <View
            style={{
              padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 20, color: '#787878', fontWeight: 'bold' }}>{OTP_VERIFICATION}</Text>
            <Text style={{ fontSize: 12, marginBottom: 20, color: '#AEAEAE' }}>{OTP_SUB_HEADING}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.inputField}
                autoFocus
                placeholder={'x'}
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
                style={styles.inputField}
                placeholder={'x'}
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
                style={styles.inputField}
                placeholder={'x'}
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
                style={styles.inputField}
                placeholder={'x'}
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
                style={styles.inputField}
                placeholder={'x'}
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
                style={styles.inputField}
                placeholder={'x'}
                maxLength={1}
                keyboardType={'numeric'}
                placeholderTextColor={'#8ECAE0'}
                value={this.state.OtpData5}
                secureTextEntry={false}
                onChangeText={(OtpData5) => { this.OTPKeyEvent(5, OtpData5); this.setState({ OtpData5 }); }}
                ref={(input) => { this.sixthTextInput = input; }}
              />
            </View>
            <View style={{ margin: 7 }} />
            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.ForgtPassOTPVerify()}>
              <View style={{ flexDirection: 'row' }}>
                {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                <Text style={{ color: 'white', fontWeight: 'bold' }}> Verify </Text>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <Text style={{ color: '#C9C9C9' }}>Don't receieve OTP?</Text>
              <Text style={{ color: '#89C2DD' }} onPress={() => this.ResendEmail()}>  Resend</Text>
            </View>
          </View>
            :
            <View>
              {this.GetSecurityQuestionView()}
            </View>
          }
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
  cusButtonLargeGreen1: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    textAlign: 'center',
    borderRadius: 30,
    fontSize: 15,
    color: 'white',
    backgroundColor: '#3AA6CD',
    elevation: 1,
    flex: 1,
    flexDirection: 'row'
  }
});
export default OtpPage;