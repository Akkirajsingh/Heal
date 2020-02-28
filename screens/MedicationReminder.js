/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput,ScrollView, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, NetInfo, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, MaterialIcons, MaterialCommunityIcons, FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import RadioForm  from 'react-native-simple-radio-button';
import Moment from 'moment';
import Utility from '../components/Utility';
import TimePicker from 'react-native-simple-time-picker';
import { REMINDER_SERVICE, HOSP_REMINDER_SERVICE } from '../constants/APIUrl';
import { REMINDER_SET_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
let REMINDER_SERVICE_URL = '';
let CONNECTION_STATUS = false;

let radio_props = [
    { label: 'Portal', value: 0 }, { label: 'Text Message', value: 1 }, { label: 'Email', value: 2 }
];
class MedicationReminder extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = {
            todayDate: today, Remindervalue: '', userid: '', AccessToken: '', AccountId: '', emailId: '', reminderType: 0, mobilenumber: '', reminderDate: '', contactNo: '', isLoading: false, selectedHours: 0, selectedMinutes: '', medicationId: '', description: ''
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
        REMINDER_SERVICE_URL = REMINDER_SERVICE;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        REMINDER_SERVICE_URL = REMINDER_SERVICE;
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital; 
            REMINDER_SERVICE_URL = USER_DATA.ServiceURL + HOSP_REMINDER_SERVICE;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            AccountId: USER_DATA.Id,
            medicationId: params.medicationId,
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /****************************************************Set Reminder API Call *****************************************************/
    setReminder = () => {
        const { navigate } = this.props.navigation;
        if (!this.validateInput()) return;
        const ReminderService = {
            AccountId: this.state.AccountId,
            EmailId: this.state.emailId,
            Note: this.state.description,
            PhoneNumber: this.state.contactNo,
            RemindMeIn: 0,
            ReminderDate: this.state.reminderDate,
            ReminderFor: 6,
            ReminderItemId: this.state.medicationId,
            ReminderId: 0,
            ReminderType: this.state.reminderType,
            Subject: 'Remainder from Heal'
        };
        fetch(REMINDER_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(ReminderService)
        })
            .then(aPIStatusInfo.handleResponse)
            .then((resp) => resp.json())
            .then((response) => {

                if (response.statusCode == 200) {
                    ToastAndroid.show(REMINDER_SET_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('Medication', { ReminderDate: this.state.ReminderDate });
                    });
                }
            })
            .catch(err => {
                this.setState({ isLoading: false, isLoggingIn: false, });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /******************************************************************************************** */
    changereminderType = (value) => {
        this.setState({
            reminderType: value,
        });
    };
    /**********************************  Reminder Email Or Mobile View ************************************************************************/
    reminderEmail = () => {
        return (<View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Entypo style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='mail' />
                    <Text style={{ color: '#000', marginLeft: 5 }}>Email</Text>

                </View>
            </View>
            <View>
                <TextInput
                    style={styles.inputField}
                    placeholder={'Username'}
                    keyboardType={'email-address'}
                    value={this.state.emailId}
                    keyboardType={'email-address'}
                    secureTextEntry={false}
                    onChangeText={(emailId) => this.setState({ emailId })}
                    placeholderTextColor="#746E6E"
                />
            </View>
        </View>);
    }
    reminderMobile = () => {
        return (<View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FontAwesome style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='mobile-phone' />
                    <Text style={{ color: '#000', marginLeft: 5 }}>Mobile</Text>

                </View>
            </View>
            <View>
                <TextInput
                    placeholder={'Mobile Number'} secureTextEntry={false}
                    keyboardType={'numeric'}
                    maxLength={10}
                    value={this.state.contactNo}
                    onChangeText={(contactNo) => this.setState({ contactNo })}
                    placeholderTextColor="#746E6E"
                    style={styles.inputField}
                />
            </View></View>);
    }
    /************************************************************************************************************ */
    /***************************************************** Validate Reminder InputFields *****************************************************************/
    validateInput = () => {
        const { reminderDate, selectedHours, selectedMinutes, reminderType, contactNo, emailId } = this.state;
        let isValid = true;
        let validationMsgText = "";
        if (reminderDate === '') {
            validationMsgText += "Date is mandatory\n";
            isValid = false;
        }
        if (selectedHours === '') {
            validationMsgText += "Please Set Reminder Time\n";
            isValid = false;
        }
        if (selectedMinutes === '') {
            validationMsgText += "Please Set Reminder Time\n";
            isValid = false;
        }
        else if (reminderType == 1) {
            if (contactNo === '') {
                validationMsgText += "Mobile Number is mandatory\n";
                isValid = false;
            }
        }
        else if (reminderType == 2) {
            const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (emailId == "") {
                validationMsgText += "Email Id is mandatory\n";
                isValid = false;
            }
            else if (REG.test(emailId.trim()) === false) {
                validationMsgText += "Invalid EmailId\n";
                isValid = false;
            }
        }

        if (!isValid) {
            ToastAndroid.showWithGravity(
                validationMsgText.substring(0, validationMsgText.length - 1),
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); this.setState({
                isSending: false
            }); return false;
        }
        return true;
    }
    /************************************************************************************************************** */
    render() {
        const { selectedHours, selectedMinutes } = this.state;
        return (
            <CommonView AddReminder={true} >
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7, paddingTop: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                            <View style={styles.reminderBox}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <MaterialIcons style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='access-alarm' />
                                    <Text style={{ color: '#000', marginLeft: 5 }}>Reminder Type</Text>

                                </View>
                            </View>
                            <View style={styles.reminderContainer}>
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={0}
                                    formHorizontal={true}
                                    buttonSize={7}
                                    buttonOuterSize={15}
                                    selectedButtonColor={'green'}
                                    selectedLabelColor={'green'}
                                    labelStyle={{ fontSize: 12, paddingRight: 20, marginTop: -3 }}
                                    onPress={(value, index, data) => this.changereminderType(value, index, data)}
                                />
                            </View>
                        </View>

                        {this.state.reminderType == 2 ? this.reminderEmail() : (this.state.reminderType == 1 ? this.reminderMobile() : <Text></Text>)}
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                            <View style={styles.reminderBox}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingLeft: 4, paddingTop: 7 }} size={17} name='calendar-clock' />
                                    <Text style={{ color: '#000', marginLeft: 5 }}>Date Given : </Text>
                                </View>
                            </View>
                            <DatePicker
                                style={{ width: '100%', backgroundColor: 'transparent', }}
                                date={this.state.reminderDate}
                                mode="date"
                                placeholder="select date"
                                format="DD-MMM-YYYY"
                                minDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent' },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11 }
                                }}
                                onDateChange={(reminderDate) => { this.setState({ reminderDate }); }}
                            /></View>
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                            <View style={styles.reminderBox}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <MaterialIcons style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='access-alarm' />
                                    <Text style={{ color: '#000', marginLeft: 5 }}>Set Reminder Time</Text>
                                    <Text>            {selectedHours}hr:{selectedMinutes}min</Text>
                                </View>
                            </View>
                            <View style={styles.container}>

                                <TimePicker
                                    selectedHours={selectedHours}
                                    //initial Hourse value
                                    selectedMinutes={selectedMinutes}
                                    //initial Minutes value
                                    onChange={(hours, minutes) => this.setState({
                                        selectedHours: hours, selectedMinutes: minutes
                                    })}
                                />
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                            <View style={styles.reminderBox}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='note' />
                                    <Text style={{ color: '#000', marginLeft: 5 }}>Notes</Text>
                                </View>
                            </View>
                            <TextInput
                                style={styles.inputData1}
                                placeholder={'Notes'}
                                maxLength={500}
                                placeholderTextColor="#746E6E"
                                value={this.state.description}
                                secureTextEntry={false}
                                onChangeText={(description) => this.setState({ description })}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: '40%' }}>
                                <TouchableOpacity onPress={() => { this.setReminder(); }} style={{ marginBottom: 40, marginTop: 20, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                    <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Set Reminder</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        marginBottom: 7,
        paddingTop: 6,
        fontSize: 12,
        paddingBottom: 5
    },
    reminderContainer: {
        borderWidth: 0.3,
        borderColor: '#7EE5A8',
        paddingTop: 12, paddingBottom: 7,
        paddingLeft: 7
    },
    inputData1: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        marginBottom: 4,
        paddingTop: 9,
    },
    reminderBox: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4
    }
});

export default MedicationReminder;