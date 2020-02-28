/* eslint-disable no-undef */
import React, { Component } from 'react';
import { TextInput, Image, ScrollView, ActivityIndicator, StyleSheet, Text, NetInfo, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage, Platform, AlertIOS } from 'react-native';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import { MaterialCommunityIcons, SimpleLineIcons, AntDesign } from '@expo/vector-icons';
import Moment from 'moment';
import { ADD_PROBLEM, HOSP_ADD_PROBLEM } from '../constants/APIUrl';
import { PROBLEM_ADDED_SUCCESS_MSG } from '../constants/Messages';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Validation from '../components/Validation';

let ADD_PROBLEM_URL = '';
let CONNECTION_STATUS = false;

class AddProblem extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = { loadingMsg: 'Loading Medical Problems....', user_id: '', nameError: '', addNotes: false, accessToken: '', isLoading: false, showMenu: false, refreshing: false, dateOfBirth: today, todayDate: today, problem_name: '', other_name: '', dose: '', dose_unit: '', applied: '', instructions: '', status: '', reason: '', note: '', start_date: Moment(today).format('MM/DD/YYYY'), end_date: Moment(today).format('MM/DD/YYYY') };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        ADD_PROBLEM_URL = ADD_PROBLEM;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_PROBLEM_URL = USER_DATA.ServiceURL + HOSP_ADD_PROBLEM;
        }
        this.setState({
            accessToken: USER_DATA.ACCESS_TOKEN,
            user_id: USER_DATA.User_Id,
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    render() {
        const statusData = [
            { value: 'Active' }, { value: 'Inactive' }
        ];
        const { goBack } = this.props.navigation;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        }
        return (
            <CommonView AddProblem={true} >
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10, paddingTop: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name='human-handsdown' />
                            <TextInput
                                placeholder={'Problem Name'}
                                secureTextEntry={false}
                                placeholderTextColor="#746E6E"
                                style={{width:'100%',fontSize: 17}}
                                onChangeText={(problem_name) => this.setState({ problem_name })}
                                maxLength={50}
                            />
                        </View>
                        <Text style={{ color: 'red' }}>
                            {this.state.nameError}
                        </Text>
                        <View style={{ flexDirection: "row", marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontSize: 17 }} >Status</Text>
                            {this.state.status == 'Active' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                        <Text style={{ color: 'white' }}>Active</Text>
                                    </View></View></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.Inactivestatus}>
                                    <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                        <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                    </View></View></TouchableOpacity>
                            </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                            <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.activestatus}>
                                        <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                            <Text style={{ color: 'white' }}>Inactive</Text>
                                        </View></View></TouchableOpacity>
                                </View>}
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.iconCss} >Start Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons size={20} style={{ marginTop: 5, marginRight: 10 }} name='calendar-clock' />
                            <DatePicker
                                date={this.state.start_date}
                                mode="date"
                                placeholder="Start Date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.start_date}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 }
                                }}
                                onDateChange={(start_date) => { this.setState({ start_date }); }}
                            /></View>
                        {this.state.status == 'Inactive' || this.state.status == "" ?
                            <View><View style={{ marginTop: 15 }}>
                                <Text style={styles.iconCss}>End Date</Text>
                            </View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingTop: 2, paddingBottom: 3 }}>
                                    <MaterialCommunityIcons size={20} style={{ marginTop: 5, marginRight: 10 }} name='calendar-clock' />
                                    <DatePicker
                                        date={this.state.end_date}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        minDate={this.state.start_date}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 3 },
                                            dateText: { marginTop: 3 }
                                        }}
                                        onDateChange={(end_date) => {
                                            if (new Date(end_date) <= new Date(this.state.start_date)) {
                                                ToastAndroid.show('Date Started and Date ended cannot be same', ToastAndroid.SHORT);
                                                return false;
                                            } this.setState({ end_date });
                                        }}
                                    /></View></View> :
                            <View />
                        }
                        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => { this.addNotes(); }} >
                            <View style={styles.notes}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={styles.icons1} size={17} name='note' />
                                    <Text style={styles.boxTextCss}>Details</Text>
                                </View>
                                {!this.state.addNotes ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                            </View></TouchableOpacity>
                        {this.state.addNotes ?
                            <TextInput
                                placeholder={'Details'}
                                placeholderTextColor='#938F97'
                                style={{ width: '100%', marginTop: 10, marginBottom: 5, height: 30, borderBottomWidth: 0.4, borderBottomColor: 'grey', fontSize: 17 }}
                                onChangeText={(notes) => this.setState({ notes })}
                                maxLength={100}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveProblem(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Problem Details
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }

    changeMedicalStatus = (val, index, data) => {
        this.setState({
            status: val
        });
    };

    saveProblem = () => {
        let { problem_name, start_date, end_date, status } = this.state;
        const { navigate } = this.props.navigation;
        let obj = [problem_name, start_date, end_date];
        let mandatoryMsg = ['Enter Problem Name', 'select Start Date', 'select End Date'];
        let pattern = [/^.{3,100}$/, "", ""];
        let patternMsg = [" Problem name should be between 3 and 100 characters", "", ""];
        let length = [3, "", ""];
        let lengthMsg = ["Please enter Problem name atleast minimum of 3 characters", "", ""];
        // this.setState({ isSending: true });
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
        let statusData = 'Inactive';
        let isProblemActive = false;
        if (this.state.status == 'Active') {
            statusData = 'Active';
            isProblemActive = true;
            const end_date = '';
        } else {
            statusData = 'Inactive';
            isProblemActive = false;
            const end_date = this.state.end_date;
        }
        // let start_date = this.state.start_date;
        const data = { patientId: this.state.user_id, problemName: this.state.problem_name, startDate: this.state.start_date, endDate: this.state.end_date, 'status': statusData, 'isProblemActive': isProblemActive, problemDescription: this.state.notes, appointmentDate: '1/1/0001 12:00:00 AM' };
        console.log('data', data);
        fetch(ADD_PROBLEM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(data)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(PROBLEM_ADDED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                    loadingMsg: 'Saving Problem....'
                }, function () {
                    this.props.navigation.navigate('Problems');
                });
            }
        })
            .catch(err => {
                this.setState({
                    isSending: false
                });
                console.log('ProblemErrormsg:', err);
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
}

const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#8dd5ee',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 1.2,
        flexDirection: 'row'
    },
    iconCss: {
        marginTop: 5, marginRight: 10
    },
    plusCircleIcon: {
        color: '#000', marginTop: 3, marginRight: 5
    },
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 4
    },
    boxTextCss: {
        color: '#000', marginLeft: 5, fontSize: 17
    },
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    activestatus: {
        borderRadius: 8, borderColor: 'white', backgroundColor: '#2fd473', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },
    Inactivestatus: {
        borderRadius: 6, borderColor: '#cdcdcd', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    }
});
export default AddProblem;