/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, ActivityIndicator, StyleSheet, Text, NetInfo, AlertIOS, Platform, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage } from 'react-native';
import CommonView from '../components/CommonView';
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { CHANGEPASSWORD } from '../constants/APIUrl';
import Utility from '../components/Utility';
import { PASS_MISMATCH_ERR, PASS_VALIDATION, USERS_VALIDATION_ERROR, PASS_CHANGED_SUCCESS_MSG, PASS_INCORRECT_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';

let CONNECTION_STATUS = false;
class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Userid: '', AccessToken: '', newPassword: '', currentPass: '', confirmPassword: '', email_id: '', iconName: 'eye-with-line', iconName1: 'eye-with-line', iconName2: 'eye-with-line'
        };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let DASHBOARD_DATA = await AsyncStorage.getItem('DASHBOARD_DATA');
        DASHBOARD_DATA = Utility.IsNullOrEmpty(DASHBOARD_DATA) ? '' : JSON.parse(DASHBOARD_DATA);
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            email_id: DASHBOARD_DATA.email_id
        });
    }

    /********************************************************************************************************** */
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
         /***
 * toggle password
 * */
  togglePassword = () => {
    if (this.state.currentPass) {
      this.setState({
        currentPass: false,
        iconName: 'eye'
      });
    } else {
      this.setState({
        currentPass: true,
        iconName: 'eye-with-line'
      });
    }
  };
  togglePassword1 = () => {
    if (this.state.newPassword) {
      this.setState({
        newPassword: false,
        iconName1: 'eye'
      });
    } else {
      this.setState({
        newPassword: true,
        iconName1: 'eye-with-line'
      });
    }
  };
  togglePassword2 = () => {
    if (this.state.confirmPassword) {
      this.setState({
        confirmPassword: false,
        iconName2: 'eye'
      });
    } else {
      this.setState({
        confirmPassword: true,
        iconName2: 'eye-with-line'
      });
    }
  };
  /**
    /*****************************************************Add Immunization Api Call *****************************************************************/
    changePassword = () => {
        const { currentPass, newPassword, confirmPassword } = this.state;
        const strongRegex = new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
        if (currentPass === '' || newPassword === '' || confirmPassword === '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    USERS_VALIDATION_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(USERS_VALIDATION_ERROR);
            } return;
        } else if (newPassword !== confirmPassword) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    PASS_MISMATCH_ERR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(PASS_MISMATCH_ERR);
            } this.setState({
                isSending: false
            }); return;
        } else if (strongRegex.test(newPassword) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    PASS_VALIDATION,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(PASS_VALIDATION);
            } this.setState({
                isSending: false
            }); return;
        }
        const changePass = {
            userid: this.state.Userid,
            email: null,
            emailEncrypted: this.state.email_id,
            oldPassword: this.state.currentPass,
            newPassword: this.state.newPassword,
            confirmPassword: this.state.confirmPassword,
        };
        console.log('changePass', changePass);
        fetch(CHANGEPASSWORD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(changePass)
        }).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                // let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                // await AsyncStorage.removeItem(USER_DATA.ACCESS_TOKEN);
                // await AsyncStorage.removeItem('ACCESS_TYPE');
                if (Platform.OS !== 'ios') {
                ToastAndroid.show(PASS_CHANGED_SUCCESS_MSG, ToastAndroid.SHORT);
                } else {
                    AlertIOS.alert(PASS_VALIDATION);
                }
                this.setState({
                }, function () {
                    this.props.navigation.navigate('Login');
                });
            } else if (res.statusCode == 409) {
                ToastAndroid.show(PASS_INCORRECT_MSG, ToastAndroid.SHORT);
            }
        })
            .catch(err => {
                console.log('errlog', err);
                this.setState({
                    isLoggingIn: false,
                });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /************************************************************************************************************ */
    render() {
        return (
            <CommonView changePassword >
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7, paddingTop: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, }}>
                            <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingRight: 4, paddingTop: 12 }} size={19} name='cellphone-lock' />
                            <TextInput
                                style={styles.inputField}
                                placeholder={'Enter Current Password'}
                                secureTextEntry
                                placeholderTextColor='#938F97'
                                onChangeText={(currentPass) => this.setState({ currentPass })}
                            />
                              {/* <Entypo name={this.state.iconName} size={16} style={{ color: '#3aa6cd', top: 20, right: 40 }} onPress={() => this.togglePassword()} /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, }}>
                            <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingRight: 4, paddingTop: 12 }} size={19} name='lock-reset' />
                            <TextInput
                                style={styles.inputField}
                                placeholder={'New Password'}
                                secureTextEntry
                                placeholderTextColor='#938F97'
                                onChangeText={(newPassword) => this.setState({ newPassword })}
                            />
                                {/* <Entypo name={this.state.iconName1} size={16} style={{ color: '#3aa6cd', top: 20, right: 40 }} onPress={() => this.togglePassword1()} /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, }}>
                            <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingRight: 4, paddingTop: 12 }} size={19} name='lock-reset' />
                            <TextInput
                                style={styles.inputField}
                                placeholder={'Confirm Password'}
                                secureTextEntry
                                placeholderTextColor='#938F97'
                                onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                            />
                                {/* <Entypo name={this.state.iconName2} size={16} style={{ color: '#3aa6cd', top: 20, right: 40 }} onPress={() => this.togglePassword2()} /> */}
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.changePassword(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Submit
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 2,
        flexDirection: 'row'
    },
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        marginBottom: 4,
        paddingTop: 9,
        fontSize: 17,
        paddingLeft: 5
    },
});

export default ChangePassword;

