import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, View, Platform, AlertIOS, ToastAndroid, ActivityIndicator, NetInfo, TouchableOpacity, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { SIGNUP_MANDATORY_FIELD_ERR, PASS_MISMATCH_ERR, PASS_VALIDATION } from '../constants/Messages';
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import { SEQURITY_QUESTION, VERIFY_QUESTIONS } from '../constants/APIUrl';
import { VERIFY_QUESTIONS_LABEL } from '../constants/Lebel';
import Utility from '../components/Utility';
let SEQURITY_QUESTION_URL = SEQURITY_QUESTION;
let VERIFY_QUESTIONS_URL = VERIFY_QUESTIONS;

class VerifyQuestions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            questionsData: [],
            SecurityQuesItem: [],
            SecuritySecondQuesItem: [],
            firstSecurityQuestionEncrypted: '',
            firstSecurityQuestionAnswer: '',
            secondSecurityQuestionEncrypted: '',
            secondSecurityQuestionAnswer: '',
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
        const { params } = this.props.navigation.state;
        this.setState({
            username: params.username,
            questionsData: params.questionsData
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
    securityQuestionsData = () => {
        fetch(SEQURITY_QUESTION_URL, {
            method: 'GET',
            headers: {
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json()).then((responseJson) => {
            responseJson.responseData._MasterSecurityQuestionOneList.forEach(element => {
                const filteredQuestion = this.state.questionsData.filter(x => x.question == element.id);
                if (filteredQuestion[0]) {
                    this.setState({ firstSecurityQuestionEncrypted: element.question });
                    return false;
                }
            });
            responseJson.responseData._MasterSecurityQuestionTwoList.forEach(element => {
                const filteredQuestion = this.state.questionsData.filter(x => x.question == element.id);
                if (filteredQuestion[0]) {
                    this.setState({ secondSecurityQuestionEncrypted: element.question });
                    return false;
                }
            });
        }).catch((error) => {
            this.setState({ isLoading: false });
        });
    }
    verifyQuestions = () => {
        const verifyQuestionsData = {
            "Name": this.state.username,
            "firstSecurityQuestionEncrypted": this.state.questionsData[0].question,
            "firstSecurityQuestionAnswer": this.state.firstSecurityQuestionAnswer,
            "secondSecurityQuestionEncrypted": this.state.questionsData[1].question,
            "SecondSecurityQuestionAnswer": this.state.secondSecurityQuestionAnswer,
            "Action": "Verify_Questions"
        }
        fetch(VERIFY_QUESTIONS_URL, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify(verifyQuestionsData)
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.statusCode == 200) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        responseJson.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(responseJson.message);
                }
                this.props.navigation.navigate('ResetPassword', { username: this.state.username, Service_URL: '' });
            } else {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        responseJson.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(responseJson.message);
                } this.setState({
                    isSending: false
                }); return;
            }
        }).catch((error) => {
            this.setState({ isLoading: false });
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
                        style={{
                            fontSize: 30, top: 20, textAlign: 'center', color: '#9A9797', position: 'absolute', left: 10,
                        }}
                        name='ios-arrow-back'
                    />
                    <View style={{ padding: 20, flex: 1, flexDirection: 'column' }}>
                        <Text style={{ fontSize: 20, marginBottom: 20, color: '#A5A5A5' }}>{VERIFY_QUESTIONS_LABEL}</Text>
                        <Text style={{ color: '#746E70', fontSize: 12 }}>{this.state.firstSecurityQuestionEncrypted}</Text>
                        <TextInput
                            style={styles.inputField1}
                            placeholder={'Answer'}
                            maxLength={80}
                            secureTextEntry={false}
                            onChangeText={(firstSecurityQuestionAnswer) => this.setState({ firstSecurityQuestionAnswer })}
                            placeholderTextColor="#746E70"
                        />
                        <Text style={{ color: '#746E70', fontSize: 12 }}>{this.state.secondSecurityQuestionEncrypted}</Text>
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
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.verifyQuestions()}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text style={{ color: 'white', fontWeight: 'bold' }} >Next</Text>
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
    inputField1: {
        width: '100%',
        fontSize: 12,
        color: '#a9a9a9',
        marginTop: 10,
        marginBottom: 10,
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
export default VerifyQuestions;