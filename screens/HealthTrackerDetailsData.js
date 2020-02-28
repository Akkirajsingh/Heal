/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, AlertIOS, AsyncStorage, View, Dimensions, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { HEALTH_TRACKER_DETAILS_API, HOSP_HEALTH_TRACKER_DETAILS_API, HEALTH_TRACKER_API, HOSP_HEALTH_TRACKER_API } from '../constants/APIUrl';
import { HEALTH_TRACKER_UPDATED_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import Validation from '../components/Validation';

let HEALTH_TRACKER_DETAILS_API_URL = '';
let HEALTH_TRACKER_API_URL = '';
let CONNECTION_STATUS = false;
let today = new Date();
today.setDate(today.getDate() + 1);
let heightdrop = [{ value: '1', label: 'ft' }, { value: '2', label: 'cm' }];
let weightdrop = [{ value: '1', label: 'kg' }, { value: '2', label: 'lb' }];
let tempdrop = [{ value: '1', label: 'Celsius' }, { value: '2', label: 'Fahrenheit' }];

class HealthTracker extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        this.state = {
            AccessToken: '', Userid: '', heightDate: '', weightDate: '', tempDate: '', bloodPressureDate: '', bloodSugarDate: '', pulseRateDate: '', PrandialbloodSugarDate: '', Height: '', Weight: '', PulseRate: '', Temperature: '', BloodPressure: '', BloodSugar: '', PrandialbloodSugar: '',
            heightUnit: '', weightUnit: '', tempUnit: '', healthTracker:''
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
        HEALTH_TRACKER_API_URL = HEALTH_TRACKER_API;
        HEALTH_TRACKER_DETAILS_API_URL = HEALTH_TRACKER_DETAILS_API;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            HEALTH_TRACKER_DETAILS_API_URL = USER_DATA.ServiceURL + HOSP_HEALTH_TRACKER_DETAILS_API;
            HEALTH_TRACKER_API_URL = USER_DATA.ServiceURL + HOSP_HEALTH_TRACKER_API;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            healthTracker: params.healthTracker
        });
        this.getHealthTrackerDataById();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }

    /****************************************************Get Health Tracker Data By Id *****************************************************************/
    getHealthTrackerDataById = () => {  
        fetch(`${HEALTH_TRACKER_DETAILS_API_URL}?Id=${this.state.healthTracker}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                const HealthTrackerData = res.responseData;
                this.setState({
                    Height: HealthTrackerData.height,
                    heightUnit: HealthTrackerData.heightunit,
                    Weight: HealthTrackerData.weight,
                    weightUnit: HealthTrackerData.weightunit,
                    Temperature: HealthTrackerData.temperature,
                    tempUnit: HealthTrackerData.temperatureUnit,
                    BloodPressure: HealthTrackerData.bloodPressure,
                    BloodSugar: HealthTrackerData.fbs,
                    PrandialbloodSugar: HealthTrackerData.ppbs,
                    PulseRate: HealthTrackerData.pulseRate,
                    tempDate: Moment(HealthTrackerData.temperatureRecordDate).format('MM/DD/YYYY'),
                    pulseRateDate: Moment(HealthTrackerData.pulseRateRecordDate).format('MM/DD/YYYY'),
                    PrandialbloodSugarDate: Moment(HealthTrackerData.ppbsRecordDate).format('MM/DD/YYYY'),
                    heightDate: Moment(HealthTrackerData.heightRecordDate).format('MM/DD/YYYY'),
                    weightDate: Moment(HealthTrackerData.weightRecordDate).format('MM/DD/YYYY'),
                    bloodPressureDate: Moment(HealthTrackerData.bloodPressureRecordDate).format('MM/DD/YYYY'),
                    bloodSugarDate: Utility.IsNullOrEmpty(HealthTrackerData.fbsRecordDate) ? '' : Moment(HealthTrackerData.fbsRecordDate).format('MM/DD/YYYY'),
                });
            }
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
    /***********************************Add Family Hiatory *************************************************/
    updateHealthTracker = () => {
        const { navigate } = this.props.navigation;
        // let { Height, Weight, PulseRate, Temperature, BloodPressure, BloodSugar,PrandialbloodSugar  } = this.state;
        // let obj = [Height, Weight, PulseRate, Temperature, BloodPressure, BloodSugar, PrandialbloodSugar ];
        // let mandatoryMsg = ['Enter Height', 'Enter Weight', 'Enter PulseRate', 'Enter Temperature', 'Enter BloodPressure', 'Enter BloodSugar', 'Enter PrandialbloodSugar' ];
        // let pattern = ['', '', '','','','',''];
        // let patternMsg = ['', '', '','','','',''];
        // let length = ['', '', '','','','',''];
        // let lengthMsg = ['', '', '','','','',''];
        // // this.setState({ isSending: true });
        // var validInput = Validation.Validate(mandatoryMsg, pattern, patternMsg, length, lengthMsg, obj);
        // if (!Utility.IsNullOrEmpty(validInput)) {
        //     if (Platform.OS !== 'ios') {
        //         ToastAndroid.showWithGravity(
        //             validInput,
        //             ToastAndroid.SHORT,
        //             ToastAndroid.CENTER,
        //         );
        //     } else {
        //         AlertIOS.alert(validInput);
        //     } this.setState({
        //         isSending: false
        //     }); return;
        // } 

        const HealthTrackerData = {
            patientId: this.state.Userid,
            height: this.state.Height,
            heightunit: this.state.heightUnit,
            weight: this.state.Weight,
            weightunit: this.state.weightUnit,
            temperature: Number(this.state.Temperature),
            temperatureUnit: this.state.tempUnit,
            bloodPressure: this.state.BloodPressure,
            fbs: this.state.BloodSugar,
            ppbs: this.state.PrandialbloodSugar,
            pulseRate: this.state.PulseRate,
            PulseRateRecordDate: this.state.pulseRateDate,
            PPBSRecordDate: this.state.PrandialbloodSugarDate,
            HeightRecordDate: this.state.heightDate,
            WeightRecordDate: this.state.weightDate,
            BloodPressureRecordDate: this.state.bloodPressureDate,
            FBSRecordDate: this.state.bloodSugarDate,
            Action: 'update'
        };
        console.log("HealthTrackerData", HealthTrackerData);
        fetch(HEALTH_TRACKER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(HealthTrackerData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(HEALTH_TRACKER_UPDATED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('HealthTrackerListing');
                });
            }
        })
            .catch(err => {
                this.setState({
                    isSending: false
                });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
    /**************************************************Unit DropDown ******************************************************************/
    changeHeightUnits = (val) => {
        this.setState({ heightUnit: val })
    }
    changeWeightUnits = (val) => {
        this.setState({ weightUnit: val })
    }
    changeTempUnits = (val) => {
        this.setState({ tempUnit: val })
    }
    /********************************************************************************************************************************* */
    render() {
        return (
            <CommonView HealthTrackerDetails>
                <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>Height</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.heightDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(heightDate) => { this.setState({ heightDate }); }}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <View style={{ width: '70%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons size={20} style={styles.iconCss} name="human-male" />
                                <TextInput
                                    placeholder={'Height'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    style={{width:'100%', fontSize: 17 }}
                                    keyboardType={'numeric'}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(Height) => this.setState({ Height })}
                                    value={this.state.Height}
                                /></View>
                            <Dropdown
                                baseColor="#746E70"
                                label='HeightUnit'
                                data={heightdrop}
                                labelHeight={7}
                                fontSize={15}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                onChangeText={(val, index, data) => this.changeHeightUnits(val, index, data)}
                                value={this.state.heightUnit}
                                containerStyle={{ width: '30%' }} />
                        </View>

                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>Weight</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.weightDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(weightDate) => { this.setState({ weightDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <View style={{ width: '70%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons size={20} style={styles.iconCss} name="human" />
                                <TextInput
                                    placeholder={'Weight'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    style={{width:'100%', fontSize: 17 }}
                                    keyboardType={'numeric'}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(Weight) => this.setState({ Weight })}
                                    value={this.state.Weight}
                                /></View>
                            <Dropdown
                                baseColor="#746E70"
                                label='WeigthUnit'
                                data={weightdrop}
                                labelHeight={7}
                                fontSize={15}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                onChangeText={(val, index, data) => this.changeWeightUnits(val, index, data)}
                                value={this.state.weightUnit}
                                containerStyle={{ width: '30%' }} />
                        </View>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>Pulse Rate</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.pulseRateDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(pulseRateDate) => { this.setState({ pulseRateDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name="heart-pulse" />
                            <TextInput
                                placeholder={'Pulse Rate'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17 }}
                                keyboardType={'numeric'}
                                placeholderTextColor='#938F97'
                                onChangeText={(PulseRate) => this.setState({ PulseRate })}
                                value={this.state.PulseRate}
                            />
                        </View>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>Temperature</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.tempDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(tempDate) => { this.setState({ tempDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <View style={{ width: '60%', flexDirection: 'row' }}>
                                <Entypo style={styles.iconCss} size={20} name='thermometer' />
                                <TextInput
                                    placeholder={'Temperature'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    style={{width:'100%', fontSize: 17 }}
                                    keyboardType={'numeric'}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(temperature) => this.setState({ temperature })}
                                    value={this.state.temperature}
                                /></View>
                            <Dropdown
                                baseColor="#746E70"
                                label='Temperature'
                                data={tempdrop}
                                labelHeight={7}
                                fontSize={15}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                onChangeText={(val, index, data) => this.changeTempUnits(val, index, data)}
                                value={this.state.tempUnit}
                                containerStyle={{ width: '40%' }} />
                        </View>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>Blood Pressure</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.bloodPressureDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(bloodPressureDate) => { this.setState({ bloodPressureDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name="pulse" />
                            <TextInput
                                placeholder={'Blood Pressure'}
                                secureTextEntry={false}
                                maxLength={50}
                                keyboardType={'numeric'}
                                style={{width:'100%', fontSize: 17 }}
                                placeholderTextColor='#938F97'
                                onChangeText={(BloodPressure) => this.setState({ BloodPressure })}
                                value={this.state.BloodPressure}
                            />
                        </View>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>FBS(Fasting Blood Sugar)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.bloodSugarDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(bloodSugarDate) => { this.setState({ bloodSugarDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name="test-tube" />
                            <TextInput
                                placeholder={'FBS'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17 }}
                                keyboardType={'numeric'}
                                placeholderTextColor='#938F97'
                                onChangeText={(BloodSugar) => this.setState({ BloodSugar })}
                                value={this.state.BloodSugar}
                            />
                        </View>
                        <View style={styles.trackerHeading}>
                            <Text style={styles.boxTextCss}>PPBS(Post Prandial Blood Sugar)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.PrandialbloodSugarDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(PrandialbloodSugarDate) => { this.setState({ PrandialbloodSugarDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name="test-tube" />
                            <TextInput
                                placeholder={'PPBS'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17 }}
                                keyboardType={'numeric'}
                                placeholderTextColor='#938F97'
                                onChangeText={(PrandialbloodSugar) => this.setState({ PrandialbloodSugar })}
                                value={this.state.PrandialbloodSugar}
                            />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 7, paddingBottom: 12 }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.updateHealthTracker(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Update
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View >
            </CommonView >

        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    boxTextCss: {
        color: '#000', marginLeft: 5, fontWeight: 'bold', fontSize: 16
    },
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
    trackerHeading: {
        backgroundColor: '#f3f6fb', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 6, paddingBottom: 6, marginBottom: 6
    },
});
export default HealthTracker;
