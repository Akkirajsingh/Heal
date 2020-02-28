/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, AsyncStorage, View, Platform, ImageBackground, Dimensions, RefreshControl, BackHandler, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { FontAwesome, Feather, Ionicons, AntDesign, MaterialIcons, MaterialCommunityIcons, Foundation } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { DISCHARGE_DETAILS_LIST, DISCHARGE_DETAILS_DELETE, HOSP_DISCHARGE_DETAILS_DELETE, HOSP_DISCHARGE_DETAILS_LIST } from '../constants/APIUrl';
import { CLINICAL_DOCS_UPDATE_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import TimePicker from 'react-native-simple-time-picker';
let DISCHARGE_DETAILS_LIST_URL = '';
let DISCHARGE_DETAILS_DELETE_URL = '';

let CONNECTION_STATUS = false;

class AppointmentDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = { AccessToken: '', userid: '', physicianAvailData: { morning: [], noon: [], evening: [] }, ServiceUrl: '', physicianId: '', AppointmentId: '', appointmentDate: '', AppointmentTime: '', reason: '', practiceName: '', patientFirstName: '', patientLastName: '', physicianName: '', practiceId: '', specialityId: '', status: '', appointmentType: '', isLoading: false, selectedHours: 0, selectedMinutes: 0 };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        const { params } = this.props.navigation.state;
        console.log("params", params);
        DISCHARGE_DETAILS_LIST_URL = DISCHARGE_DETAILS_LIST;
        DISCHARGE_DETAILS_DELETE_URL = DISCHARGE_DETAILS_DELETE;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            DISCHARGE_DETAILS_LIST_URL = USER_DATA.ServiceURL + HOSP_DISCHARGE_DETAILS_LIST;
            DISCHARGE_DETAILS_DELETE_URL = USER_DATA.ServiceURL + HOSP_DISCHARGE_DETAILS_DELETE;
        }
        this.setState({
            AppointmentId: params.AppointmentId,
            ServiceUrl: params.ServiceUrl,
            userid: params.userid,
            AccessToken: params.AccessToken,
            // appointmentDate: new Date(params.preferredDate1).getUTCDate(),
            appointmentDate: Moment(params.preferredDate1).format('MM/DD/YYYY'),
            reason: params.reason,
            selectedHours: parseInt(Moment(new Date(params.preferredDate1)).format('HH')),
            selectedMinutes: parseInt(Moment(new Date(params.preferredDate1)).format('MM')),
            practiceName: params.practiceName,
            patientFirstName: params.patientFirstName,
            patientLastName: params.patientLastName,
            physicianName: params.physicianName,
            practiceId: params.practiceId,
            physicianId: params.physicianId,
            specialityId: params.specialityId,
            status: params.status,
            appointmentType: params.appointmentType
        }, function () {
            this.physicianAvailableData();
        });
        console.log("selectedHours", params.preferredDate1);
        console.log("selectedMinutes", this.state.selectedMinutes);
        console.log("appointmentDate", this.state.appointmentDate);
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*****************************************Update Discharge Details ***************************************************************/
    physicianAvailableData = () => {
        // let obj = {};
        // if (Utility.IsNullOrEmpty(physicianObj)) {

        // obj.id = this.state.physicianID;
        // obj.qualification = this.state.qualification;
        // obj.experience = this.state.experience;
        // }
        // else {
        // obj = physicianObj;
        // }
        // console.log("physicianobj", obj);
        fetch(`${this.state.ServiceUrl}api/AppointmentService/GetPhysiciansTimeSlot?practiceLocationId=${this.state.practiceId}&physicianId=${this.state.physicianId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log("responseJson", responseJson)
                if (responseJson.responseData.length == 0) {
                    ToastAndroid.showWithGravity(
                        'Physician not Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );

                    this.setState({ isLoading: false, physicianAvailData: { morning: [], noon: [], evening: [] } });
                    return;
                }
                let selectedDate = this.state.appointmentDate;
                let selectedDateData = responseJson.responseData.filter(function (item) {
                    console.log("selectedDate", Moment(selectedDate).format("D/M/YYYY"));
                    console.log("currdate", Moment(new Date(item.date)).format("D/M/YYYY"));
                    return Moment(new Date(item.date)).format("D/M/YYYY") == Moment(selectedDate).format("D/M/YYYY");
                })
                let physicianAvailData = { morning: [], noon: [], evening: [] };
                selectedDateData.filter(function (item) {
                    item.availableTimes.forEach(function (timeItem) {
                        var tZO = new Date().getTimezoneOffset();
                        var sT = new Date(new Date(timeItem.availableTime).getTime() + (tZO * 60000));
                        var sH = sT.getHours();
                        var cH = new Date().getHours();
                        var sM = sT.getMinutes();
                        var cM = new Date().getMinutes();
                        if ((sH > cH) || (sH == cH && sM > cM)) {
                            timeItem.availableTime = sT;
                            if (sH < 12) {
                                physicianAvailData.morning.push(timeItem);
                            }
                            else if (sH >= 12 && sH <= 17) {
                                physicianAvailData.noon.push(timeItem);
                            }
                            else if (sH >= 17 && sH <= 24) {
                                physicianAvailData.evening.push(timeItem);
                            }
                        }
                    });

                })
                this.setState({
                    physicianAvailData: physicianAvailData,
                    isLoading: false

                }, () => {
                });
            })
            .catch((error) => {
                console.error(error);
                this.setState({ isLoading: false });
            });
    }
    updateAppointmentDetails = () => {
        const AppointmentDetails = {
            AppointmentDate: this.state.appointmentDate,
            AppointmentTime: this.state.AppointmentTime,// + ':' + this.state.selectedMinutes,
            AppointmentType: this.state.appointmentType,
            PatientId: this.state.userid,
            PhysicianId: this.state.physicianId,
            PracticeId: this.state.practiceId,
            PreferredDate1: this.state.appointmentDate,
            ProblemId: '00000000-0000-0000-0000-000000000000',
            Reason: this.state.reason,
            ReminderSet: false,
            SelectedDateTime: Moment(new Date()).format("DD/MM/YYYY"),
            SpecialityId: this.state.specialityId,
            Status: this.state.status
        };
        console.log("AppointmentDetails", AppointmentDetails);
        fetch(`${this.state.ServiceUrl}api/AppointmentService/AppointmentUpdate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(AppointmentDetails)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(CLINICAL_DOCS_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('Appointment');
                });
            }
        }).catch(err => {
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
    }


    highLightTimeSlot = async (item) => {

        let physicianAvailData = this.state.physicianAvailData;
        const res1 = await physicianAvailData.evening.map(item => {
            item.isSelect = false;
            return item;
        });
        let data1 = res1.map(e => {
            if (item.availableTime === e.availableTime) {
                item.isSelect = true;
                return item;
            }
            // else{
            // e.isSelected = false; 
            // }
            return e;

        });

        const res2 = await physicianAvailData.morning.map(item => {
            item.isSelect = false;
            return item;
        });
        let data2 = res2.map(e => {
            if (item.availableTime === e.availableTime) {
                item.isSelect = true;
                return item;
            }
            // else{
            // e.isSelected = false; 
            // }
            return e;

        });

        const res3 = await physicianAvailData.noon.map(item => {
            item.isSelect = false;
            return item;
        });
        let data3 = res3.map(e => {
            if (item.availableTime === e.availableTime) {
                item.isSelect = true;
                return item;
            }
            // else{
            // e.isSelected = false; 
            // }
            return e;

        });

        let obj = { morning: data2, noon: data3, evening: data1 }
        this.setState({ physicianAvailData: obj });
    }
    /**********************************************Cancel Appointment ***********************************************************/
    cancelAppointment = (id) => {
        Alert.alert(
            'Confirm Cancel?',
            'Are you sure you want to cancel? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (id) => {
        this.setState({
            isLoading: true,
        });
        const AppointData = {
            appointmentId: `${id}`,
            reason: 'Appointment cancel'
        };
        fetch(`${this.state.ServiceUrl}api/AppointmentService/CancelAppointment`, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(AppointData)
        })
            //  .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                console.log("delteres", res);
                if (res.statusCode == 500) {
                    ToastAndroid.show('Failed to Cancel your Appointment! Please try again later', ToastAndroid.SHORT);
                    this.setState({ isLoading: false })
                } else {
                    if (res.statusCode == 200) {
                        ToastAndroid.show('Your Appointment has been cancelled Successfully', ToastAndroid.SHORT);
                        this.setState({
                            isLoading: false,
                        }, function () {
                            // this.props.navigation.navigate("Appointments");
                        });
                    }
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
    /*************************************************************************************************************** */

    render() {
        const { selectedHours, selectedMinutes } = this.state;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Appointment Details....</Text>
                </View>
            );
        }
        return (
            <CommonView AppointmentDetails >
                <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 2 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingTop: 7, paddingRight: 5 }} size={14} name="hospital-building" />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 7 }}>Practice Name: </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'Hospital Name'}
                                    secureTextEntry={false}
                                    onChangeText={(practiceName) => this.setState({ practiceName })}
                                    value={this.state.practiceName}
                                    editable={false}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 6 }}>
                            <View style={{ width: '40%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingTop: 6, paddingRight: 5 }} size={14} name="calendar-clock" />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 5 }}>
                                    Appointment Date : </Text>
                            </View>
                            <View style={{ width: '60%' }}>
                                <DatePicker
                                    style={{ width: '60%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                    date={this.state.appointmentDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="M/D/YYYY"
                                    minDate={new Date()}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11, marginBottom: 5, marginTop: 5 }
                                    }}
                                    onDateChange={(appointmentDate) => { this.setState({ appointmentDate }, function () { this.physicianAvailableData() }) }}
                                />
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                            {this.state.physicianAvailData.morning.length > 0 ? <View style={{ padding: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <Feather name="sun" size={20} color="#736F6E" />
                                    <Text style={{ fontWeight: '300' }}>&nbsp;Morning</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {this.state.physicianAvailData.morning.map(data => (
                                        data.isAllocated == true || data.isSelect == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                        </TouchableOpacity> : <TouchableOpacity onPress={() => {
                                            this.setState({ AppointmentTime: Moment(data.availableTime).format('HH:MM') }, function () {
                                                this.highLightTimeSlot(data);
                                            });
                                        }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                <Text style={{ color: '#3BA7CE', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                            </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View> : null}
                            {this.state.physicianAvailData.noon.length > 0 ? <View style={{ padding: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <Ionicons name="md-sunny" size={20} color="#736F6E" />
                                    <Text style={{ fontWeight: '300' }}>&nbsp;Noon</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {this.state.physicianAvailData.noon.map(data => (
                                        data.isAllocated == true || data.isSelect == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                        </TouchableOpacity> : <TouchableOpacity onPress={() => {
                                            this.setState({ AppointmentTime: Moment(data.availableTime).format('HH:MM') }, function () {
                                                this.highLightTimeSlot(data);
                                            });
                                        }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                <Text style={{ color: '#3BA7CE', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                            </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View> : null}
                            {this.state.physicianAvailData.evening.length > 0 ? <View style={{ padding: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <FontAwesome name="moon-o" size={20} color="#736F6E" />
                                    <Text style={{ fontWeight: '300' }}>&nbsp;Evening</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {this.state.physicianAvailData.evening.map(data => (
                                        data.isAllocated == true || data.isSelect == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                        </TouchableOpacity> : <TouchableOpacity onPress={() => {
                                            this.setState({ AppointmentTime: Moment(data.availableTime).format('HH:MM') }, function () {
                                                this.highLightTimeSlot(data);
                                            });
                                        }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                <Text style={{ color: '#3BA7CE', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                            </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View> : null}
                            {this.state.physicianAvailData.morning.length == 0 && this.state.physicianAvailData.noon.length == 0 && this.state.physicianAvailData.evening.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ padding: 15 }}>
                                        <View style={{ padding: 15, backgroundColor: '#F3F6FB', borderColor: '#9C9C9E', borderWidth: 0.2 }}>
                                            <Text style={{ fontWeight: 'bold', color: '#38A6CB', textAlign: 'center', marginBottom: 10, fontSize: 22 }}>No slot available</Text>

                                        </View>
                                    </View>
                                </View> : null}
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 4, paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row', width: '50%' }}>
                                <MaterialIcons style={{ color: '#3AA6CD', paddingTop: 7, paddingRight: 5 }} size={14} name="description" />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Reason : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'Reason '}
                                    secureTextEntry={false}
                                    onChangeText={(reason) => this.setState({ reason })}
                                    value={this.state.reason}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '44%' }}>
                                <TouchableOpacity onPress={() => { this.updateAppointmentDetails(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                    <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '12%' }} />
                            <View style={{ width: '44%' }}>
                                <TouchableOpacity onPress={() => this.cancelAppointment(this.state.AppointmentId)} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
                                    <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Cancel</Text>
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
    inputData: {
        color: '#767575',
        fontSize: 12,
        paddingBottom: 2,
        paddingRight: 5,
        paddingTop: 4
    }
});
export default AppointmentDetails;