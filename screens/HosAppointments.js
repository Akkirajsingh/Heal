/* eslint-disable no-prototype-builtins */
/* eslint-disable global-require */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, Dimensions, RefreshControl, NetInfo, ToastAndroid } from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialCommunityIcons, Ionicons, Entypo } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import AccessRecord from '../components/AccessRecord';
let CONNECTION_STATUS = false;
class HosAppointments extends Component {
    constructor(props) {
        super(props);
        this.state = { filterStat: 'All', Userid: '', AccountId: '', AccessToken: '', reminderResp: [] };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            AccessToken: USER_DATA.ACCESS_TOKEN,
                            AccountId: ACCESS_TYPE.accountId
                        }, function () {
                            this.appointmentData();
                        });
                    }
                } else {
                    this.setState({
                        AccountId: USER_DATA.Id,
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.appointmentData();
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
                    this.appointmentData();
                });
            }
        }
    }
    appointmentData = () => {
        this.setState({ refreshing: true });
        fetch(`https://care.patientheal.com/AppointmentService/api/AppointmentService/Appointments?accountId=${this.state.AccountId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((response) => {
            console.log('response', response);
            if (response.responseData.length == 0) {
                ToastAndroid.showWithGravity(
                    'No Data Available',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({ isLoading: false, refreshing: false, appointmentResp: response.responseData });
                return;
            }
            this.setState({
                isLoading: false,
                refreshing: false,
                appointmentResp: response.responseData,
            });
        })
            .catch((error) => {
                console.log(error);
                this.setState({ isLoading: false, refreshing: false });
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /*************************************** DELETE REMINDER API CALL************************************************************************** */
    deleteReminder = (reminderId) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
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
        console.log('data', data);
        fetch('https://care.patientheal.com/PatientCareServices/api/ReminderService/RemoveReminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show('Your Reminder Data has Deleted Successfully', ToastAndroid.SHORT);
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
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
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
                                onRefresh={this.appointmentData}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 4 }}>
                            {this.state.appointmentResp.map(data => (
                                <TouchableOpacity key={data.reminderId} style={{ marginRight: 5, flex: 1 }} >
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, paddingTop: 0, marginTop: 3 }}>{data.reminderFor ? 'General' : data.reminderFor}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <MaterialCommunityIcons style={{ color: '#3AA6CD' }} size={15} name='calendar-clock' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                    {/* {Utility.IsNullOrEmpty(data.reminderDate) ? '' : Moment(data.reminderDate).format('MM/DD/YYYY HH:SS A')} */}
                                                    {data.physicianName}
                                                </Text>
                                            </View>
                                            {data.reminderType == 1 && !Utility.IsNullOrEmpty(data.phoneNumber) ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                    <FontAwesome style={{ color: '#3AA6CD' }} size={15} name='mobile-phone' />
                                                    <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                        {Utility.IsNullOrEmpty(data.reason) ? 'No Data' : data.reason}
                                                    </Text>
                                                </View>
                                                : null}
                                            {data.reminderType == 2 && !Utility.IsNullOrEmpty(data.emailId) ?
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                    <FontAwesome style={{ color: '#3AA6CD' }} size={15} name='mobile-phone' />
                                                    <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                        {Utility.IsNullOrEmpty(data.appointmentDate) ? '' : data.appointmentDate}
                                                    </Text>
                                                </View>
                                                : null}
                                        </View>
                                        <Entypo onPress={() => this.deleteReminder(data.reminderId)} style={{ color: '#3AA6CD', position: 'absolute', right: 6, bottom: 20 }} size={25} name='cross' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddReminders')}>
                            <View style={{ padding: 10, borderRadius: 110, width: 55, height: 55, backgroundColor: '#3AA6CD' }}>
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 1, borderColor: '#ffffff80', }}>
                                    <Ionicons
                                        style={{ fontSize: 35, fontWeight: 10, textAlign: 'center', color: '#ffffffa6' }}
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
        width: (Dimensions.get('window').width) - 20,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 12,
        marginBottom: 15,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e',
        borderRadius: 10,
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
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
export default HosAppointments;
