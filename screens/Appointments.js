/* eslint - disable no - prototype - builtins * /
/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
    ScrollView, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator, AsyncStorage, View, Alert, Dimensions, RefreshControl, KeyboardAvoidingView, ToastAndroid, NetInfo, Animated
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialIcons, AntDesign, Foundation, Entypo, Ionicons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { COMMON_ERROR, VALIDATION_ERR, INTERNET_CONN_ERR, VALIDATION_EMAIL_ERR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import { GET_MYLOCATION_APPOINTMENT, SAVE_UN_PWD_HEAL, GET_HOSPITAL_URL } from '../constants/APIUrl';
import AccessRecord from '../components/AccessRecord';
import { Dropdown } from 'react-native-material-dropdown';
import { Input } from 'react-native-elements';
let CONNECTION_STATUS = false;

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = { ServiceURL: '', heightAnim: new Animated.Value((Dimensions.get('window').height)), HospName: '', isLoading: true, isLoggingIn: false, targetHosName: '', username: '', password: '', showLoginPopup: false, ACCESS_TOKEN: '', AccountId: '', HospSelectedItems: '', Hosp_User_data: {}, HospmodalVisible: false, AppointmentResp: [], AppointmentRespOriginal: [], userid: '', refreshing: false, HospitalData: [], locationId: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                console.log('ffdd', USER_DATA);
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                let Hosp_User_data = '';
                // if (!(USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.PracticeId == hospitalLocationID)) {
                if (USER_DATA.hasOwnProperty('Hospital')) {
                    Hosp_User_data = USER_DATA.Hospital;
                }
                console.log('Hosp_User_data', Hosp_User_data);
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            ACCESS_TOKEN: USER_DATA.ACCESS_TOKEN,
                            AccountId: ACCESS_TYPE.accountId,
                            userid: USER_DATA.User_Id,
                            Hosp_User_data: Hosp_User_data,
                        }, function () {
                            console.log("Hosp_User_data", this.state.Hosp_User_data)
                            this.hospitalData();
                            // this.appointmentData();
                        });
                    }
                } else {
                    this.setState({
                        AccountId: USER_DATA.Id,
                        ACCESS_TOKEN: USER_DATA.ACCESS_TOKEN,
                        userid: USER_DATA.User_Id,
                        Hosp_User_data: Hosp_User_data
                    }, function () {
                        console.log("Hosp_User_data", this.state.Hosp_User_data)
                        this.hospitalData();
                        // this.appointmentData();
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
    async componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        // await AsyncStorage.removeItem('USER_DATA.Hospital');
        // let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        // USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        // if(USER_DATA.hasOwnProperty("Hospital")) delete USER_DATA.Hospital;
        // await AsyncStorage.removeItem("USER_DATA");
        // await AsyncStorage.setItem("USER_DATA", JSON.stringify(USER_DATA));
        // await AsyncStorage.removeItem('ACCESS_TYPE');
    }
    hospitalLogin = async (targetHospital, hospitalLocationID, serviceUrl, HospName) => {
        let LoggedInHospital = await AsyncStorage.getItem('USER_DATA');
        LoggedInHospital = Utility.IsNullOrEmpty(LoggedInHospital) ? '' : JSON.parse(LoggedInHospital);

        console.log('hospitalLogin1', LoggedInHospital);
        console.log('hlp', `${targetHospital}^${hospitalLocationID}^${serviceUrl}`);
        if (!(LoggedInHospital.hasOwnProperty('Hospital') && LoggedInHospital.Hospital.PracticeId == hospitalLocationID)) {
            this.setState({
                showLoginPopup: true,
                targetHosName: targetHospital,
                ServiceURL: serviceUrl,
                HospName
            });

            Animated.timing(
                this.state.heightAnim,
                {
                    toValue: (Dimensions.get('window').height / 4) + 20,
                    duration: 500,
                }
            ).start();
        } else {
            if (LoggedInHospital.Hospital.IsHealId == "False") {
                // if (Utility.IsNullOrEmpty(LoggedInHospital.Hospital.healId)) {
                this.saveToHealConfirm(LoggedInHospital.HealId, LoggedInHospital.Hospital.PracticeId, LoggedInHospital.User_Id, LoggedInHospital.Hospital.Id);
            }
            console.log('hospitalLogin2', LoggedInHospital);
            this.appointmentData(LoggedInHospital.Hospital);
        }
    };

    /*****************************************Remove Dialog ****************************************************/
    removeDialog = () => {
        this.setState({
            showLoginPopup: false
        });
        Animated.timing(
            this.state.heightAnim,
            {
                toValue: (Dimensions.get('window').height),
                duration: 250,
            }
        ).start();
    };
    async loginToHospital(isfirstTimecheck) {
        this.setState({ isLoggingIn: true });//,username:'prashand@gmail.com',password:'Pass@1234'
        const { username, password } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // let username = "az";
        // let password = "Pass@1234";
        this.setState({ username: username, password: password });
        //let username='prashand@gmail.com',password='Pass@1234';


        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity(
                INTERNET_CONN_ERR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({ isLoggingIn: false }); return;
        }
        if (username === '' || password === '') {
            ToastAndroid.showWithGravity(
                VALIDATION_ERR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({ isLoggingIn: false }); return;
        }
        const LoginData = `grant_type=password&username=${username.trim()}&password=${password}&scope=patient`;
        console.log('LoginData', LoginData);
        console.log('tok', `${this.state.ServiceURL}/Token`);
        await fetch(`${this.state.ServiceURL}Token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: LoginData
        }).then(aPIStatusInfo.handleResponse)
            .then((resp) => resp.json()).then(async (res) => {
                console.log('TokenApi', res);
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                await AsyncStorage.removeItem('ACCESS_TYPE');
                const HOSPITAL_DATA = {};
                if (USER_DATA != '') {

                    HOSPITAL_DATA.fullName = USER_DATA.fullName;
                    HOSPITAL_DATA.ACCESS_TOKEN = USER_DATA.ACCESS_TOKEN;
                    HOSPITAL_DATA.User_Id = USER_DATA.User_Id;
                    HOSPITAL_DATA.userName = USER_DATA.userName;
                    HOSPITAL_DATA.Id = USER_DATA.Id;
                    HOSPITAL_DATA.LastLogin_Date = USER_DATA.LastLogin_Date;
                    HOSPITAL_DATA.HealId = USER_DATA.HealId;
                    HOSPITAL_DATA.Hospital = {
                        ACCESS_TOKEN: res.access_token,
                        User_Id: res.userId,
                        userName: res.userName,
                        Id: res.id,
                        fullName: res.fullName,
                        PracticeId: res.PracticeId,
                        emailId: res.emailId,
                        ServiceURL: this.state.ServiceURL,
                        AppointmentLogin: true,
                        HealId: USER_DATA.HealId,
                        LastLogin_Date: res.LastLoginDate,

                        IsHealId: res.IsHealId
                    };
                }

                if (res.hasOwnProperty('error')) {
                    ToastAndroid.showWithGravity(
                        res.error_description,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                    this.setState({ isLoading: false, isLoggingIn: false, ACCESS_TOKEN: HOSPITAL_DATA.Hospital.ACCESS_TOKEN });
                } else {
                    this.removeDialog();
                    this.setState({ showLoginPopup: false, isLoggingIn: false, Hosp_User_data: HOSPITAL_DATA.Hospital }, function () {
                        AsyncStorage.setItem('USER_DATA', JSON.stringify(HOSPITAL_DATA)).then(() => {
                            // if (isfirstTimecheck == undefined) {
                            if (res.IsHealId == "False") {

                                this.saveToHealConfirm(HOSPITAL_DATA.HealId, HOSPITAL_DATA.Hospital.PracticeId, HOSPITAL_DATA.User_Id, HOSPITAL_DATA.Hospital.Id);
                            }
                            ToastAndroid.show('You have LoggedIn Successfully!', ToastAndroid.SHORT);
                            this.appointmentData(HOSPITAL_DATA.Hospital);
                        });
                    });
                }
            }).catch(err => {
                console.log('errlog', err);
                this.setState({
                    isLoggingIn: false,
                });
                this.hospitalLogin(this.state.targetHosName, this.state.HospSelectedItems, this.state.ServiceURL, this.state.HospName);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    AccountId: value.accountId
                }, function () {
                    this.hospitalData();
                });
            }
        }
    }
    updateState(data) {
        console.log("searchapp", data);
        this.setState({ AppointmentResp: data.FilteredData });
    }
    /********************************Hospital Data API Call *******************************************************/
    hospitalData = () => {
        fetch(`${GET_MYLOCATION_APPOINTMENT}?patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.ACCESS_TOKEN}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                const count = Object.keys(responseJson.responseData).length;
                const drop_down_data = [];
                for (let i = 0; i < count; i++) {
                    drop_down_data.push({ label: responseJson.responseData[i].name, value: responseJson.responseData[i].locationId, ServiceURL: responseJson.responseData[i].serviceUrl, logo: responseJson.responseData[i].photoContent, index: i });
                }
                console.log("this.state.Hosp_User_data.PracticeId", this.state.Hosp_User_data);
                // if (!(USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.PracticeId == hospitalLocationID)) {
                var hospSelectedItems = '';
                if (!Utility.IsNullOrEmpty(this.state.Hosp_User_data)) {
                    let practiceId = this.state.Hosp_User_data.PracticeId;
                    var hospitalSelected = drop_down_data.filter(function (hospData) {
                        return hospData.value = practiceId;
                    });


                    if (!Utility.IsNullOrEmpty(this.state.Hosp_User_data) && hospitalSelected.length > 0) {
                        hospSelectedItems = hospitalSelected[0].value;
                        this.changeHospitalStatus(hospSelectedItems, hospitalSelected[0].index, drop_down_data);
                    }
                }
                this.setState({
                    HospitalData: drop_down_data,
                    AppointmentResp: [],
                    AppointmentRespOriginal: [],
                    isLoading: false,
                    HospSelectedItems: hospSelectedItems
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                console.error(error);
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    // changeHospitalStatus = (val) => {
    // this.setState({
    // HospSelectedItems: val
    // }, function () {
    // this.appointmentData();
    // });
    // }
    closeModal() {
        this.setState({ modalVisible: false });
    }
    changeHospitalStatus = (val, index, data) => {
        console.log('hosval', val);
        this.setState({
            HospSelectedItems: val,
            ServiceURL: data[index].ServiceURL,
            HospName: data[index].label,
            targetHosName: data[index].logo,
            AppointmentResp: [],
            AppointmentRespOriginal: [],
            //AppointmentURL: data[index].AppointmentURL
        }, function () {
            this.checkFirstTimeLogin(data[index].logo, val, data[index].ServiceURL);
            //.hospitalLogin(data[index].label, val);
        });
    }
    async checkFirstTimeLogin(name, locationId, serviceUrl) {
        console.log('checkfir', `${GET_HOSPITAL_URL}?practiceId=${this.state.HospSelectedItems}&patientId=${this.state.userid}`);
        fetch(`${GET_HOSPITAL_URL}?practiceId=${this.state.HospSelectedItems}&patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.ACCESS_TOKEN}`,
            },
        }).then((response) => response.json()).then(async (res) => {
            console.log('resfir', res);
            console.log('resfir2', res.responseData.userName);
            if (res.statusCode == 200) {
                const response = res.responseData;
                console.log('resfir111', response);
                if (!Utility.IsNullOrEmpty(response.userName.trim()) && !Utility.IsNullOrEmpty(response.password.trim())) {
                    console.log('resfir11', response);
                    this.setState({ targetHosName: name, locationId, username: response.userName, password: response.password, ServiceURL: response.serviceURL }, function () {
                        console.log('resfir1', response);
                        this.loginToHospital(true);
                    });
                } else {
                    console.log('resfir11221', response);
                    this.hospitalLogin(name, locationId, serviceUrl, this.state.HospName);
                }
            }
        })
            .catch(err => {
                const errMSg = '';
                this.hospitalLogin(name, locationId, serviceUrl, this.state.HospName);
                console.log('errMSg', err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? 'Failed to save Heal data' : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    saveToHealConfirm = (healId, practiceID, patientId, accountID) => {
        console.log('saveToHealConfirm', healId + practiceID + patientId);
        Alert.alert(
            'Save Data',
            'Do you want to save username and password on heal?',
            [

                {
                    text: 'OK',
                    onPress: () => this.saveToHeal(healId, practiceID, patientId, accountID),
                    style: 'OK'
                },
                { text: 'Cancel', onPress: () => this.appointmentData() }
            ],
            { cancelable: false }
        );
    }
    async saveToHeal(healId, practiceID, patientId, accountID) {
        // const healData = {
        // patientId,
        // practiceId: this.state.HospSelectedItems,
        // userName: this.state.username,
        // password: this.state.password,
        // AccountId: accountID
        // };
        const healData = {
            patientId: patientId,
            practiceId: practiceID,
            userName: this.state.username,
            // userNameEncrypt: "KtkWvBKaiQQ=",
            password: this.state.password,
            status: 1
        };
        console.log('healData', healData);
        console.log('healData', healData);
        fetch(SAVE_UN_PWD_HEAL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.ACCESS_TOKEN}`,
            },
            body: JSON.stringify(healData)
        }).then((response) => response.json()).then((res) => {
            console.log('res', res);
            if (res.statusCode == 200) {
                this.saveHealIdToClient(healId, accountID);
            } else if (res.statusCode == 400) {
                ToastAndroid.show('This user belongs to someother user', ToastAndroid.LONG);
                this.setState({
                    isSending: false,
                }, function () {
                    // this.props.navigation.navigate('AppointmentsStatic');
                });
            }
        })
            .catch(err => {
                console.log('errlog', err);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? 'Failed to save Heal data' : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    async saveHealIdToClient(healId, accountID) {
        fetch(`${this.state.Hosp_User_data.ServiceURL}api/AppointmentService/SaveHEALId?accountId=${accountID}&healId=${healId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.Hosp_User_data.ACCESS_TOKEN}`,
            },
        }).then((response) => response.json()).then((res) => {
            console.log('res', res);
            if (res.statusCode == 200) {
                ToastAndroid.show('Data saved Successfully', ToastAndroid.SHORT);
                console.log('saveHealIdToClient');
            }
        })
            .catch(err => {
                console.log('errlog', err);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? 'Failed to save Heal data' : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /***********************Appointment API Call *************************************************************************/
    appointmentData = (obj) => {
        let ServiceURL = '',
            ACCESS_TOKEN = '',
            Id = '';
        this.setState({ refreshing: true });

        if (obj != undefined) {
            ServiceURL = obj.ServiceURL;
            Id = obj.Id;
            ACCESS_TOKEN = obj.ACCESS_TOKEN;
        } else {
            ServiceURL = this.state.Hosp_User_data.ServiceURL;
            Id = this.state.Hosp_User_data.Id;
            ACCESS_TOKEN = this.state.Hosp_User_data.ACCESS_TOKEN;
        }
        console.log(`${ServiceURL}api/AppointmentService/AllAppointments?accountId=${Id}`);
        fetch(`${ServiceURL}api/AppointmentService/AllAppointments?accountId=${Id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((response) => {
            console.log("appoint", response);
            const arr = response.responseData;
            if (arr.length == 0) {
                ToastAndroid.showWithGravity(
                    'No Data Available',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.sortArrayAsc(arr);
                this.setState({ isLoading: false, refreshing: false, AppointmentResp: arr, AppointmentRespOriginal: arr });
                return;
            }
            this.sortArrayAsc(arr);
            this.setState({ isLoading: false, refreshing: false, AppointmentResp: arr, AppointmentRespOriginal: arr });
            this.setState({
                isLoading: false,
                refreshing: false,
                AppointmentResp: arr,
                AppointmentRespOriginal: arr
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
    sortArrayAsc(array) {
        return array.sort((a, b) => {
            return new Date(b.preferredDate1).getTime() < new Date(a.preferredDate1).getTime() ? -1
                : new Date(b.preferredDate1).getTime() > new Date(a.preferredDate1).getTime() ? 1
                    : 0;
        });
    }
    updateState(data) {
        console.log("file", data.FilteredData)
        this.setState({ AppointmentResp: data.FilteredData });
    }
    /***************************************************Access Record for ******************************************************/
    render() {
        return (
            <CommonView customHeading='Appointments' HOSP_USER_DATA={this.state.AppointmentRespOriginal} updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <Dropdown
                        baseColor="#000"
                        label='Hospital'
                        value={this.state.HospSelectedItems}
                        data={this.state.HospitalData}
                        textColor='#746E6E'
                        labelHeight={6}
                        labelFontSize={17}
                        fontSize={16}
                        selectedItemColor='#41b4af'
                        containerStyle={{ margin: 10 }}
                        onChangeText={(val, index) => this.changeHospitalStatus(val, index, this.state.HospitalData)}
                    />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.hospitalData}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            {this.state.AppointmentResp.map(data => (
                                <TouchableOpacity
                                    key={data.id} style={{ marginRight: 5, flex: 1 }} onPress={() => this.props.navigation.navigate('AppointmentDetails', {
                                        AppointmentId: data.id,
                                        appointmentDate: data.appointmentDate,
                                        reason: data.reason,
                                        practiceName: data.practiceName,
                                        patientFirstName: data.patientFirstName,
                                        patientLastName: data.patientLastName,
                                        practiceId: data.practiceId,
                                        specialityId: data.specialityId,
                                        physicianId: data.physicianId,
                                        physicianName: data.physicianName,
                                        status: data.status,
                                        appointmentType: data.appointmentType,
                                        ServiceUrl: this.state.Hosp_User_data.ServiceURL,
                                        AccessToken: this.state.Hosp_User_data.ACCESS_TOKEN,
                                        preferredDate1: data.preferredDate1,
                                        userid: this.state.userid
                                    })}
                                >
                                    <View style={styles.card} key={data.id}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentReminder', {
                                                AppointRemindId: data.id, ServiceUrl: this.state.Hosp_User_data.ServiceURL,
                                                AccessToken: this.state.Hosp_User_data.ACCESS_TOKEN, AccountId: this.state.Hosp_User_data.Id
                                            })}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 8 }}>
                                                    <FontAwesome style={{ color: data.reminderSet == true ? '#1ec208' : '#ED1B24', paddingTop: 5 }} size={15} name='bell' /><Text />
                                                </View>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                                <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, paddingTop: 0, marginTop: 3 }}>{Utility.IsNullOrEmpty(data.physicianName) ? 'No Data' : data.physicianName}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <Foundation style={{ color: '#3AA6CD' }} size={15} name='clipboard-notes' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                    {Utility.IsNullOrEmpty(data.reason) ? 'No Data' : data.reason}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <MaterialIcons style={{ color: '#3AA6CD' }} size={15} name='date-range' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                    {Utility.IsNullOrEmpty(data.preferredDate1) ? '' : Moment(data.preferredDate1).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                                <AntDesign style={{ color: '#3AA6CD' }} size={15} name='sync' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 2 }}>
                                                    {/* {Utility.IsNullOrEmpty(data.appointmentDate) ? '' : Moment(data.appointmentDate).format('HH:SS a')} */}
                                                    {Utility.IsNullOrEmpty(data.appointmentType) ? '' : data.appointmentType == 1 ? 'Well Visit' : data.appointmentType == 2 ? 'Sick Visit' : data.appointmentType}
                                                    {/* {Utility.IsNullOrEmpty(data.appointmentType) ? 'No Data' : data.appointmentType} */}
                                                </Text>
                                            </View>
                                        </View>
                                        {/* <Entypo onPress={() => this.cancelAppointment(data.id)} style={{ color: '#ED1B24', position: 'absolute', right: 6, bottom: 20 }} size={25} name='cross' /> */}
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.AppointmentResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: 'bold', color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentsStatic')}>
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
                <Animated.View
                    style={{
                        top: this.state.heightAnim,
                        position: 'absolute',
                        backgroundColor: '#3AA6CD',
                        flex: 1,
                        flexDirection: 'column',
                        width: (Dimensions.get('window').width),
                        height: (Dimensions.get('window').height),
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20,
                        shadowColor: 'black',
                        zIndex: 10
                    }}
                >
                    <View style={styles.hospBackgrnd}>
                        {/* <ImageBackground source={require('../assets/images/hospitals--login---bg.png')} style={styles.hospBackgrnd}> */}
                        <TouchableOpacity onPress={() => this.removeDialog()} style={{}}>
                            <AntDesign
                                name="closecircle"
                                size={25}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <ScrollView>
                                <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1, marginTop: 20 }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                                        <View style={{ flex: 1 }}>


                                            {Utility.IsNullOrEmpty(this.state.targetHosName) ?
                                                <View style={{ height: 60, borderRadius: 400, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                    <Text numberOfLines={3} style={styles.HosName}>{this.state.HospName}</Text>
                                                </View>
                                                : <View style={{ height: 100, width: 200, flexDirection: 'row' }}>
                                                    <Image source={{ uri: Utility.IsNullOrEmpty(this.state.targetHosName) ? 'https://care.patientheal.com/PatientCareServices/UserFiles/Hospital/DefaultHospital.jpg' : `data:image/jpg;base64,${this.state.targetHosName}` }} style={styles.hospitalImage2} />
                                                </View>}
                                        </View>
                                        <Input
                                            style={styles.inputField}
                                            placeholder='Username'
                                            shake
                                            keyboardType={'email-address'}
                                            placeholderTextColor="#fff"
                                            value={this.state.username}
                                            leftIconContainerStyle={{ marginLeft: 0, paddingRight: 6 }}
                                            containerStyle={{ marginBottom: 20, marginTop: 17, borderBottomWidth: 0.5, borderBottomColor: '#fff' }}
                                            onChangeText={(username) => this.setState({ username })}
                                        />
                                        <Input
                                            style={styles.inputField}
                                            placeholder='Password'
                                            shake
                                            placeholderTextColor="#fff"
                                            secureTextEntry
                                            value={this.state.password}
                                            leftIconContainerStyle={{ marginLeft: 0, paddingRight: 6 }}
                                            containerStyle={{ marginBottom: 20, borderBottomWidth: 0.5, borderBottomColor: '#fff' }}
                                            onChangeText={(password) => this.setState({ password })}
                                        />
                                        <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.loginToHospital()}>
                                            <View style={{ flexDirection: 'row' }}>
                                                {this.state.isLoggingIn ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                                <Text
                                                    style={{ color: '#3AA6CD', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    LOGIN
 </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                </KeyboardAvoidingView>
                            </ScrollView>
                        </View>
                    </View>
                </Animated.View>
                {this.state.showLoginPopup ?
                    <TouchableOpacity onPress={() => this.removeDialog()} style={{ position: 'absolute', backgroundColor: '#00000061', top: 0, bottom: 0, zIndex: 1, width: (Dimensions.get('window').width), height: (Dimensions.get('window').height) }} />
                    :
                    null
                }
            </CommonView >
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
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 2,
        flexDirection: 'row'
    },
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        marginBottom: 4,
        paddingTop: 9,
        fontSize: 12,
        paddingLeft: 5
    },
    cusButtonLargeGreen1: {
        backgroundColor: '#fff',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        flexDirection: 'row',
        marginBottom: 7
    },
    hospitalImage2: {
        resizeMode: 'contain',
        width: 200,
        height: 100
    },
    hospitalImage1: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
        paddingTop: 7,
        paddingLeft: 7
    },
    inputField: {
        width: '100%',
        color: 'gray',
        borderWidth: 0,
        fontSize: 11,
        paddingBottom: 1,
        paddingLeft: 5
    },
    hospBackgrnd: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    HosName: {
        fontWeight: 'bold', fontSize: 15, paddingTop: 19, color: '#8389A5', paddingLeft: 8, paddingRight: 8
    }
});
export default Appointments;