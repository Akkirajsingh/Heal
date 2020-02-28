/* eslint-disable global-require */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, ToastAndroid, Dimensions, NetInfo } from 'react-native';
import DialogInput from 'react-native-dialog-input';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;
class ClinicalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { loadingMsg: 'Preparing Dashboard...', targetPageName: '', gender: '', height: '', weight: '', dob: '', login_text: 'Login Securely', showMenu: false, isLoading: true, otpDialogVisible: false, connection_Status: false }
  }
  async componentDidMount() {
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      CONNECTION_STATUS = connectionInfo.type != 'none';
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    if (!CONNECTION_STATUS) {
      ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
    }
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
  }
  handleBackPress = () => {
    return true;
  };
  render() {
    return (
      <CommonView ClinicalInfo={true} showBack={true}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* <View style={{ flex: 1}}> */}
          <View style={{ marginLeft: 15, marginRight: 15 }}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20, marginRight:1, marginTop:1, marginLeft: 1 }}>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Medication')} style={styles.centerView}>
                    <Image source={require('../assets/images/Medication.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Medications</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Allergy')} style={styles.centerView}>
                    <Image source={require('../assets/images/Allergies.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Allergies</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Problems')} style={styles.centerView}>
                    <Image source={require('../assets/images/Problems.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Medical Problems</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity style={styles.centerView} onPress={() => this.props.navigation.navigate('VisitDetails')}>
                    <Image source={require('../assets/images/Visits.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Visits</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('DischargeDetails')} style={styles.centerView}>
                    <Image source={require('../assets/images/Discharge.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Discharge Instructions</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('FamilyHistory')} style={styles.centerView}>
                    <Image source={require('../assets/images/family.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Family History</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('SocialHistory')} style={styles.centerView}>
                    <Image source={require('../assets/images/Social.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Social History</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Immunization')} style={styles.centerView}>
                    <Image source={require('../assets/images/immunization.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Immunization</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('TestAndProcedures')} style={styles.centerView}>
                    <Image source={require('../assets/images/Tests.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Test & Procedures</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.blockCard}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('ClinicalDocuments')} style={styles.centerView}>
                    <Image source={require('../assets/images/Clinical-documents.png')} style={styles.innerImage} />
                    <Text style={styles.cardText}>Clinical Documents</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
        <DialogInput isDialogVisible={this.state.otpDialogVisible}
          title={"Enter One Time Password (OTP)"}
          message={"OTP has been sent to your mobile number"}
          hintInput={"Enter OTP"}
          submitInput={(inputText) => { this.saveUserOtp(inputText) }}
          // textInputProps={{ keyboardType: 'numeric' }}
          closeDialog={() => { this.hideDialog() }}>
        </DialogInput>
      </CommonView>
    );
  }
  async checkOTP(pageName) {
    var otp_login = await AsyncStorage.getItem('OTP_CONFIRM');
    if (otp_login == '' || !otp_login) {
      this.setState({
        otpDialogVisible: true,
        targetPageName: pageName
      });
    } else {
      this.props.navigation.navigate(pageName);
    }
  }
  async saveUserOtp(userOtp) {
    this.setState({
      isLoading: true,
      loadingMsg: 'Verifying OTP...'
    });
    if (userOtp == '333444') {
      AsyncStorage.setItem('OTP_CONFIRM', userOtp).then(() => {
        this.setState({
          otpDialogVisible: false,
          isLoading: false
        }, function () {
          this.props.navigation.navigate(this.state.targetPageName);

        });
      });

    } else {
      this.setState({
        otpDialogVisible: true,
        isLoading: false
      }, function () {
        ToastAndroid.showWithGravity(
          'This OTP is invalid',
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
      });
    }
  }
  hideDialog = () => {
    this.setState({
      otpDialogVisible: false
    });
  };
  showComingSoon = () => {
    ToastAndroid.show('Coming Soon', ToastAndroid.SHORT);
  };
}

const styles = StyleSheet.create({
  blockCard: {
    width: (Dimensions.get("window").width / 2) - 20,
    // backgroundColor: 'transparent',
    backgroundColor: '#fff',
    borderColor: '#fff',
    shadowColor: '#0000007a',
    shadowOpacity: 0.3,
    height: (Dimensions.get("window").width / 4),
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  innerImage: {
    width: 43,
    height: 43,
    tintColor: '#3AA6CD'
  },
  centerView: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    color: 'gray',
    fontWeight: 'bold',
  },
});
export default ClinicalInfo;

