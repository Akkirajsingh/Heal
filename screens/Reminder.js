/* eslint-disable no-prototype-builtins */
/* eslint-disable global-require */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Platform, AlertIOS, Alert, Dimensions, RefreshControl, NetInfo, ToastAndroid } from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialCommunityIcons, Foundation, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { REMOVE_REMINDER, SET_REMINDER, HOSP_SET_REMINDER, HOSP_REMOVE_REMINDER } from '../constants/APIUrl';
import { REMINDER_DELETED_SUCCESS_MSG } from '../constants/Messages';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import AccessRecord from '../components/AccessRecord';
let SET_REMINDER_URL = SET_REMINDER;
let REMOVE_REMINDER_URL = REMOVE_REMINDER;

let CONNECTION_STATUS = false;

class Reminder extends Component {
    constructor(props) {
        super(props);
        this.state = { filterStat: 'All', Userid: '', AccountId: '', AccessToken: '', reminderResp: [] };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                SET_REMINDER_URL = SET_REMINDER;
                REMOVE_REMINDER_URL = REMOVE_REMINDER;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    SET_REMINDER_URL = USER_DATA.ServiceURL + HOSP_SET_REMINDER;
                    REMOVE_REMINDER_URL = USER_DATA.ServiceURL + HOSP_REMOVE_REMINDER;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            AccessToken: USER_DATA.ACCESS_TOKEN,
                            AccountId: ACCESS_TYPE.accountId
                        }, function () {
                            this.ReminderData();
                        });
                    }
                } else {
                    this.setState({
                        AccountId: USER_DATA.Id,
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.ReminderData();
                    });
                }
            }
        );
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
    /*******************************************Problem API ******************************************************/
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    AccountId: value.accountId
                }, function () {
                    this.ReminderData();
                });
            }
        }
    }
    ReminderData = () => {
        this.setState({ refreshing: true });
        fetch(`${SET_REMINDER_URL}?AccountId=${this.state.AccountId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((response) => {
            console.log("response", response);
            if (Utility.IsNullOrEmpty(response) || (response.hasOwnProperty("responseData") && response.responseData.length == 0)) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        'No Data Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert('No Data Available');
                }
            }
            this.setState({
                isLoading: false,
                refreshing: false,
                reminderResp: response.responseData,
            });
        })
            .catch((error) => {
                this.setState({ isLoading: false, refreshing: false });
                const errMSg = aPIStatusInfo.logError(error);
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
    /*************************************** DELETE REMINDER API CALL************************************************************************** */
    deleteReminder = (reminderId) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to cancel? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(reminderId) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (reminderId) => {
        this.setState({
            isLoading: true,
        });
        const data = `reminderId=${reminderId}`;
        fetch(REMOVE_REMINDER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.show(REMINDER_DELETED_SUCCESS_MSG, ToastAndroid.SHORT);
                    } else {
                        AlertIOS.alert(REMINDER_DELETED_SUCCESS_MSG);
                    }
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.ReminderData();
                    });
                }
            })
            .catch(err => {
                this.setState({
                    isLoading: false,
                });
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
    };
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Reminder....</Text>
                </View>
            );
        }
        return (
            // <CommonView customHeading='Reminder'>
            <CommonView Reminder={true}>
                <View style={{ flex: 1 }}>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.ReminderData}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 4 }}>
                            {this.state.reminderResp.map(data => (
                                <TouchableOpacity key={data.reminderId} style={{ marginRight: 5, flex: 1 }} >
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Text style={{ color: '#767575', fontSize: 17, paddingLeft: 15, paddingTop: 0, marginTop: 3 }}>{data.reminderFor ? 'General' : data.reminderFor}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <MaterialCommunityIcons style={{ color: '#000' }} size={17} name='calendar-clock' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 2 }}>
                                                    {Utility.IsNullOrEmpty(data.reminderDate) ? '' : Moment(data.reminderDate).format('MM/DD/YYYY HH:SS A')}
                                                </Text>
                                            </View>
                                            {data.reminderType == 1 && !Utility.IsNullOrEmpty(data.phoneNumber) ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                    <FontAwesome style={{  color: '#000' }} size={17} name='mobile-phone' />
                                                    <Text style={{ fontSize: 14, color: '#767575', marginLeft: 2 }}>
                                                        {Utility.IsNullOrEmpty(data.phoneNumber) ? 'No Data' : data.phoneNumber}
                                                    </Text>
                                                </View>
                                                : null}
                                            {data.reminderType == 2 && !Utility.IsNullOrEmpty(data.emailId) ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                    <FontAwesome style={{ color: '#000'}} size={17} name='mobile-phone' />
                                                    <Text style={{ fontSize: 14, color: '#767575', marginLeft: 2 }}>
                                                        {Utility.IsNullOrEmpty(data.emailId) ? 'No Data' : data.emailId}
                                                    </Text>
                                                </View>
                                                : null}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                {/* {data.reminderType == 2 ? <MaterialIcons style={{ color: '#3AA6CD' }} size={15} name='email' /> : (<FontAwesome style={{ color: '#3AA6CD' }} size={15} name='mobile-phone' /> : <Foundation style={{ color: '#3AA6CD' }} size={15} name='web' />)} */}
                                                <Foundation style={{ color: '#000' }} size={17} name='web' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 2 }}>
                                                    {data.reminderType == 2 ? 'Email' : (data.reminderType == 3 ? 'Portal' : 'Mobile')}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <View style={{ marginLeft: 10, marginRight: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Foundation style={{  color: '#000' }} size={17} name='clipboard-notes' />

                                                        <Text style={{ fontSize: 14, color: '#767575', marginLeft: 6 }}>
                                                            {Utility.IsNullOrEmpty(data.note) ? 'Reminder Notes is missing' : data.note}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <Entypo onPress={() => this.deleteReminder(data.reminderId)} style={{ color: '#000', position: 'absolute', right: 6, bottom: 20 }} size={25} name='cross' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddReminders')}>
                            <View style={{ padding: 10, borderRadius: 110, width: 55, height: 55, backgroundColor: '#F7F1FF' }}>
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 0, borderColor: '#fff', }}>
                                    <Ionicons
                                        style={{ fontSize: 35, fontWeight: 10, textAlign: 'center', color: '#000' }}
                                        name='ios-add'
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        width: (Dimensions.get('window').width),
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e'
    },
    problems: {
        width: (Dimensions.get('window').width / 2) - 30,
        backgroundColor: 'transparent',
        borderRadius: 20,
        elevation: 1,
        alignItems: 'flex-start',
        padding: 10
    },
});
export default Reminder;
