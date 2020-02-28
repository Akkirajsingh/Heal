import React, { Component } from 'react';
import {
    TextInput, Image, ScrollView, StyleSheet, Text, KeyboardAvoidingView,
    View, ToastAndroid, ActivityIndicator, NetInfo
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import aPIStatusInfo from "../components/ErrorHandler";

let CONNECTION_STATUS = false;
class ForgotPassword1 extends Component {

    constructor(props) {
        super(props);
        this.state = { username: '', isSending: false, Forgotpassword_text: '' }
        this.props.navigation.addListener(
            'willFocus',
            async () => {
                this.setState({
                    username: '',
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
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**
 * Forgotpassword starts
 */
    Forgotpassword = () => {
        this.setState({ isSending: true });
        const { username } = this.state;
        const { navigate } = this.props.navigation;
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let U_NAME = username;
        U_NAME = U_NAME.trim();
        if (U_NAME === '' || U_NAME == null) {
            ToastAndroid.showWithGravity(
                'Please Enter your EmailId',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({
                isSending: false
            }); return;
        }
        else if (reg.test(username) === false) {
            ToastAndroid.showWithGravity(
                'Invalid Email',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({
                isSending: false
            }); return;
        }
        else {
            this.setState({
                Forgotpassword_text: 'Please wait..',
                isSending: false
            })
        }

        const data = "userid=00000000-0000-0000-0000-000000000000" + "&EmailEncrypted=" + this.state.username + "&confirmPassword=null" + "&otpLimit=null" + "&action=SetPassword" +
            "&secondSecurityQuestion=null" + "&firstSecurityQuestion=null" + "&name=null" + "&password=null" + "&thirdSecurityQuestionAnswer=null"
            + "&thirdSecurityQuestionEncrypted=null" + "&thirdSecurityQuestionEncrypted=null" + "&secondSecurityQuestionAnswer=null" +
            "&secondSecurityQuestionEncrypted=null" + "&firstSecurityQuestionAnswer=null" + "&firstSecurityQuestionEncrypted=null";
        fetch('https://care.patientheal.com/PatientCareServices/api/PatientSignUp/ForgotPassword', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            "body": data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.statusCode == 409) 
                {
                    ToastAndroid.showWithGravity(
                        'Email id did not matched our records! Please try again',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({
                        isSending: false
                    }); return;
                }
                else 
                {
                    if (res.responseData === '' || res.responseData == null) {
                        ToastAndroid.showWithGravity(
                            'Something Went Wrong! Please Wait for sometimes',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        ); this.setState({
                            isSending: false
                        });
                        return false;

                    }
                    else {
                        ToastAndroid.showWithGravity(
                            'Great", "OTP Sent to your EmailId',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                        console.log(res);
                        this.setState({
                            username: '',
                            isSending: false
                        });
                        navigate('OtpPage', { email: res.responseData.email, otp: res.responseData.otp });
                    }
                }
            })
            .catch(err => {
                this.setState({
                    isSending: false,
                });
                console.log('Errormsg:', err);
                const errMSg = aPIStatusInfo.logError(err);
                this.props.dispatch(ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : 'An error occured! Please Try Again',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ));
                this.setState({
                    isSending: false,
                });
                return;
            });
    }
    //end Forgotpassword
    render() {
        const { goBack } = this.props.navigation;
        return (

            // <CommonView isLoginScreen={false} showBack={true}>
            <KeyboardAvoidingView behavior="padding" enabled>
                <ScrollView keyboardShouldPersistTaps='always'>

                    <View style={{ marginTop: 37 }} />
                    <Ionicons
                        onPress={() => goBack()}
                        style={{ fontSize: 30, top: 20, textAlign: 'center', color: '#9A9797', position: 'absolute', left: 10 }}
                        name='ios-arrow-back'
                    />
                    <View
                        style={{
                            padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.CircleShapeView} >
                                <Image source={require('../assets/images/forgot-pssword-image.png')} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }} />
                            </View>
                        </View>
                        <Text style={{ fontSize: 24, marginBottom: 20, color: '#787878' }}>Forgot Password ?</Text>
                        <Text style={{ fontSize: 12, marginBottom: 20, color: '#AEAEAE' }}>We need your registered email address to send OTP</Text>
                        <View style={styles.inputField}>
                            <Entypo style={{ fontSize: 15, fontWeight: 10, color: '#ABA6A6', paddingTop: 6 }} name='mail' />
                            <TextInput
                                style={styles.inputField1}
                                placeholder={'E-mail address'}
                                placeholderTextColor={'gray'}
                                value={this.state.username}
                                keyboardType={'email-address'}
                                secureTextEntry={false}
                                onChangeText={(username) => this.setState({ username })}
                            />
                        </View>
                        <View style={{ margin: 10 }} />
                        <View style={styles.cusButtonLargeGreen1}>
                            {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                            <Text 
                            style={{ color: 'white', fontWeight: 'bold' }}
                                onPress={() => this.Forgotpassword()}
                            >
                                Send OTP
                                </Text>
                        </View>
                        {/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.cusButtonLargeGreen}
                                onPress={this.props.navigation.navigate('Login')}>
                                Back To Login Page
                                </Text>
                       </View> */}
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
            // </CommonView>
        )
    }
}

const styles = StyleSheet.create({
    inputField: {
        width: '100%', color: '#B1B1B0', flexDirection: 'row', backgroundColor: '#ffffff00', borderBottomWidth: 1, borderBottomColor: '#C6BDBD',
    },
    inputField1: {
        color: '#B1B1B0', backgroundColor: "#ffffff00", paddingLeft: 7
    },
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
        flexDirection: "row"
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
