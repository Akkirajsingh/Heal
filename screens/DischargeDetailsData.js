/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, AsyncStorage, View, Platform, AlertIOS, ImageBackground, Dimensions, RefreshControl, BackHandler, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { MaterialIcons, MaterialCommunityIcons, Foundation } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { DISCHARGE_DETAILS_LIST, DISCHARGE_DETAILS_DELETE, HOSP_DISCHARGE_DETAILS_DELETE, HOSP_DISCHARGE_DETAILS_LIST } from '../constants/APIUrl';
import { CLINICAL_DOCS_UPDATE_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
let DISCHARGE_DETAILS_LIST_URL = '';
let DISCHARGE_DETAILS_DELETE_URL = '';

let CONNECTION_STATUS = false;

class DischargeDetailsData extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = { AccessToken: '', Userid: '', dataSource: '', practiceName: '', dischargeId: '', dischargeNotes: '', admittedDate: '', todayDate: today, dischargeDate: '', instructions: '', followupProvider: '', followUpProviderAddress: '', followUpDate: '', dataSource: '', IsControlEnabled: true, isLoading: true, };
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
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            dischargeId: params.dischargeId,
            dataSource: params.dataSource,
            IsControlEnabled: params.dataSource == 2 ? true : false
        });
        this.getDischargeDataById();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**************************Get Discharge Details By Id ***************************************************************************/
    getDischargeDataById = () => {
        fetch(`${DISCHARGE_DETAILS_LIST_URL}?dischargeNoteId=${this.state.dischargeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                const DischargeData = res.responseData;
                this.setState({
                    dischargeNotes: DischargeData.dischargeNote,
                    dischargeDate: Moment(DischargeData.dischargeDate).format('MM/DD/YYYY'),
                    instructions: DischargeData.instructions,
                    followupProvider: DischargeData.followupProvider,
                    followUpProviderAddress: DischargeData.followUpProviderAddress,
                    followUpDate: DischargeData.followupDate,
                    admittedDate: Moment(DischargeData.admittedDate).format('MM/DD/YYYY'),
                    practiceName: DischargeData.practiceName,
                    isLoading: false
                });
            })
            .catch(err => {
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({ refreshing: false });
                return;
            });
    }
    /*****************************************Update Discharge Details ***************************************************************/
    updateDischargeDetails = () => {
        const visitNamereg = /^.{3,100}$/;
        if (this.state.practiceName == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Place of visit',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Place of visit');
            }
            return false;
        } else if(!this.state.dischargeNotes.length) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter description',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter description');
            }
            return false;
        } else if(!this.state.instructions.length) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter instructions',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter instructions');
            }
            return false;
        }
        else if (visitNamereg.test(this.state.practiceName) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Place of visit atleast minimum of 3 characters',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Place of visit atleast minimum of 3 characters');
            } this.setState({
                isSending: false
            }); return;
        }
        if (Moment(this.state.dischargeDate).isSameOrAfter(this.state.admittedDate) && Moment(this.state.followUpDate).isSameOrAfter(this.state.admittedDate)) {
            const DischargeData = {
                id: this.state.dischargeId,
                PatientId: this.state.Userid,
                Instructions: this.state.instructions,
                FollowupDate: this.state.followUpDate,
                DischargeNote: this.state.dischargeNotes,
                DischargeDate: this.state.dischargeDate,
                AdmittedDate: this.state.admittedDate,
                practiceName: Utility.IsNullOrEmpty(this.state.practiceName) ? '' : this.state.practiceName
            };
            console.log(DISCHARGE_DETAILS_LIST_URL)
            console.log("DischargeData", DischargeData);
            fetch(DISCHARGE_DETAILS_LIST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.state.AccessToken}`,
                },
                body: JSON.stringify(DischargeData)
            }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('DischargeDetails');
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
        } else {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Admit date prior to discharge date & follow up date',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Admit date prior to discharge date & follow up date');
            }
        }
    }
    /***************************************************Delete Discharge *******************************************************/
    deleteDischargeDetails = (id) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (id) => {
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        const data = `id=${this.state.dischargeId}`;
        fetch(DISCHARGE_DETAILS_DELETE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_DELETE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('DischargeDetails');
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
    /*************************************************************************************************************** */

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Discharge Details....</Text>
                </View>
            );
        }
        return (
            <CommonView DischargeDetails={true} >
                <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 2 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 7, paddingRight: 5 }} size={20} name="hospital-building" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 7 }}>Place of Visit :        </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'Hospital Name'}
                                    secureTextEntry={false}
                                    fontSize={14}
                                    onChangeText={(practiceName) => this.setState({ practiceName })}
                                    value={this.state.practiceName}
                                    editable={this.state.IsControlEnabled}
                                    maxLength={100}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 6 }}>
                            <View style={{ width: '40%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar-clock" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                    Admitted Date :        </Text>
                            </View>
                            <View style={{ width: '60%' }}>
                                <DatePicker
                                    style={{ width: '60%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                    date={this.state.admittedDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="MM/DD/YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    editable={this.state.IsControlEnabled}
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 5, marginTop: 5 }
                                    }}
                                    onDateChange={(admittedDate) => { this.setState({ admittedDate }); }}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 6 }}>
                            <View style={{ width: '40%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                    Discharge Date :        </Text>
                            </View>
                            <View style={{ width: '60%' }}>
                                <DatePicker
                                    style={{ width: '60%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                    date={this.state.dischargeDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="MM/DD/YYYY"
                                    minDate={this.state.admittedDate}
                                    // maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    editable={this.state.IsControlEnabled}
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 5, marginTop: 5 }
                                    }}
                                    onDateChange={(dischargeDate) => { this.setState({ dischargeDate }); }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 4, paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row', width: '50%' }}>
                                <MaterialIcons style={{  paddingTop: 7, paddingRight: 5 }} size={20} name="description" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 6 }}>Description :        </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'Description '}
                                    maxLength={500}
                                    fontSize={14}
                                    secureTextEntry={false}
                                    editable={this.state.IsControlEnabled}
                                    onChangeText={(dischargeNotes) => this.setState({ dischargeNotes })}
                                    value={this.state.dischargeNotes}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 6 }}>
                            <View style={{ width: '40%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                    FollowupDate :        </Text>
                            </View>
                            <View style={{ width: '60%' }}>
                                <DatePicker
                                    style={{ width: '60%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                    date={this.state.followUpDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="MM/DD/YYYY"
                                    minDate={this.state.todayDate}
                                    // minDate={this.state.admittedDate}
                                    // maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    editable={this.state.IsControlEnabled}
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 5, marginTop: 5 }
                                    }}
                                    onDateChange={(followUpDate) => { this.setState({ followUpDate }); }}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 4, paddingBottom: 4 }}>
                            <View style={{ flexDirection: 'row', width: '50%' }}>
                                <Foundation style={{ paddingTop: 7, paddingRight: 5, paddingLeft: 3 }} size={20} name="clipboard-notes" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 6 }}>Instructions :        </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'Instructions '}
                                    maxLength={500}
                                    fontSize={14}
                                    editable={this.state.IsControlEnabled}
                                    secureTextEntry={false}
                                    onChangeText={(instructions) => this.setState({ instructions })}
                                    value={this.state.instructions}

                                />
                            </View>
                        </View>
                        {this.state.dataSource == 2 ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.updateDischargeDetails(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '12%' }} />
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.deleteDischargeDetails(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            : null}
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
export default DischargeDetailsData;

