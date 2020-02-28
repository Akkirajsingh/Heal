/* eslint - disable global - require */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, BackHandler, TouchableOpacity, AsyncStorage, AlertIOS, View, ToastAndroid, Dimensions, NetInfo, Modal, TextInput, Platform } from 'react-native';
import CommonView from '../components/CommonView';
import { DASHBOARD, GET_PIN_API, SET_PIN_API, VERIFY_PIN_API } from '../constants/APIUrl';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { DATA_NOT_AVAILABLE, INVALID_PIN, PIN_MISMATCH } from '../constants/Messages';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Utility from '../components/Utility';
let CONNECTION_STATUS = false;
let DASHBOARD_URL = '';
let GET_PIN_API_URL = GET_PIN_API;
let SET_PIN_API_URL = SET_PIN_API;
let VERIFY_PIN_API_URL = VERIFY_PIN_API;
class Dashboard extends Component {
  _didFocusSubscription;
  _willBlurSubscription;
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload =>
        BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid
        ),
      AsyncStorage.removeItem('IsOTPSet')
    );
    this.state = { showChangePassWord: true, loadingMsg: 'Preparing Dashboard...', targetPageName: '', gender: '', height: '', weight: '', dob: '', login_text: 'Login Securely', showMenu: false, isLoading: true, otpDialogVisible: false, connection_Status: false, showSetPIN: false, showVerifyPIN: false, newpin: '', cnfpin: '', verifyPIN: '' };
  }
  onBackButtonPressAndroid = () => {
    if (true) {
      // this.disableSelectionMode();
      return true;
    } else {
      return false;
    }
  };
  async componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid
        )
    );
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) {
      ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
    }
    DASHBOARD_URL = DASHBOARD;
    let USER_DATA = await AsyncStorage.getItem('USER_DATA');
    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
    if (USER_DATA.hasOwnProperty("Hospital")) {
      delete USER_DATA.Hospital;
      await AsyncStorage.removeItem("USER_DATA");
      await AsyncStorage.removeItem("ACCESS_TYPE");
    }
    await AsyncStorage.setItem("USER_DATA", JSON.stringify(USER_DATA));
    //   if (USER_DATA.hasOwnProperty('Hospital')) { 
    //     USER_DATA = USER_DATA.Hospital;
    //     DASHBOARD_URL = USER_DATA.ServiceURL + HOSP_DASHBOARD;
    // }

    fetch(DASHBOARD_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': 'Bearer ' + USER_DATA.ACCESS_TOKEN,
      },
    }).then(aPIStatusInfo.handleResponse)
      .then((response) => response.json()).then((res) => {
        const response = res.responseData.generalResult[0];
        if (Utility.IsNullOrEmpty(res) || (res.hasOwnProperty("responseData") && res.responseData.length == 0)) {
          ToastAndroid.showWithGravity(
            DATA_NOT_AVAILABLE,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
        this.setState({
          // gender: response.genderDecrypted,
          // height: response.height,
          // weight: response.weights,
          // dob: response.dateOfBirthEncrypted,
          isLoading: false
        }, () => {
          let unreadMsg = '0';
          if (!Utility.IsNullOrEmpty(res.responseData) && res.responseData.hasOwnProperty("messagesResult") && res.responseData.messagesResult.length > 0) {
            unreadMsg = res.responseData.messagesResult[0].messageUnReadTotal.toString();
          }
          AsyncStorage.setItem('UNREAD_MESSAGE', unreadMsg);
        });
      }).catch(err => {
        const errMSg = aPIStatusInfo.logError(err);
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        console.log("dash", err)
        this.setState({ refreshing: false });
        return;
      });
  }
  checkPIN = async (screen) => {
    const IsOTPSet = await AsyncStorage.getItem('IsOTPSet');
    const USER_DATA = JSON.parse(await AsyncStorage.getItem('USER_DATA'));
    if (!IsOTPSet || IsOTPSet != "1") {
      console.log(GET_PIN_API_URL + '?AccId=' + USER_DATA.Id);
      fetch(GET_PIN_API_URL + '?AccId=' + USER_DATA.Id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': 'Bearer' + USER_DATA.ACCESS_TOKEN,
          'token_type': 'bearer',
          'access_token': USER_DATA.ACCESS_TOKEN
        }
      }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
        console.log(res);
        if (res.responseData == 0) {
          this.setState({ showSetPIN: true, screenToNavigate: screen });
        } else {
          this.setState({ showVerifyPIN: true, screenToNavigate: screen });
        }
      }).catch(err => {
        const errMSg = aPIStatusInfo.logError(err);
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            errMSg.length > 0 ? errMSg : COMMON_ERROR,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
        }
        this.setState({ refreshing: false });
        return;
      });
    } else {
      this.props.navigation.navigate(screen);
    }
    // this.props.navigation.navigate(screen);
  }
  setPIN = async () => {
    const USER_DATA = JSON.parse(await AsyncStorage.getItem('USER_DATA'));
    if ((this.state.newpin).length < 6) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          INVALID_PIN,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(INVALID_PIN);
      }
      return;
    } else if (this.state.newpin !== this.state.cnfpin) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          PIN_MISMATCH,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(PIN_MISMATCH);
      }
      return;
    }
    const SetPINData = {
      "AccountID": USER_DATA.Id,
      "NewPin": this.state.newpin
    }
    fetch(SET_PIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': 'Bearer' + USER_DATA.ACCESS_TOKEN,
        'token_type': 'bearer'
      },
      body: JSON.stringify(SetPINData)
    }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
      console.log(res);
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          res.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(res.message);
      }
      if (res.statusCode == 200) {
        AsyncStorage.setItem('IsOTPSet', "1");
        this.setState({ showSetPIN: false, showVerifyPIN: true });
      }
    }).catch(err => {
      const errMSg = aPIStatusInfo.logError(err);
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
      }
      this.setState({ refreshing: false });
      return;
    });
  }
  verifyPIN = async () => {
    const USER_DATA = JSON.parse(await AsyncStorage.getItem('USER_DATA'));
    if (this.state.verifyPIN == '' || this.state.verifyPIN.length < 6) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          INVALID_PIN,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        AlertIOS.alert(INVALID_PIN);
      }
      return;
    }
    const VerifyPINData = {
      "AccountID": USER_DATA.Id,
      "Pin": this.state.verifyPIN
    }
    console.log(VerifyPINData);
    fetch(VERIFY_PIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': 'Bearer' + USER_DATA.ACCESS_TOKEN,
        'token_type': 'bearer'
      },
      body: JSON.stringify(VerifyPINData)
    })
      // .then(aPIStatusInfo.handleResponse)
      .then((response) => response.json()).then((res) => {
        console.log("varifypin", res);
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            res.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert(res.message);
        }
        if (res.statusCode == 200) {
          AsyncStorage.setItem('IsOTPSet', "1");
          this.setState({ showVerifyPIN: false });
          this.props.navigation.navigate(this.state.screenToNavigate);
        }
      }).catch(err => {
        const errMSg = aPIStatusInfo.logError(err);
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity(
            errMSg.length > 0 ? errMSg : COMMON_ERROR,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        } else {
          AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
        }
        this.setState({ refreshing: false });
        return;
      });
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }
  render() {
    return (
      <CommonView isDashboard DashboardData>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View>
            <Text style={styles.quickLink}>Quick Links</Text>
          </View>
          <View style={{ paddingLeft: 12, paddingRight: 12 }}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
              <View style={styles.dashTop}>
                <View style={styles.FirstblockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('Hospital')} style={styles.centerView}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={require('../assets/icons/Hospitals.png')} style={styles.innerImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.cardText}>   My </Text>
                        <Text style={styles.quickLinkText}>Hospitals </Text></View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.FirstblockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('Appointments')}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={require('../assets/icons/Appointment.png')} style={styles.innerImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.cardText}>  Book  </Text>
                        <Text style={styles.quickLinkText}>Appoint- {'\n'} ment</Text></View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.FirstblockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('searchDoctors')} style={styles.centerView}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={require('../assets/icons/Doctor.png')} style={styles.innerImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.cardText}>  Search {'\n'} Doctors  </Text>
                        {/* <Text style={styles.quickLinkText}>& Specialities</Text> */}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text style={styles.myAccount}>My Account</Text>
              </View>
              <View style={styles.dashMyAccount}>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('ClinicalInfo')} style={styles.centerView}>
                    <Image source={require('../assets/icons/History.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText}>My History</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('HealthTrackerListing')}>
                    <Image source={require('../assets/icons/Health-Tracker.png')} style={styles.innerImage2} />
                    <Text style={styles.cardText}>Health Tracker</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('VitalsHistory')} style={styles.centerView}>
                    <Image source={require('../assets/icons/Vitals.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText}>Vitals</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('RecordAccess')}>
                    <Image source={require('../assets/icons/Record-Access.png')} style={styles.innerImage2} />
                    <Text style={styles.cardText}>Record Access</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  {/* <TouchableOpacity> */}
                  <Image source={require('../assets/icons/Critical-Care.png')} style={styles.innerImage1} />
                  <Text style={styles.cardText}>Critical Care</Text>
                  {/* </TouchableOpacity> */}
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.checkPIN('BillList')}>
                    <Image source={require('../assets/icons/Billpay.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText1}>Bill Pay</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.showSetPIN}
                onRequestClose={() => { }}>
                <View style={{ flex: 1 }}>
                  <View style={{ padding: 10, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ minWidth: Dimensions.get('window').width - 30, backgroundColor: '#ffffff', padding: 10 }}>
                      <TouchableOpacity style={{ position: 'absolute', right: -10, top: -10, backgroundColor: 'red', width: 20, height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome
                          onPress={() => { this.setState({ showSetPIN: false }) }}
                          style={{
                            fontSize: 20, textAlign: 'center', color: '#ffffff'
                          }}
                          name='times-circle'
                        />
                      </TouchableOpacity>
                      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <TextInput
                          placeholder={'Set Pin'} secureTextEntry
                          keyboardType={'numeric'}
                          onChangeText={(newpin) => this.setState({ newpin })}
                          maxLength={6}
                          placeholderTextColor="#746E6E"
                          style={styles.inputField1}
                          contextMenuHidden={true}
                        />
                        <TextInput
                          placeholder={'Confirm Pin'} secureTextEntry
                          keyboardType={'numeric'}
                          onChangeText={(cnfpin) => this.setState({ cnfpin })}
                          maxLength={6}
                          placeholderTextColor="#746E6E"
                          style={styles.inputField1}
                          contextMenuHidden={true}
                        />
                      </View>
                      <View style={{ alignItems: 'center', flexdirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                        {/* <Ionicons style={{ color: '#3AA6CD' }} size={25} name='ios-arrow-forward' /> */}
                        <Text>This pin will be asked as another level of security to validate you when accessing clinical information</Text>
                      </View>
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.cusButtonLargeGreen1}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setPIN();
                            }} style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff' }}>SET</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.showVerifyPIN}
                onRequestClose={() => { }}>
                <View style={{ flex: 1 }}>
                  <View style={{ padding: 10, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ minWidth: Dimensions.get('window').width - 30, backgroundColor: '#ffffff', padding: 10 }}>
                      <TouchableOpacity style={{ position: 'absolute', right: -10, top: -10, backgroundColor: 'red', width: 20, height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome
                          onPress={() => { this.setState({ showVerifyPIN: false }) }}
                          style={{
                            fontSize: 20, textAlign: 'center', color: '#ffffff'
                          }}
                          name='times-circle'
                        />
                      </TouchableOpacity>
                      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <TextInput
                          placeholder={'Enter Pin'} secureTextEntry
                          keyboardType={'numeric'}
                          onChangeText={(verifyPIN) => this.setState({ verifyPIN })}
                          maxLength={6}
                          placeholderTextColor="#746E6E"
                          style={styles.inputField1}
                          contextMenuHidden={true}
                        />
                      </View>
                      <View style={{ alignItems: 'center', flexdirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                        {/* <Ionicons style={{ color: '#3AA6CD' }} size={25} name='ios-arrow-forward' /> */}
                        <Text> Please enter the pin you set after first login</Text>
                      </View>
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.cusButtonLargeGreen1}>
                          <TouchableOpacity
                            onPress={() => {
                              this.verifyPIN();
                            }} style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff' }}>SUBMIT</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.showChangePassWord}
                onRequestClose={() => { }}>
                <View style={{ flex: 1 }}>
                  <View style={{ padding: 10, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ minWidth: Dimensions.get('window').width - 30, backgroundColor: '#ffffff', padding: 10 }}>
                      <TouchableOpacity style={{ position: 'absolute', right: -10, top: -10, backgroundColor: 'red', width: 20, height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome
                          onPress={() => { this.setState({ showChangePassWord: false }) }}
                          style={{
                            fontSize: 20, textAlign: 'center', color: '#ffffff'
                          }}
                          name='times-circle'
                        />
                      </TouchableOpacity>

                      <View style={{ alignItems: 'center', flexdirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                        {/* <Ionicons style={{ color: '#3AA6CD' }} size={25} name='ios-arrow-forward' /> */}
                        <Text>Do u want to change username?</Text>
                      </View>
                      <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: "row", marginTop: 10 }}>
                        <View style={styles.cusButtonLargeGreen11}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({ showChangePassWord: false }); this.props.navigation.navigate("GeneralInfoData");
                            }} style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff' }}>Yes</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.cusButtonLargeGreen12}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({ showChangePassWord: false });
                            }} style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff' }}>No</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Modal>
            </ScrollView>
          </View>
        </View>
      </CommonView >
    );
  }
}

const styles = StyleSheet.create({
  blockCard: {
    width: (Dimensions.get('window').width / 3) - 20,
    backgroundColor: 'white',
    shadowColor: '#0000007a',
    shadowOpacity: 0.3,
    height: (Dimensions.get('window').width / 3),
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  quickLinkText: {
    color: '#3AA6CD',
    fontWeight: 'bold',
  },
  quickLink: {
    fontSize: 20, fontWeight: 'bold', position: 'absolute', top: -35, left: 10
  },
  dashTop: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20, marginTop: 5, marginLeft: 1, marginRight: 1
  },
  FirstblockCard: {
    width: (Dimensions.get('window').width / 3) - 13,
    backgroundColor: 'white',
    shadowColor: '#0000007a',
    shadowOpacity: 0.3,
    height: (Dimensions.get('window').width / 4),
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  inputField1: {
    width: '100%',
    fontSize: 12,
    color: '#a9a9a9',
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    paddingLeft: 15,
    paddingRight: 15,
  },
  cusButtonLargeGreen1: {
    paddingTop: 8,
    paddingBottom: 10,
    width: (Dimensions.get('window').width) / 3,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 30,
    fontSize: 15,
    borderWidth: 0,
    borderColor: 'white',
    color: 'white',
    backgroundColor: '#3AA6CD',
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: Dimensions.get("window").width / 3
  },
  cusButtonLargeGreen11: {
    paddingTop: 8,
    paddingBottom: 10,
    width: (Dimensions.get('window').width) / 5,
    paddingLeft: 15,
    marginRight: 15,
    paddingRight: 15,
    borderRadius: 30,
    fontSize: 15,
    borderWidth: 0,
    borderColor: 'white',
    color: 'white',
    backgroundColor: '#3AA6CD',
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: Dimensions.get("window").width / 5
  },
  cusButtonLargeGreen12: {
    paddingTop: 8,
    paddingBottom: 10,
    width: (Dimensions.get('window').width) / 5,
    paddingLeft: 15,

    paddingRight: 15,
    borderRadius: 30,
    fontSize: 15,
    borderWidth: 0,
    borderColor: 'white',
    color: 'white',
    backgroundColor: '#3AA6CD',
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: Dimensions.get("window").width / 5
  },
  myAccount: {
    fontSize: 20, fontWeight: 'bold', marginTop: 4, marginBottom: 3
  },
  dashMyAccount: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginRight: 1, marginLeft: 1
  },
  innerImage: {
    width: 40,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  innerImage1: {
    width: 70,
    height: 70,
    marginLeft: 2
  },
  innerImage2: {
    width: 70,
    height: 70,
    marginLeft: 8
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    color: '#3AA6CD',
    fontWeight: 'bold'
  },
  cardText1: {
    color: '#3AA6CD',
    marginLeft: 10,
    fontWeight: 'bold'
  },
});
export default Dashboard;