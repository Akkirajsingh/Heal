import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, View, Platform, AlertIOS, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { SIGNUP_MANDATORY_FIELD_ERR, PASS_MISMATCH_ERR, PASS_VALIDATION } from '../constants/Messages';
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import { SEQURITY_QUESTION, IS_USERNAME_EXISTS_API, ADD_ACCOUNT_API } from '../constants/APIUrl';
import { SECURITY_QUES_MSG } from '../constants/Lebel';
import Utility from '../components/Utility';
let SEQURITY_QUESTION_URL = SEQURITY_QUESTION;
let IS_USERNAME_EXISTS_URL = IS_USERNAME_EXISTS_API;
let ADD_ACCOUNT_API_URL = ADD_ACCOUNT_API;

class AddAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            accountRegId: '',
            SecurityQuesItem: [],
            SecuritySecondQuesItem: [],
            firstSecurityQuestionEncrypted: '',
            firstSecurityQuestionAnswer: '',
            secondSecurityQuestionEncrypted: '',
            secondSecurityQuestionAnswer: '',
            password: '',
            cnfpassword: '',
            action: '',
            usernameAvailable: ''
        };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({ isSending: false, isLoading: false });
                const { params } = this.props.navigation.state;
                let Service_URL = '', HosName = '', LocationId = '';
                if (!Utility.IsNullOrEmpty(params.Service_URL)) {
                    Service_URL = params.Service_URL;
                    SEQURITY_QUESTION_URL = `${Service_URL}api/MasterService/GetAllSecurityQuestions`;
                    IS_USERNAME_EXISTS_URL = `${Service_URL}api/PatientSignUp/IsUserNameExist`;
                    ADD_ACCOUNT_API_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
                    type = params.type;
                    HosName = params.HosName;
                    LocationId = params.LocationId,
                        firstName = params.firstName,
                        action = params.action
                }
                this.setState({
                    Service_URL: Service_URL,
                    type: params.type,
                    HosName: HosName,
                    LocationId: LocationId,
                    accountRegId: params.accountRegId,
                    action: params.action
                });
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    CONNECTION_STATUS = connectionInfo.type != 'none';
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
                if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
                this.securityQuestionsData();
            }
        );
    }
    async componentDidMount() {
        const { params } = this.props.navigation.state;
        let Service_URL = '', HosName = '', LocationId = '';
        if (!Utility.IsNullOrEmpty(params.Service_URL)) {
            Service_URL = params.Service_URL;
            SEQURITY_QUESTION_URL = `${Service_URL}api/MasterService/GetAllSecurityQuestions`;
            IS_USERNAME_EXISTS_URL = `${Service_URL}api/MasterService/IsUserNameExist`;
            ADD_ACCOUNT_API_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
            type = params.type;
            HosName = params.HosName;
            LocationId = params.LocationId,
                firstName = params.firstName,
                action = params.action
        }
        this.setState({
            Service_URL: Service_URL,
            type: params.type,
            HosName: HosName,
            LocationId: LocationId,
            accountRegId: params.accountRegId,
            action: params.action
        });
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        this.securityQuestionsData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    securityQuestionsData = () => {
        fetch(SEQURITY_QUESTION_URL, {
            method: 'GET',
            headers: {
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json()).then((responseJson) => {
            const drop_down_data = [];
            const second_dropDown_data = [];
            for (let i = 0; i < responseJson.responseData._MasterSecurityQuestionOneList.length; i++) {
                drop_down_data.push({ label: responseJson.responseData._MasterSecurityQuestionOneList[i].question, value: responseJson.responseData._MasterSecurityQuestionOneList[i].id });
            }
            for (let i = 0; i < responseJson.responseData._MasterSecurityQuestionTwoList.length; i++) {
                second_dropDown_data.push({ label: responseJson.responseData._MasterSecurityQuestionTwoList[i].question, value: responseJson.responseData._MasterSecurityQuestionTwoList[i].id });
            }
            this.setState({
                SecurityQuesItem: drop_down_data,
                SecuritySecondQuesItem: second_dropDown_data,
                isLoading: false,
            }, () => {
            });
        }).catch((error) => {
            this.setState({ isLoading: false });
        });
    }
    changeSecurityStatus = (value) => {
        this.setState({
            firstSecurityQuestionEncrypted: value
        });
    }
    changeSecurityQuesStatus = (value) => {
        this.setState({
            secondSecurityQuestionEncrypted: value
        });
    }
    isUsernameAvailable(username) {
        console.log(username);
        this.setState({ username: username });
        fetch(IS_USERNAME_EXISTS_URL + '?UserName=' + username, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json',
            },
        }).then((response) => response.json()).then((res) => {
            console.log(res);
            if (res.responseData == 1) {
                this.setState({ usernameAvailable: false });
            } else if (res.responseData == 0) {
                this.setState({ usernameAvailable: true });
            } else {
                this.setState({ usernameAvailable: false })
            }
        });
    }
    addAccount() {
        console.log(ADD_ACCOUNT_API_URL);
        let { username, firstSecurityQuestionEncrypted, firstSecurityQuestionAnswer, secondSecurityQuestionEncrypted, secondSecurityQuestionAnswer, password, cnfpassword } = this.state;
        const { navigate } = this.props.navigation;
        const strongRegex = new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
        if (username == '' || firstSecurityQuestionEncrypted === '' || secondSecurityQuestionEncrypted === '' || firstSecurityQuestionAnswer === '' || secondSecurityQuestionAnswer === '' || password === '' || cnfpassword === '') {
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
        } else if (password !== cnfpassword) {
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
        } else if (strongRegex.test(password) === false) {
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
        const addAccountData = {
            "Name": this.state.username,
            "accountRegID": this.state.accountRegId,
            "firstSecurityQuestionEncrypted": this.state.firstSecurityQuestionEncrypted,
            "firstSecurityQuestionAnswer": this.state.firstSecurityQuestionAnswer,
            "secondSecurityQuestionEncrypted": this.state.secondSecurityQuestionEncrypted,
            "SecondSecurityQuestionAnswer": this.state.secondSecurityQuestionAnswer,
            "password": this.state.password,
            "action": "SignUp"
        }
        console.log(addAccountData);
        fetch(ADD_ACCOUNT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(addAccountData)
        }).then((response) => response.json()).then((res) => {
            console.log(res);
            if (res.statusCode !== 200) {
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
                });
            }
            if (this.state.type == "SignUp")
                navigate('Hospital', {
                    type: 'SignUp', Service_URL: this.state.Service_URL,
                    LocationId: this.state.LocationId,
                    HosName: this.state.HosName
                });
            else navigate('Login');
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
    render() {
        const { goBack } = this.props.navigation;
        return (
            <KeyboardAvoidingView behavior="padding" enabled>
                <ScrollView keyboardShouldPersistTaps='always'>
                    <View style={{ marginTop: 37 }} />
                    <Ionicons
                        onPress={() => goBack()}
                        style={styles.arrowBackIcon}
                        name='ios-arrow-back'
                    />
                    <View style={{ padding: 20, flex: 1, flexDirection: 'column' }}>
                        <View style={styles.userAvailability}>
                            <TextInput
                                placeholder={'Check username availability'}
                                autoCapitalize='none'
                                onChangeText={(username) => this.isUsernameAvailable(username)}
                                maxLength={25}
                                placeholderTextColor="#746E6E"
                                style={styles.inputField}
                            />
                            {this.state.usernameAvailable === '' ?
                                <View>
                                    <Feather
                                        style={styles.iconCss}
                                        name='alert-triangle'
                                        color={'#FDB81E'}
                                    />
                                </View>
                                :
                                <View>
                                    {this.state.usernameAvailable ?
                                        <Ionicons
                                            style={styles.iconCss}
                                            name='ios-checkmark-circle'
                                            color={'green'}
                                        />
                                        :
                                        <FontAwesome
                                            style={styles.iconCss}
                                            name='times-circle-o'
                                            color={'red'}
                                        />
                                    }
                                </View>
                            }
                        </View>
                        <TextInput
                            placeholder={'Enter Password'} secureTextEntry
                            onChangeText={(password) => this.setState({ password })}
                            maxLength={100}
                            placeholderTextColor="#746E6E"
                            style={styles.inputField1}
                        />
                        <TextInput
                            placeholder={'Confirm Password'} secureTextEntry
                            onChangeText={(cnfpassword) => this.setState({ cnfpassword })}
                            maxLength={100}
                            placeholderTextColor="#746E6E"
                            style={styles.inputField1}
                        />
                        <View style={styles.securityQuess}><Text style={{ color: '#000', fontSize: 15 }}>{SECURITY_QUES_MSG}</Text></View>
                        <Dropdown
                            label='Security Question no. 1'
                            data={this.state.SecurityQuesItem}
                            labelHeight={18}
                            value={this.state.firstSecurityQuestionEncrypted}
                            fontSize={12}
                            onChangeText={(val, index, data) => this.changeSecurityStatus(val, index, data)}

                            textColor='#746E70'
                            selectedItemColor='#746E70'
                            baseColor="#746E70"
                        />
                        <TextInput
                            style={styles.inputField1}
                            placeholder={'Answer'}
                            maxLength={80}
                            secureTextEntry={false}
                            onChangeText={(firstSecurityQuestionAnswer) => this.setState({ firstSecurityQuestionAnswer })}
                            placeholderTextColor="#746E70"
                        />
                        <Dropdown
                            label='Security Question no. 2'
                            data={this.state.SecuritySecondQuesItem}
                            labelHeight={18}
                            fontSize={12}
                            onChangeText={(val, index, data) => this.changeSecurityQuesStatus(val, index, data)}
                            value={this.state.secondSecurityQuestionEncrypted}
                            textColor='#746E70'
                            selectedItemColor='#746E70'
                            baseColor="#746E70"
                        />
                        <TextInput
                            style={styles.inputField1}
                            placeholder={'Answer'}
                            labelHeight={18}
                            maxLength={80}
                            secureTextEntry={false}
                            onChangeText={(secondSecurityQuestionAnswer) => this.setState({ secondSecurityQuestionAnswer })}
                            placeholderTextColor="#746E70"
                        />
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 7, marginTop: 7 }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.addAccount()}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text style={{ color: 'white', fontWeight: 'bold' }} >Finish</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        width: '90%',
        fontSize: 12,
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
        paddingLeft: 15,
        paddingRight: 15
    },
    securityQuess: {
        marginTop: 10, width: '100%', height: 30, elevation: 1, borderBottomColor: 'gray', borderBottomWidth: 0.3, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center'
    },
    iconCss: {
        fontSize: 20, textAlign: 'center'
    },
    userAvailability: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
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
    arrowBackIcon: {
        fontSize: 30, top: 20, textAlign: 'center', color: '#9A9797', position: 'absolute', left: 10,
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
        flex: 1,
        flexDirection: 'row'
    }
});
export default AddAccount;
