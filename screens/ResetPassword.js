/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, ImageBackground, TouchableOpacity, View, Platform, AlertIOS, ToastAndroid, ActivityIndicator, NetInfo, Dimensions } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { RESET_PASSWORD } from '../constants/APIUrl';
import { RESET_PASS } from '../constants/Lebel';
import { PASS_TYPO_ERR, PASS_VALIDATION_ERR, SERVER_ERR, PASS_UPDATED_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
let RESET_PASSWORD_URL = RESET_PASSWORD;
let CONNECTION_STATUS = false;
class ResetPassword extends Component {  
    constructor(props) {
        super(props);
        this.state = { username: '', CNFpassword: '', Password: '', cnfhidePassword: true, hidePassword: true, iconName1: 'eye-with-line', iconName: 'eye-with-line', isSending: false, Forgotpassword_text: '', Service_URL: '', type: '' };
    }
    async componentDidMount() {
        const { params } = this.props.navigation.state;
        let type = '';
        if (!Utility.IsNullOrEmpty(params)) {
            const Service_URL = params.Service_URL;
            if (params.type == "SignUp") RESET_PASSWORD_URL = `${Service_URL}/api/PatientSignUp/ResetPassword`;
            type = params.type
        }
        this.setState({
            username: params.username,
            Service_URL: Service_URL,
            type: type,
        });
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /****************************** Reset Password starts **************************************************/
    ResetPassword = () => {
        this.setState({ isSending: true });
        const { CNFpassword, Password } = this.state;
        const { navigate } = this.props.navigation;
        if (Password === '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    PASS_TYPO_ERR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(PASS_TYPO_ERR);
            } this.setState({
                isSending: false
            }); return;
        } else if (Password !== CNFpassword) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    PASS_VALIDATION_ERR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(PASS_VALIDATION_ERR);
            } this.setState({
                isSending: false
            }); return;
        }
        const { params } = this.props.navigation.state;
        const ResetPassData = {
            "Name": params.Name,
            "Password": this.state.Password,
            "ConfirmPassword": this.state.CNFpassword,
            "Action": "Reset_Password"
        }
        console.log(ResetPassData, RESET_PASSWORD_URL);
        fetch(RESET_PASSWORD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(ResetPassData)
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("resetes",res);
                if (res.statusCode === 409) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            SERVER_ERR,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        AlertIOS.alert(SERVER_ERR);
                    } this.setState({
                        isSending: false
                    }); return;
                }
                if (res.message.indexOf('Password Updated') > -1) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            PASS_UPDATED_SUCCESS_MSG,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        AlertIOS.alert(PASS_UPDATED_SUCCESS_MSG);
                    } this.setState({
                        isSending: false
                    });
                    if (this.state.type == 'SignUp')
                        navigate('Hospital', { type: this.state.type, Service_URL: this.state.Service_URL, HosName: this.state.HosName, LocationId: this.state.LocationId });
                    else
                        navigate('Login');
                }
            })
            .catch(err => {
                this.setState({ isSending: false });
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
            });
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
    /**
      /**************************************end Reset Password***********************************************/
    render() {
        const { goBack } = this.props.navigation;
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <ScrollView keyboardShouldPersistTaps='always'>
                    <ImageBackground source={require('../assets/images/backgroundImage.jpg')} style={{ width: '100%', height: '100%' }}>
                        <View style={styles.mainContainer}>
                            <AntDesign
                                onPress={() => goBack()}
                                style={{ fontSize: 30, width: '12%', alignItems: 'flex-start', justifyContent: 'flex-start', color: '#000', marginLeft: 5, marginTop: 15 }}
                                name='arrowleft'
                            />
                            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 20 }}>
                                <Text style={{ fontSize: 22, color: '#000000', marginLeft: 25, fontWeight: 'bold' }}>Reset Password</Text>
                            </View>
                            <View
                                style={{
                                    marginTop: 100, paddingLeft: 10, paddingRight: 10
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.label_text}>New Password</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                        value={this.state.Password}
                                        style={styles.inputField}
                                        placeholder={'Atleast 8 characters'}
                                        secureTextEntry={this.state.hidePassword}
                                        onChangeText={Password => this.setState({ Password })}
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
                                        value={this.state.CNFpassword}
                                        secureTextEntry={this.state.cnfhidePassword}
                                        style={styles.inputField}
                                        placeholder={'Enter your confirm password'}
                                        onChangeText={CNFpassword => this.setState({ CNFpassword })}
                                        visible-password
                                    />
                                    <Entypo name={this.state.iconName1} size={16} style={{ color: '#0da4da', top: 10, right: 25 }} onPress={() => this.toggleConfPassword()} />
                                </View>
                            </View>
                            <View style={{ margin: 16 }} />

                            <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.ResetPassword()}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 9 }} /> : undefined}
                                        <Text
                                            style={styles.LoginButton}
                                        >
                                            Reset Password
                          </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ImageBackground>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        height: 30, width: '100%', marginBottom: 10, borderBottomWidth: 0.6, borderBottomColor: '#86d1ec'
    },
    label_text: {
        fontSize: 15, color: 'black', fontWeight: 'bold'
    },
    LoginButton: {
        color: 'white',
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17
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
    mainContainer: { height: DEVICE_HEIGHT, width: DEVICE_WIDTH },
});

export default ResetPassword;
