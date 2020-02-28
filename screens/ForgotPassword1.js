import React, { Component } from 'react';
import { TextInput, Image, ScrollView, StyleSheet, AlertIOS, Text, KeyboardAvoidingView, Dimensions, ImageBackground, View, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity, Platform } from 'react-native';
import { USERNAME_VALIDATION_ERR } from '../constants/Messages';
import { FORGOT_PASS_MAIN_HEADING, FORGOT_PASS_SUB_HEADING } from '../constants/Lebel';
import { GET_SECURITY_QUESTION, FORGOT_PASSWORD } from '../constants/APIUrl';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Utility from '../components/Utility';
let FORGOT_PASSWORD_URL = FORGOT_PASSWORD;
let CONNECTION_STATUS = false;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
class ForgotPassword1 extends Component {
    constructor(props) {
        super(props);
        this.state = { username: '', isSending: false, Forgotpassword_text: '', type: '',mobileNo:'' };
        this.props.navigation.addListener(
            'willFocus',
            async () => {
                this.setState({
                    username: '', Service_URL: '', isSending: false, mobileNo:''
                });
            }
        );
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type == 'none' ? false : true;
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        const { params } = this.props.navigation.state;
        let type = '';
        if (!Utility.IsNullOrEmpty(params)) {
            type = params.type;
            const Service_URL = params.Service_URL;
            if (type == "SignUp") FORGOT_PASSWORD_URL = `${Service_URL}api/PatientSignUp/ForgotPassword`;
            this.setState({
                Service_URL: Service_URL,
                type: type
            });
        }

    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*********************************************************************************************************** */
    ForgotPassword () {
        this.setState({ isSending: true });
        let username = (this.state.username).trim();
        if (username.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    USERNAME_VALIDATION_ERR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(USERNAME_VALIDATION_ERR);
            } this.setState({
                isSending: false
            }); return;
        }
       else if (this.state.mobileNo.length != 10) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please Enter Mobile Number',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please Enter Mobile Number');
            } this.setState({
                isSending: false
            }); return;
        }
        const forgotPassData = {
             "Name": this.state.username,
            "phoneNoEncrypted": this.state.mobileNo,
        }
        fetch(FORGOT_PASSWORD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            "body": JSON.stringify(forgotPassData)
        }).then(response => response.json()).then(res => {
            console.log("resotp",res);
            if (res.statusCode == 200) {
                this.props.navigation.navigate('OtpPage', {
                    Name: res.responseData.name, phoneNo: res.responseData.phone, type: this.state.type,Service_URL: this.state.Service_URL
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
                } this.setState({
                    isSending: false
                }); return;
            }
        }).catch(err => {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    err.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(err.message);
            } this.setState({
                isSending: false
            }); return;
        });
    }
    render() {
        const { goBack } = this.props.navigation;
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <ScrollView keyboardShouldPersistTaps='always'>
                <ImageBackground source={require('../assets/images/ForgotpasswordBG.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.mainContainer}>
                        <AntDesign
                            onPress={() => goBack()}
                            style={{ fontSize: 30, width: '12%', alignItems:'flex-start', justifyContent:'flex-start', color:'#000',marginLeft:5, marginTop:12 }}
                            name='arrowleft'
                        />
                        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 10 }}>
                            <Text style={{ fontSize: 22, color: '#000000', marginLeft: 10, fontWeight: 'bold' }}>Forgot Password?</Text>
                        </View>
                        <View
                            style={{
                                padding: 20, alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={require('../assets/images/ForgotPassword-illustrations.png')} style={{ width: 170, height: 170 }} />
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, marginBottom: 20, color: '#000', fontWeight:'bold' }}>Enter your registered UserName to receive {"\n"}         one time password(OTP)</Text></View>
                            <View style={styles.inputField}>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Enter UserName'}
                                    // placeholderTextColor={'gray'}
                                    value={this.state.username}
                                    secureTextEntry={false}
                                    onChangeText={(username) => this.setState({ username })}
                                />
                            </View>
                            <View style={styles.inputField3}>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Enter Mobile Number'}
                                    // placeholderTextColor={'gray'}
                                    keyboardType={'numeric'}
                                    value={this.state.mobileNo}
                                    secureTextEntry={false}
                                    onChangeText={(mobileNo) => this.setState({ mobileNo })}
                                />
                            </View>
                            <View style={{ margin: 16 }} />

                            <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.ForgotPassword()}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 9 }} /> : undefined}
                                        <Text
                                            style={styles.LoginButton}
                                        >
                                            Get OTP
                          </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
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
        width: '100%', color: '#B1B1B0', flexDirection: 'row', backgroundColor: '#ffffff00', borderBottomWidth: 1, borderBottomColor: '#86d1ec',
    },
    inputField3: {
        width: '100%', color: '#B1B1B0', flexDirection: 'row', marginTop:16, backgroundColor: '#ffffff00', borderBottomWidth: 1, borderBottomColor: '#86d1ec',
    },
    inputField1: {
        color: '#B1B1B0', backgroundColor: '#ffffff00', paddingLeft: 7, width: '100%', 
    },
    mainContainer: { height: DEVICE_HEIGHT, width: DEVICE_WIDTH },
    cusButtonLargeGreen: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1
    },
    LoginButton: {
        color: 'white',
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17
      },
    container: {
        backgroundColor: '#fff',
        flex: 1,
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
    CircleShapeView: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        backgroundColor: '#D5D2D2',
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default ForgotPassword1;