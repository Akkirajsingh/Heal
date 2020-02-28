/* eslint-disable global-require */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, BackHandler, TouchableOpacity, AsyncStorage, View, ToastAndroid, Dimensions, NetInfo } from 'react-native';
import CommonView from '../components/CommonView';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
let CONNECTION_STATUS = false;
let DASHBOARD_URL = '';
class HospitalDashboard extends Component {
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload =>
        BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid
        )
    );
    this.state = { loadingMsg: 'Preparing Dashboard...', targetPageName: '', gender: '', height: '', weight: '', dob: '', login_text: 'Login Securely', showMenu: false, isLoading: true, otpDialogVisible: false, connection_Status: false };
  }
  onBackButtonPressAndroid = async () => {
    // await AsyncStorage.removeItem('USER_DATA.Hospital');
    await AsyncStorage.removeItem('ACCESS_TYPE');
    let USER_DATA = await AsyncStorage.getItem('USER_DATA');
    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
    //if (USER_DATA.hasOwnProperty("Hospital")) delete USER_DATA.Hospital;
    await AsyncStorage.removeItem("USER_DATA");
    await AsyncStorage.setItem("USER_DATA", JSON.stringify(USER_DATA));
    ToastAndroid.show('You have Logged out Successfully!', ToastAndroid.SHORT);
    if (true) {

      this.props.navigation.navigate("Dashboard");
      return true;
    } else {
      return false;
    }
  };

  async componentDidMount() {
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) {
      ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
    }
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid
        )
    );
    let USER_DATA = await AsyncStorage.getItem('USER_DATA');
    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
    if (USER_DATA.hasOwnProperty('Hospital')) {
      DASHBOARD_URL = USER_DATA.Hospital.ServiceURL + "api/PatientService/Dashboard";
    }
    console.log("hospdas", DASHBOARD_URL)
    fetch(DASHBOARD_URL, {

      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': 'Bearer ' + USER_DATA.Hospital.ACCESS_TOKEN,
      },
    }).then(aPIStatusInfo.handleResponse)
      .then((response) => response.json()).then((res) => {
        // console.log("hospdasres", res)
        // const response = res.responseData.generalResult[0];
        // this.setState({
        //   gender: response.genderDecrypted,
        //   height: response.height,
        //   weight: response.weights,
        //   dob: response.dateOfBirthEncrypted,
        //   isLoading: false
        // }, () => {
        //   const unreadMsg = res.responseData.messagesResult[0].messageUnReadTotal.toString();
        //   AsyncStorage.setItem('UNREAD_MESSAGE', unreadMsg);
        // });
      })
      .catch(err => {
        console.log("hospitalDash", err)
        const errMSg = aPIStatusInfo.logError(err);
        ToastAndroid.showWithGravity(
          errMSg.length > 0 ? errMSg : COMMON_ERROR,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        this.setState({ refreshing: false });
        return;
      });
  }
  async componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    // await AsyncStorage.removeItem('USER_DATA.Hospital');
    // let USER_DATA = await AsyncStorage.getItem('USER_DATA');
    // USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
    // if (USER_DATA.hasOwnProperty("Hospital")) delete USER_DATA.Hospital;
    // await AsyncStorage.removeItem("USER_DATA");
    // await AsyncStorage.setItem("USER_DATA", JSON.stringify(USER_DATA));
    // await AsyncStorage.removeItem('ACCESS_TYPE');
    ToastAndroid.show('You have Logged out Successfully!', ToastAndroid.SHORT);
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
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Prescriptions')} style={styles.centerView}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={require('../assets/icons/Prescription.png')}  style={styles.innerImage} />
                        <Text style={styles.cardText}>Prescrip- {'\n'} tions </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.FirstblockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Appointments')}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={require('../assets/icons/Appointment.png')} style={styles.innerImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.cardText}>  Book  </Text>
                        <Text style={styles.quickLinkText}>Appoint- {'\n'} ment</Text></View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.FirstblockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('searchDoctors')} style={styles.centerView}>
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
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('ClinicalInfo')} style={styles.centerView}>
                    <Image source={require('../assets/icons/History.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText}>My History</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('HealthTrackerListing')}>
                    <Image source={require('../assets/icons/Health-Tracker.png')} style={styles.innerImage2} />
                    <Text style={styles.cardText}>Health Tracker</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('VitalsHistory')} style={styles.centerView}>
                    <Image source={require('../assets/icons/Vitals.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText}>Vitals</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('RecordAccess')}>
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
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('BillList')}>
                    <Image source={require('../assets/icons/Billpay.png')} style={styles.innerImage1} />
                    <Text style={styles.cardText1}>Bill Pay</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
export default HospitalDashboard;