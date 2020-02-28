import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, View, Platform, AlertIOS, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity, Dimensions, AsyncStorage } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { SIGNUP_MANDATORY_FIELD_ERR } from '../constants/Messages';
import { Ionicons } from '@expo/vector-icons';
import { SEQURITY_QUESTION, UPDATE_ACCOUNT_API } from '../constants/APIUrl';
import Utility from '../components/Utility';
import CommonView from '../components/CommonView';
let SEQURITY_QUESTION_URL = SEQURITY_QUESTION;
let UPDATE_ACCOUNT_API_URL = UPDATE_ACCOUNT_API;

class AccountUpdate extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({ isSending: false, isLoading: false });
                this.securityQuestionsData();
            }
        );
    }
    async componentDidMount() {
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
    updateAccount = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let { firstSecurityQuestionEncrypted, firstSecurityQuestionAnswer, secondSecurityQuestionEncrypted, secondSecurityQuestionAnswer } = this.state;
        if (firstSecurityQuestionEncrypted === '' || secondSecurityQuestionEncrypted === '' || firstSecurityQuestionAnswer === '' || secondSecurityQuestionAnswer === '') {
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
        }
        const updateAccountData = {
            "Id": USER_DATA.Id,
            "Name": USER_DATA.userName,
            "firstSecurityQuestion": (this.state.firstSecurityQuestionEncrypted).toString(),
            "firstSecurityQuestionAnswer": this.state.firstSecurityQuestionAnswer,
            "secondSecurityQuestion": (this.state.secondSecurityQuestionEncrypted).toString(),
            "SecondSecurityQuestionAnswer": this.state.secondSecurityQuestionAnswer,
        }
        fetch(UPDATE_ACCOUNT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'token_type': 'bearer',
                'Authorization': 'Bearer' + USER_DATA.ACCESS_TOKEN
            },
            body: JSON.stringify(updateAccountData)
        }).then((response) => response.json()).then((res) => {
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
            this.props.navigation.goBack();
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
        return (
            <CommonView customHeading='Account Update' AccountUpdate={true} showBack={true}>
                <View style={{ flex: 1, backgroundColor: '#f1f2f6' }}>
                    <View style={{ marginLeft: 15, marginRight: 15, marginTop: 15 }}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
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
                                    <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.updateAccount()}>
                                        <View style={{ flexDirection: 'row' }}>
                                            {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                            <Text style={{ color: 'white', fontWeight: 'bold' }} >Finish</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
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
        flex: 1,
        flexDirection: 'row'
    }
});
export default AccountUpdate;