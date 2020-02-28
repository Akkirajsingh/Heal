/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { ScrollView, TextInput, StyleSheet, Text, KeyboardAvoidingView, View, ImageBackground, Platform, AlertIOS, Dimensions, NetInfo, ToastAndroid, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { PATIENTS_SIGNUP, GENDER_LIST, PATIENT_SIGNUP, BASE_URL, MOBILE_OTP_API } from '../constants/APIUrl';
import { Ionicons, FontAwesome, Feather, Entypo } from '@expo/vector-icons';
import { SIGNUP_MANDATORY_FIELD_ERR, INVALID_EMAIL_ERR, EMAILID_EXISTING_ERR, INVALID_AADHAR } from '../constants/Messages';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
let PATIENTS_SIGNUP_URL = PATIENTS_SIGNUP;
let MOBILE_OTP_API_URL = MOBILE_OTP_API;
let CREATE_ACCOUNT_URL = PATIENT_SIGNUP;
let MOB_VALIDATE_URL = BASE_URL;
let CONNECTION_STATUS = false;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;

class Register1 extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      CountryItem: [],
      genderItem: [],
      GenderData: '',
      isSending: false,
      firstName: '',
      mobilenumber: '',
      CountryID: 101,
      CountrySelectedItem: '',
      CountryValue: [],
      dateOfBirth: today,
      emailid: '',
      aadharCardNo: '',
      Gender: '',
      Signup_text: '',
      todayDate: today,
      Service_URL: '',
      HosName: '',
      LocationId: '',
      loginType: '', OtpData: '', OtpData1: '', isSending: false, OtpData2: '', OtpData3: '', OtpData4: '', OtpData5: '',
      lastName: '',
      accountId: '',
      isCreateAccountVisible: false,
      mobileOtpText: "Verify",
      IsOTPValid: true,
      IsOTPFieldVisible: false,
      FirstTimeVerifyCalled: false, cnfhidePassword: true, hidePassword: true, iconName1: 'eye-with-line', iconName: 'eye-with-line', isValidUser: false, UserName: '', UserPassword: '', UserCNFpassword: '', UserMobile: '', UserEmail: '',
    };
    this.props.navigation.addListener(
      'didFocus',
      async () => {
        const { params } = this.props.navigation.state;
        if (params.type == 'SignUp') {
          const Service_URL = params.Service_URL;
          const LocationId = params.locationId;

          const HosName = params.HosName;
          if (!Utility.IsNullOrEmpty(Service_URL)) {
            PATIENTS_SIGNUP_URL = `${Service_URL}api/PatientSignUp/MobSignup`;
            GENDER_LIST_URL = `${Service_URL}api/MasterService/AllGenderList`;
            MOBILE_OTP_API_URL = `${Service_URL}api/PatientSignUp/CheckMobileOTP`;
            CREATE_ACCOUNT_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
            MOB_VALIDATE_URL = `${Service_URL}api/`;
          }
          this.setState({
            Service_URL,
            HosName,
            LocationId,
            loginType: params.type
          });
          console.log(this.state);
        }
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
          CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        this.countryData();
        this.genderData();
        this.setState({ isSending: false });
      }
    );
  }
  async componentDidMount() {
    const { params } = this.props.navigation.state;
    if (params.type == 'SignUp') {
      const Service_URL = params.Service_URL;
      const LocationId = params.locationId;

      const HosName = params.HosName;
      if (!Utility.IsNullOrEmpty(Service_URL)) {
        PATIENTS_SIGNUP_URL = `${Service_URL}api/PatientSignUp/MobSignup`;
        GENDER_LIST_URL = `${Service_URL}api/MasterService/AllGenderList`;
        MOBILE_OTP_API_URL = `${Service_URL}api/PatientSignUp/CheckMobileOTP`;
        CREATE_ACCOUNT_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
        MOB_VALIDATE_URL = `${Service_URL}api`;
      }
      this.setState({
        Service_URL,
        HosName,
        LocationId,
        loginType: params.type
      });
      console.log(this.state);
    }
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
    this.countryData();
    this.genderData();
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
  }

  setDOB = (date) => {
    this.setState({ dateOfBirth: date });
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
  /********************************* */
  toggleConfPassword = () => {
    if (this.state.cnfhidePassword) {
      this.setState({
        cnfhidePassword: false,
        iconName1: 'eye'
      });
    } else {
      this.setState({
        cnfhidePassword: true,
        iconName1: 'eye-with-line'
      });
    }
  };
  /**************************************************Gender API Call *******************************************/
  genderData = () => {
    fetch(GENDER_LIST_URL, {
      method: 'GET',
      headers: {
        'content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((response) => response.json()).then((responseJson) => {
      const count = Object.keys(responseJson.responseData).length;
      const genderdropDown_data = [];
      for (let i = 0; i < count; i++) {
        genderdropDown_data.push({ label: responseJson.responseData[i]._Gender, value: responseJson.responseData[i].id });
      }
      this.setState({
        genderItem: genderdropDown_data,
        isLoading: false,
      });
    }).catch((error) => {
      this.setState({ isLoading: false });
    });
  }
  /*****************************************SignUp ************************************************************/
  Signup = () => {
    // alert("hi");
    const { navigate } = this.props.navigation;
    this.setState({ isSending: true });
    const { UserName, UserCNFpassword, UserPassword, accountId, UserMobile, isValidUser } = this.state;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const Namereg = /^.{3,100}$/;
    // const Passreg = /^.{8,12}$/;
    if (UserName === '' || UserPassword === '' || UserCNFpassword === '' || UserMobile === '') {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          SIGNUP_MANDATORY_FIELD_ERR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(SIGNUP_MANDATORY_FIELD_ERR);
      } this.setState({
        isSending: false
      }); return;

    } else if (isValidUser === false) {

      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Please Enter Valid User Name',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert('Please Enter Valid User Name');
      } this.setState({
        isSending: false
      }); return;
    } else if (UserName.length < 3) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Please enter name atleast minimum of 3 characters',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert('Please enter name atleast minimum of 3 characters');
      }

      this.setState({
        isSending: false
      }); return;
    } else if (UserPassword != UserCNFpassword) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Password and Confirm Password should be same',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert('Password and Confirm Password should be same');
      } this.setState({
        isSending: false
      }); return;
    }

    const SignUpData = {
      "Name": UserName,
      "accountRegID": accountId,
      "password": UserPassword,
      "action": "SignUp",
      // "dateOfBirth": this.state.dateOfBirth,
      // "aadharCardNo": this.state.aadharCardNo,
      // "patientId": "",
      // "phone": this.state.mobilenumber,
      // "countryCode": this.state.CountryID
    }
    console.log("SignUpData", SignUpData);
    console.log("CREATE_ACCOUNT_URL", CREATE_ACCOUNT_URL);
    fetch(CREATE_ACCOUNT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(SignUpData)
    }).then((response) => response.json()).then((res) => {
      console.log("signres", res);
      if (res.statusCode === 409) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            'An error has occurred.',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert('An error has occurred.');
        } this.setState({
          isSending: false
        }); return;
      }
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          "User Created Successfully",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert("User Created Successfully");
      } this.setState({
        isSending: false
      }, function () {
        // this.props.navigation.navigate('Login');
        if (this.state.loginType == "SignUp")
          navigate('Hospital', {
            type: 'SignUp', Service_URL: this.state.Service_URL,
            LocationId: this.state.LocationId,
            HosName: this.state.HosName
          });
        else navigate('Login');
      });
    }).catch(err => {
      console.log(err);
      this.setState({
        isSending: false,
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
  /************************************************************************************************* */
  countryData = () => {
    fetch('https://care.patientheal.com/PatientCareServices/api/MasterService/CountryCodes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((response) => response.json()).then((responseJson) => {
      const CountrydropDown_data = [];
      for (let i = 0; i < responseJson.responseData.length; i++) {
        CountrydropDown_data.push({ label: responseJson.responseData[i].countryCode, value: responseJson.responseData[i].id });
      }
      this.setState({
        CountryItem: CountrydropDown_data,
        isLoading: false,
      });
    }).catch((error) => {
      console.log('country data error is ', error);
      this.setState({ isLoading: false });
    });
  }

  ValidateUserName = () => {
    // if(Utility.IsNullOrEmpty(this.state.UserName) ||(this.state.UserName.length<3)){this.setState({isValidUser:false})  return;}
    console.log(`${MOB_VALIDATE_URL}PatientSignUp/IsUserNameExist?UserName=${this.state.UserName}`)
    fetch(`${MOB_VALIDATE_URL}PatientSignUp/IsUserNameExist?UserName=${this.state.UserName}`, {

      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((response) => response.json()).then((responseJson) => {
      let response = responseJson.responseData;
      console.log("response", response);
      if (response == 0) {
        this.setState({ isValidUser: true })
      } else {
        // if (Platform.OS !== 'ios') {
        //   ToastAndroid.showWithGravity(
        //     "User Name Already exist",
        //     ToastAndroid.SHORT,
        //     ToastAndroid.CENTER,
        //   );
        // } else {
        //   AlertIOS.alert("User Name Already exist");
        // }
        this.setState({ isValidUser: false })
      }

    }).catch((error) => {
      console.log('User name error is ', error);
      this.setState({ isLoading: false, isValidUser: false });
    });
  }
  /**************************************************************************************************************** */
  changeGenderStatus = (value) => {
    this.setState({
      GenderData: value
    });
  }
  changeCountry = (value, index) => {
    this.setState({
      CountryID: value
    });
  }
  verifyMobileOTP = () => {
    let otp = this.state.OtpData + this.state.OtpData1 + this.state.OtpData2 + this.state.OtpData3 + this.state.OtpData4 + this.state.OtpData5;
    if (Utility.IsNullOrEmpty(otp) || otp.length != 6) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          "Enter valid OTP",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert("Enter valid OTP");
      } return;
    }
    const usernameData = {
      "MobileOTP": otp,
      "AccountRegId": this.state.accountId,
    }
    console.log("usernameData", usernameData);
    console.log("MOBILE_OTP_API_URL", MOBILE_OTP_API_URL);
    fetch(MOBILE_OTP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      }, "body": JSON.stringify(usernameData)
    }).then((response) => response.json()).then((responseJson) => {
      let response = responseJson.responseData;
      if (responseJson.succeeded == true) {
        this.setState({ isCreateAccountVisible: true, FirstTimeVerifyCalled: true, IsOTPValid: true });
      }
      else {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            "Invalid OTP entered",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert("Invalid OTP entered");
        }
        this.setState({ isCreateAccountVisible: false, FirstTimeVerifyCalled: true, IsOTPValid: false });
      }
    }).catch((error) => {
      console.log('CheckMobileOTP data error is ', error);
      this.setState({ isLoading: false, isCreateAccountVisible: false, FirstTimeVerifyCalled: true, IsOTPValid: false });
    });
  }

  verifyMobileNo = () => {
    if (Utility.IsNullOrEmpty(this.state.UserMobile) || this.state.UserMobile.length != 10) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          "Enter valid Mobile Number",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert("Enter valid Mobile Number");
      } return;
    }
    const usernameData = {
      "phone": this.state.UserMobile,
      "countryCode": "101",
      "email": this.state.UserEmail
    }
    fetch(PATIENTS_SIGNUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      "body": JSON.stringify(usernameData)
    }).then((response) => response.json()).then((responseJson) => {
      console.log("responseJsonresponseJson", responseJson);
      let response = responseJson.responseData;
      if (responseJson.succeeded == true) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            "OTPs has been sent to your mobile number - " + this.state.UserMobile,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert("OTPs has been sent to your mobile number - " + this.state.UserMobile);
        }
        let accountid = responseJson.responseData.split('~');

        this.setState({
          isLoading: false, IsOTPFieldVisible: true, mobileOtpText: "Resend", accountId: accountid.length > 0 ? accountid[2] : ""
        });
      } else {

        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            "Invalid Mobile Number/Failed to send OTP",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert("Invalid Mobile Number/Failed to send OTP");
        }
        this.setState({
          isLoading: false, IsOTPFieldVisible: false
        });
      }

    }).catch((error) => {
      console.log('MobSignup data error is ', error);
      this.setState({ isLoading: false, IsOTPFieldVisible: false });
    });
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
      if (!this.state.FirstTimeVerifyCalled) this.verifyMobileOTP();
    }
  }
  /*................................................................................................................*/
  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

        <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
          <ImageBackground source={require('../assets/images/backgroundImage.jpg')} style={{ width: '100%', height: '100%' }}>
            <View style={styles.mainContainer}>
              <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 25, marginTop: 30, marginBottom: 10, color: '#000000', marginLeft: 15, fontWeight: 'bold' }}>Sign Up</Text>
              </View>
              <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 45 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>UserName </Text>
                </View>
                <View style={styles.MobileinputField1}><TextInput
                  style={styles.inputField1}
                  value={this.state.UserName}
                  placeholder={'Enter your name'}
                  secureTextEntry={false}
                  onChangeText={(UserName) => this.setState({ UserName }, function () {
                    this.ValidateUserName();
                  })}
                />
                  {this.state.UserName == '' ?
                    <View style={{ right: 35 }}>
                      <Feather
                        style={{ fontSize: 20, textAlign: 'center' }}
                        name='alert-triangle'
                        color={'#FDB81E'}
                      />
                    </View>
                    :
                    <View style={{ right: 35 }}>
                      {this.state.isValidUser ?
                        <Ionicons
                          style={{ fontSize: 20, textAlign: 'center' }}
                          name='ios-checkmark-circle'
                          color={'green'}
                        />
                        :
                        <FontAwesome
                          style={{ fontSize: 20, textAlign: 'center' }}
                          name='times-circle-o'
                          color={'red'}
                        />
                      }
                    </View>
                  }
                </View>

                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>Password</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TextInput
                    ref={ref => (this.passwordInput = ref)}
                    value={this.state.UserPassword}
                    style={styles.inputField}
                    secureTextEntry={this.state.hidePassword}
                    placeholder={'Atleast 8 characters'}
                    onChangeText={UserPassword => this.setState({ UserPassword })}
                    visible-password
                  />
                  <Entypo name={this.state.iconName} size={16} style={{ color: '#0da4da', top: 10, right: 25 }} onPress={() => this.togglePassword()} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>Confirm Password</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TextInput
                    ref={ref => (this.passwordInput = ref)}
                    value={this.state.UserCNFpassword}
                    style={styles.inputField}
                    secureTextEntry={this.state.cnfhidePassword}
                    placeholder={'Enter your confirm password'}
                    onChangeText={UserCNFpassword => this.setState({ UserCNFpassword })}
                    visible-password
                  />

                  <Entypo name={this.state.iconName1} size={16} style={{ color: '#0da4da', top: 10, right: 25 }} onPress={() => this.toggleConfPassword()} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>Email(Optional)</Text>
                </View>
                <TextInput
                  style={styles.inputField}
                  value={this.state.UserEmail}
                  placeholder={'Enter your email address'}
                  secureTextEntry={false}
                  onChangeText={(UserEmail) => this.setState({ UserEmail })}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.label_text}>Mobile Number</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Dropdown
                    label=''
                    data={this.state.CountryItem}
                    labelHeight={6}
                    fontSize={11}
                    value={this.state.CountryID}
                    textColor='gray'
                    selectedItemColor='#41b4af'
                    onChangeText={(val, index, data) => this.changeCountry(val, index, data)}
                    containerStyle={{ width: '15%', marginRight: 10, color: '#86d1ec' }}
                    baseColor="#000"
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      style={styles.MobileinputField}
                      value={this.state.UserMobile}
                      placeholder={'Enter your mobile no'}
                      secureTextEntry={false}
                      maxLength={10}
                      onChangeText={(text) => this.onChanged(text)}
                      keyboardType={'number-pad'}
                      onChangeText={(UserMobile) => this.setState({ UserMobile })}
                    />
                    <Text style={{ color: '#0da4da', right: 70 }} onPress={() => { this.verifyMobileNo(); }} >{this.state.mobileOtpText}</Text>
                  </View>
                </View>
                {this.state.IsOTPFieldVisible ?
                  <View>
                    <Text style={styles.label_text} >Enter OTP received on your mobile</Text>
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

                        onChangeText={(OtpData5) => {
                          this.setState({ OtpData5 }, function () {
                            this.OTPKeyEvent(5, OtpData5);
                          });
                        }} ref={(input) => { this.sixthTextInput = input; }} />
                      {!this.state.IsOTPValid ? <Text style={{ color: '#0da4da', right: 5 }} onPress={() => { this.verifyMobileOTP() }} >Validate OTP</Text> : null}
                    </View>
                  </View>
                  : null
                }
              </View>
              {/* {this.state.isCreateAccountVisible ? */}
              <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15 }} >
                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.Signup()}>
                  <View style={{ flexDirection: 'row' }}>
                    {this.state.isLoggingIn ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 9 }} /> : undefined}
                    <Text
                      style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                    >
                      Create Account
                </Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* : null} */}
              <View
                style={styles.SignUpLinkBottom}>
                <Text style={{ color: '#7a7a7a', fontSize: 15 }}>
                  Already have account?
              </Text>
                <Text
                  style={{
                    color: '#0da4da', fontWeight: 'bold', fontSize: 15
                  }}
                  onPress={() => this.props.navigation.navigate('Login', { type: 'PatientSignup' })}
                > Login
 </Text>
              </View>
            </View>
          </ImageBackground>
        </ScrollView>

      </KeyboardAvoidingView >
    );
  }
  showPassword = () => {
    if (this.state.showPwd) {
      this.setState({
        showPwd: false,
        eyeIcon: 'eye'
      });
    } else {
      this.setState({
        showPwd: true,
        eyeIcon: 'eye-slash'
      });
    }
  }
  // </CommonView >
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  cusButtonLargeGreen1: {
    backgroundColor: '#3aa6cd',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 15,
    borderRadius: 5,
    color: 'white',
    width: (Dimensions.get('window').width) - 20,
    borderWidth: 2,
    borderColor: '#3aa6cd',
    elevation: 1,
    fontWeight: 'bold',
    flexDirection: 'row'
  },
  mainContainer: { height: DEVICE_HEIGHT, width: DEVICE_WIDTH },
  inputField: {
    height: 30, width: '100%', marginBottom: 10, borderBottomWidth: 0.6, borderBottomColor: '#86d1ec'
  },
  inputField1: {
    height: 30, marginBottom: 10, width: '85%', borderBottomWidth: 0.6, borderBottomColor: '#86d1ec'
  },
  MobileinputField: {
    height: 30, width: '85%', marginBottom: 10, borderBottomWidth: 0.6, borderBottomColor: '#86d1ec'
  },
  MobileinputField1: {
    height: 30, width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 0.6, borderBottomColor: '#86d1ec'
  },
  OtpinputField: {
    height: 35, width: '10%', marginBottom: 20, color: '#333333', paddingLeft: 10, marginRight: 10, backgroundColor: '#ffffff00', borderBottomWidth: 0.6, borderBottomColor: '#3AA6CD',
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
    fontSize: 14, color: 'black', fontWeight: 'bold'
  },
});

export default Register1;