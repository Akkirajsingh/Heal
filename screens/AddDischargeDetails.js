/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Platform, AlertIOS, NetInfo, View, Dimensions, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { ADD_DISCHARGE_DETAILS, HOSP_DISCHARGE_DETAILS_LIST } from '../constants/APIUrl';
import { DISCHARGE_ADDED_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import Validation from '../components/Validation';

let ADD_DISCHARGE_DETAILS_URL = '';
let CONNECTION_STATUS = false;
class AddDischargeDetails extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = { todayDate: today, loadingMsg: '', AccessToken: '', Userid: '', facility: '', admittedDate: today, dischargeDate: '', description: '', folloUpDate: '', instructions: '' };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        ADD_DISCHARGE_DETAILS_URL = ADD_DISCHARGE_DETAILS;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_DISCHARGE_DETAILS_URL = USER_DATA.ServiceURL + HOSP_DISCHARGE_DETAILS_LIST;
        }
        const { params } = this.props.navigation.state;
        console.log('params', params);
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**************************************Add Discharge Details **************************************************************/
    saveDischargeDetails = () => {
        const { facility, admittedDate, dischargeDate, description } = this.state;
        let obj = [facility, admittedDate, dischargeDate, description];
        let mandatoryMsg = ['Enter Place Of Visit', 'Select Admitted Date', 'Select Discharge Date', 'Enter Description'];
        let pattern = [/^.{3,100}$/, "", "", ""];
        let patternMsg = [" Place Of Visit Name should be between 3 and 100 characters", "", "", ""];
        let length = [3, "", "", ""];
        let lengthMsg = ["Please enter Place Of Visit Name atleast minimum of 3 characters", "", "", ""];

        var validInput = Validation.Validate(mandatoryMsg, pattern, patternMsg, length, lengthMsg, obj);
        if (!Utility.IsNullOrEmpty(validInput)) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    validInput,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(validInput);
            } this.setState({
                isSending: false
            }); return;
        }
        const dischargeData = { PatientId: this.state.Userid, Instructions: this.state.instructions, Id: null, FollowupDate: this.state.folloUpDate, DischargeNote: this.state.description, DischargeDate: this.state.dischargeDate, AdmittedDate: this.state.admittedDate, practiceName: this.state.facility };
        console.log('dischargeData', dischargeData);
        fetch(ADD_DISCHARGE_DETAILS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(dischargeData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(DISCHARGE_ADDED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                    loadingMsg: 'Discharge Details....'
                }, function () {
                    this.props.navigation.navigate('DischargeDetails');
                });
            }
        })
            .catch(err => {
                this.setState({
                    isSending: false
                });
                console.log('Dischargeerrmsg:', err);
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
    render() {
        return (
            <CommonView DischargeDetails={true} >
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10, paddingTop: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name="hospital-building" />
                            <TextInput
                                placeholder={'Place of Visit'}
                                secureTextEntry={false}
                                style={{ width: '100%', fontSize: 17 }}
                                placeholderTextColor='#938F97'
                                onChangeText={(facility) => this.setState({ facility })}
                                value={this.state.facility}
                                maxLength={100}
                            />
                        </View>
                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}> Admitted Date  </Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3 }}>
                            <MaterialCommunityIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name='calendar-clock' />
                            <DatePicker
                                // style={{ width: '80%', backgroundColor: 'transparent', }}
                                date={(this.state.admittedDate)}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 5 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(admittedDate) => { this.setState({ admittedDate }); }}
                            /></View>
                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>  Discharge Date  </Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3 }}>
                            <MaterialCommunityIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name='calendar-clock' />
                            <DatePicker
                                date={this.state.dischargeDate}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                minDate={(this.state.admittedDate)}
                                // maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 5 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(dischargeDate) => { this.setState({ dischargeDate }); }}
                            /></View>
                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>  FollowupDate </Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3 }}>
                            <MaterialCommunityIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name='calendar-clock' />
                            <DatePicker
                                // style={{ width: '84%', backgroundColor: 'transparent', }}
                                date={this.state.folloUpDate}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                minDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(folloUpDate) => { this.setState({ folloUpDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name="description" />
                            <TextInput
                                placeholder={'Description '}
                                secureTextEntry={false}
                                maxLength={500}
                                placeholderTextColor='#938F97'
                                onChangeText={(description) => this.setState({ description })}
                                style={{ width: '100%', fontSize: 17 }}
                            /></View>
                        <View style={styles.inputField} >
                            <SimpleLineIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name="note" />
                            <TextInput
                                placeholder={'Instructions'}
                                maxLength={500}
                                placeholderTextColor='#938F97'
                                onChangeText={(instructions) => this.setState({ instructions })}
                                style={{ width: '100%', fontSize: 17 }}
                            /></View>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveDischargeDetails(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Discharge Details
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
        backgroundColor: '#8dd5ee',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 2,
        flexDirection: 'row'
    },
    inputField1: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        marginBottom: 15,
        paddingBottom: 7
    },
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
});

export default AddDischargeDetails;

