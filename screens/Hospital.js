/* eslint - disable no - undef * /
/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, KeyboardAvoidingView, TouchableOpacity, RefreshControl, AsyncStorage, View, Dimensions, Animated, ActivityIndicator, ToastAndroid, NetInfo } from 'react-native';
import { Input } from 'react-native-elements';
import { AntDesign, FontAwesome, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { GET_ALL_HOSPITAL, GET_MY_HOSPITAL, ADD_MY_HOSPITAL, DELETE_MY_HOSPITAL, GET_HOSPITAL_URL, SAVE_UN_PWD_HEAL } from '../constants/APIUrl';
import { HOSPITAL_DELETED_SUCCESS_MSG, VALIDATION_ERR, VALIDATION_EMAIL_ERR, INTERNET_CONN_ERR, HOSPITAL_ADDED_SUCCESS_MSG } from '../constants/Messages';
import CommonView from '../components/CommonView';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';

let CONNECTION_STATUS = false;

class Hospital extends Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true, datatoken: '', exportHospitals: '', userNameEncrypt: '', HospSelectedItems: '', hospitalServiceURL: '', hospitalResp: [], myHospitals: [], showMenu: false, refreshing: false, showMyHospitals: true, myHospitals: [], showDialog: false, username: '', pwd: '', targetHosName: '', locationId: '', showLoginPopup: false, checked: true, isLoggingIn: false, userid: '', heightAnim: new Animated.Value((Dimensions.get('window').height)) };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    CONNECTION_STATUS = connectionInfo.type != 'none';
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
                if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
                // navigator.geolocation.getCurrentPosition(
                //     (position) => {
                //         this.setState({
                //             latitude: position.coords.latitude,
                //             longitude: position.coords.longitude,
                //             error: null,
                //         });
                //     },
                //     (error) => this.setState({ error: error.message }),
                //     { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
                // );
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                this.setState({
                    datatoken: USER_DATA.ACCESS_TOKEN,
                    userid: USER_DATA.User_Id,
                });
                this.getHospitalData();
            }
        );
    }
    parseDMSString(dmsStr) {
        // check for signed decimal degrees without NSEW, if so return it directly
        if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);
        // strip off any sign or compass dir'n & split out separate d/m/s
        const dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
        if (dms[dms.length - 1] == '') dms.splice(dms.length - 1); // from trailing symbol
        if (dms == '') return NaN;
        // and convert to decimal degrees...
        let deg = null;
        switch (dms.length) {
            case 3: // interpret 3-part result as d/m/s
                deg = dms[0] / 1 + dms[1] / 60 + dms[2] / 3600;
                break;
            case 2: // interpret 2-part result as d/m
                deg = dms[0] / 1 + dms[1] / 60;
                break;
            case 1: // just d (possibly decimal) or non-separated dddmmss
                deg = dms[0];
                // check for fixed-width unseparated format eg 0033709W
                //if (/[NS]/i.test(dmsStr)) deg = '0' + deg; // - normalise N/S to 3-digit degrees
                //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
                break;
            default:
                return NaN;
        }
        if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve
        return Number(deg);
    }
    getDistanceFromLatLonInKm(lat2, lon2) {
        let lat21 = this.parseDMSString(lat2);
        let lon21 = this.parseDMSString(lon2);
        if (this.state.latitude == 0) { return ''; }
        let lat1 = this.state.latitude;
        let lon1 = this.state.longitude;
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat21 - lat1); // deg2rad below
        var dLon = this.deg2rad(lon21 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat21)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = (R * c).toFixed(1) + " KM"; // Distance in km
        return isNaN(R * c) ? "" : d;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180)
    }
    async componentDidMount() {
        // navigator.geolocation.getCurrentPosition(
        //     (position) => {
        //         this.setState({
        //             latitude: position.coords.latitude,
        //             longitude: position.coords.longitude,
        //             error: null,
        //         });
        //     },
        //     (error) => this.setState({ error: error.message }),
        //     { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
        // );
        const { params } = this.props.navigation.state;
        if (!Utility.IsNullOrEmpty(params)) {
            let type = params.type;
            if (!Utility.IsNullOrEmpty(type) && type == 'SignUp') {
                let Service_URL = params.Service_URL;
                let locationId = params.LocationId;
                let HosName = params.HosName;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (!Utility.IsNullOrEmpty(USER_DATA) && USER_DATA.hasOwnProperty('Hospital')) {
                    delete USER_DATA.Hospital;
                    this.hospitalLogin(HosName, locationId, Service_URL);
                }
            }
        }
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**********************************************************Get All Hospital Data ************************************************/
    getHospitalData = () => {
        fetch(`${GET_ALL_HOSPITAL}?patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.datatoken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((resp) => resp.json()).then((res) => {

                this.setState({
                    isLoading: false,
                    refreshing: false,
                    myHospitals: res.responseData,
                });
                fetch(`${GET_MY_HOSPITAL}?patientId=${this.state.userid}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${this.state.datatoken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }).then((resp) => resp.json()).then((response) => {
                    console.log("myHospitals", response.responseData)
                    this.setState({
                        isLoading: false,
                        refreshing: false,
                        hospitalResp: response.responseData,
                    });
                }).catch(err => {
                    this.setState({ refreshing: false, isLoading: false, });
                    return;
                });
            }).catch(err => {
                this.setState({ refreshing: false, isLoading: false, });
                return;
            });
    }
    /***********************************************************Add Hospital *****************************************************************/

    addHospital = (data) => {
        const HosData = { PatientId: this.state.userid, HospitalId: data };
        fetch(ADD_MY_HOSPITAL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.state.datatoken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(HosData)
        }).then(aPIStatusInfo.handleResponse)
            .then((resp) => resp.json()).then((res) => {
                if (res.responseData.length > 0) {
                    ToastAndroid.showWithGravity(
                        HOSPITAL_ADDED_SUCCESS_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({
                        showMyHospitals: true
                    }, function () {
                        this.getHospitalData();
                    });
                }
            }).catch(err => {
                this.setState({ refreshing: false, isLoading: false, });
                return;
            });
    }
    updateState(data) {
        console.log("hospSearch", data)
        this.setState({ hospitalResp: data.FilteredData, myHospitals: data.FilteredData });
    }

    /*...........................Delete Hospital Record......................................................*/
    removeHospital = (data) => {
        Alert.alert(
            'Remove From My Hospital?',
            'Are you sure you want to remove this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(data) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (data) => {
        this.setState({
            loadingMsg: 'Deleting Data...',
            isLoading: true,
        });
        fetch(`${DELETE_MY_HOSPITAL}?id=${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then(() => {
                ToastAndroid.showWithGravity(
                    HOSPITAL_DELETED_SUCCESS_MSG,
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
                this.setState({
                    isLoading: false, refreshing: false,
                }, function () {
                    this.getHospitalData();
                });
            })
            .catch(err => {
                console.log('err', err);
                this.setState({
                    isLoading: false, refreshing: false,
                });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
    /************************************************************************************************************************************** */

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
    /*************************************Toggle Hospital ***********************************************************/

    toggleHospitals = () => {
        if (this.state.showMyHospitals) {
            this.setState({
                showMyHospitals: false
            });
        } else {
            this.setState({
                showMyHospitals: true
            });
        }
    };
    hospitalLogin = async (targetHospital, hospitalLocationID, hospitalServiceURL) => {
        // await AsyncStorage.setItem('HOSPITAL_DATA','');return ;
        let LoggedInHospital = await AsyncStorage.getItem('USER_DATA');
        LoggedInHospital = Utility.IsNullOrEmpty(LoggedInHospital) ? '' : JSON.parse(LoggedInHospital);

        console.log("HOSPITAL_DATA", LoggedInHospital);
        if (!(LoggedInHospital.hasOwnProperty('Hospital') && LoggedInHospital.Hospital.PracticeId == hospitalLocationID)) {
            this.setState({
                showLoginPopup: true,
                targetHosName: targetHospital,
                hospitalServiceURL: hospitalServiceURL
            });


            Animated.timing(
                this.state.heightAnim,
                {
                    toValue: (Dimensions.get('window').height / 9),
                    duration: 500,
                }
            ).start();

        }
        else {
            if (LoggedInHospital.Hospital.IsHealId == "False") {
                // if (Utility.IsNullOrEmpty(LoggedInHospital.Hospital.HealId)) {
                this.saveToHealConfirm(LoggedInHospital.HealId, LoggedInHospital.Hospital.PracticeId, LoggedInHospital.User_Id, LoggedInHospital.Hospital.Id);
                // }
            }
            this.props.navigation.navigate('HospitalDashboard');
        }
    };
    /*****************************************Login To Hospital ******************************************************************/
    async loginToHospital(isfirstTimecheck, HospName) {
        console.log('hi', this.state.hospitalServiceURL);
        this.setState({ isLoggingIn: true });
        let LoginCheck = false;
        const { username, password } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // let username = "az";
        // let password = "Pass@1234";
        this.setState({ username: username, password: password });
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
        fetch(`${this.state.hospitalServiceURL}/Token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: LoginData
        }).then((resp) => resp.json()).then(async (res) => {
            console.log("res", res)
            let USER_DATA = await AsyncStorage.getItem('USER_DATA');
            USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
            await AsyncStorage.removeItem('ACCESS_TYPE');
            let HOSPITAL_DATA = {};
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
                    ServiceURL: this.state.hospitalServiceURL,
                    HealId: USER_DATA.HealId,
                    LastLogin_Date: res.LastLoginDate,
                    HospName: HospName,
                    AppointmentLogin: false,
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
                this.setState({ showLoginPopup: false, isLoggingIn: false, HOSP_USER_DATA: HOSPITAL_DATA.Hospital }); this.removeDialog();
                AsyncStorage.setItem('USER_DATA', JSON.stringify(HOSPITAL_DATA)).then(() => {

                    if (res.IsHealId == "False") {
                        // if (isfirstTimecheck) {

                        this.saveToHealConfirm(HOSPITAL_DATA.HealId, HOSPITAL_DATA.Hospital.PracticeId, HOSPITAL_DATA.User_Id, HOSPITAL_DATA.Hospital.Id);
                    }
                    ToastAndroid.show('You have LoggedIn Successfully!', ToastAndroid.SHORT);
                    this.props.navigation.navigate('HospitalDashboard');
                });
            }
        }).catch(err => {
            console.log("err", err)
            this.setState({
                isLoggingIn: false,
            });
            this.hospitalLogin(this.state.targetHosName, this.state.locationId, this.state.hospitalServiceURL);
            const errMSg = '';
            ToastAndroid.showWithGravity(
                // errMSg.length > 0 ? errMSg : COMMON_ERROR,
                errMSg.length > 0 ? errMSg : 'Please enter valid credential',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    saveToHealConfirm = (healId, practiceID, patientId, accountID) => {
        Alert.alert(
            "Save Data",
            "Do you want to save username and password on heal?",
            [
                {
                    text: "OK",
                    onPress: () => this.saveToHeal(healId, practiceID, patientId, accountID),
                    style: "OK"
                },
                { text: "Cancel" }
            ],
            { cancelable: false }
        );
    }
    async saveToHeal(healId, practiceID, patientId, accountID) {
        // const healData = {
        // patientId: patientId,
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
        console.log("healData", healData);
        fetch(SAVE_UN_PWD_HEAL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
            body: JSON.stringify(healData)
        }).then((response) => response.json()).then((res) => {
            console.log('saveres', res);
            if (res.statusCode == 200) {
                this.saveHealIdToClient(healId, accountID);
            }
            else if (res.statusCode == 400) {
                ToastAndroid.show('This user belongs to someother user', ToastAndroid.LONG);
                this.setState({
                    isSending: false,
                }, function () {
                    this.props.navigation.navigate('HospitalDashboard');
                });
            }
        })
            .catch(err => {
                console.log('errlog', err);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? "Failed to save Heal data" : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    async saveHealIdToClient(healId, accountID) {

        fetch(`${this.state.HOSP_USER_DATA.ServiceURL}api/AppointmentService/SaveHEALId?accountId=${accountID}&healId=${healId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.HOSP_USER_DATA.ACCESS_TOKEN}`,
            },
        }).then((response) => response.json()).then((res) => {
            console.log('res', res);
            if (res.statusCode == 200) {
                ToastAndroid.show('Data saved Successfully', ToastAndroid.SHORT);
                console.log("saveHealIdToClient");
            }
        })
            .catch(err => {
                console.log('errlog', err);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? "Failed to save Heal data" : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    async checkFirstTimeLogin(name, locationId, serviceUrl, HospName) {
        console.log(serviceUrl);
        console.log(GET_HOSPITAL_URL, locationId, this.state.userid, this.state.datatoken);
        fetch(`${GET_HOSPITAL_URL}?practiceId=${locationId}&patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then((response) => response.json()).then((res) => {
            console.log('ressdfsdfg', res);
            if (res.statusCode == 200) {
                let response = res.responseData;
                if (!Utility.IsNullOrEmpty(response.userName) && !Utility.IsNullOrEmpty(response.password)) {
                    this.setState({ targetHosName: name, locationId: locationId, username: response.userName, userNameEncrypt: response.userNameEncrypt, password: response.password, hospitalServiceURL: response.serviceURL }, function () {
                        this.loginToHospital(true, HospName);
                    });
                }
                else {
                    this.hospitalLogin(name, locationId, serviceUrl);
                }
            }
        })
            .catch(err => {
                console.log('errlog', err);
                const errMSg = '';
                this.hospitalLogin(name, locationId, serviceUrl);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? "Failed to save Heal data" : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /*..........................................................................................................................*/

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Hospital Data....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Hospitals' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }} >
                    {this.state.showMyHospitals ?
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <View style={styles.tabStyleActive1}>
                                <Text style={styles.tabFontActive}>My Hospitals</Text>
                            </View>
                            <View style={styles.tabStyle}>
                                <Text style={styles.tabFont} onPress={() => this.toggleHospitals()}>All Hospitals</Text>
                            </View>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <View style={styles.tabStyle}>
                                <Text style={styles.tabFont} onPress={() => this.toggleHospitals()}>My Hospitals</Text>
                            </View>
                            <View style={styles.tabStyleActive2}>
                                <Text style={styles.tabFontActive}>All Hospitals</Text>
                            </View>
                        </View>
                    }

                    {this.state.showMyHospitals ?
                        <ScrollView
                            style={{ paddingLeft: 8, paddingRight: 8 }} refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.getHospitalData}
                                />
                            }
                        >
                            <View style={{ flexDirection: 'column' }} >
                                {this.state.hospitalResp.map((data, index) => (
                                    <View style={{ borderBottomWidth: 0.2, borderBottomColor: 'gray', paddingBottom: 10, paddingTop: 2 }} >
                                        <TouchableOpacity
                                            key={index} onPress={() => this.checkFirstTimeLogin(data.photoContent, data.locationId, data.serviceUrl, data.name)}
                                        >
                                            <View style={styles.card}>
                                                <View style={{ flexDirection: 'row', paddingRight: 15 }}>
                                                    <Image source={{ uri: Utility.IsNullOrEmpty(data.photoContent) ? 'https://care.patientheal.com/PatientCareServices/UserFiles/Hospital/DefaultHospital.jpg' : `data:image/jpg;base64,${data.photoContent}` }} style={styles.hospitalImage} />
                                                    <View style={{ flexWrap: 'wrap', paddingLeft: 5 }}>
                                                        <Text numberOfLines={3} style={{ fontSize: 14, textAlign: 'left', paddingBottom: 5, color: 'gray', fontWeight: 'bold' }}>{data.name}</Text>
                                                        <Text numberOfLines={3} style={{ fontSize: 10, textAlign: 'left', color: '#767575', flexWrap: 'wrap' }}>{data.address},&nbsp; {data.city},&nbsp;{data.state}&nbsp; {data.zip}</Text>
                                                    </View>

                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: 'flex-end', width: '100%' }} >
                                            {/* <Text style={{ color: '#3AA6CD', paddingRight: 10 }}>
                                                <MaterialCommunityIcons size={14} color="#F92557" name="map-marker-distance" /> {this.getDistanceFromLatLonInKm(data.lattitude, data.longitude)} </Text> */}
                                            <TouchableOpacity onPress={() => { this.removeHospital(data.id); }}>
                                                <View style={{ alignItems: 'flex-end', width: '100%' }} >
                                                    <Text style={{ color: '#F92557' }}><Entypo size={14} color="#F92557" name="circle-with-cross" /> Remove Hospital </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                {this.state.hospitalResp.length == 0 ?
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                        <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                    </View>
                                    : null}
                            </View>
                        </ScrollView>
                        :
                        <ScrollView
                            style={{ paddingLeft: 8, paddingRight: 8 }} showsVerticalScrollIndicator={false} refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.getHospitalData}
                                />
                            }
                        >
                            <View style={{ marginBottom: 20 }}>
                                {this.state.myHospitals.map(data => (
                                    <View key={data.locationId} style={{ flexDirection: 'column', borderBottomWidth: 0.2, borderBottomColor: 'gray', paddingBottom: 10, marginBottom: 10 }} >
                                        <View style={styles.card}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Image source={{ uri: Utility.IsNullOrEmpty(data.photoContent) ? 'https://care.patientheal.com/PatientCareServices/UserFiles/Hospital/DefaultHospital.jpg' : `data:image/jpg;base64,${data.photoContent}` }} style={styles.hospitalImage} />

                                                <View style={{ flexWrap: 'wrap', paddingLeft: 5 }}>
                                                    <Text numberOfLines={3} style={{ fontSize: 14, textAlign: 'left', paddingBottom: 5, color: 'gray', fontWeight: 'bold' }}>{data.name}</Text>
                                                    <Text numberOfLines={3} style={{ fontSize: 10, textAlign: 'left', paddingBottom: 7, flexWrap: 'wrap', color: '#767575' }}>{data.address},&nbsp;{data.city},&nbsp;{data.state}&nbsp;-&nbsp;{data.zip}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: 'flex-end', width: '100%' }} >
                                            {/* <Text style={{ color: '#3AA6CD', paddingRight: 10 }}><MaterialCommunityIcons size={14} color="#F92557" name="map-marker-distance" /> {this.getDistanceFromLatLonInKm(data.lattitude, data.longitude)} </Text> */}
                                            <TouchableOpacity onPress={() => { this.addHospital(data.locationId); }} >
                                                <View style={{ alignItems: 'flex-end', width: '100%' }}>
                                                    <Text style={{ color: '#2FD573' }}><FontAwesome size={14} color="#2FD573" name="plus-circle" /> Add Hospital </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                {this.state.myHospitals.length == 0 ?
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                        <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                    </View>
                                    : null}
                            </View>
                        </ScrollView>
                    }
                    <Animated.View
                        style={{
                            top: this.state.heightAnim,
                            //top:40,
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
                            <TouchableOpacity onPress={() => this.removeDialog()}>
                                <AntDesign
                                    name="closecircle"
                                    size={25}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <View>
                                <ScrollView>
                                    <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }}>

                                        <View style={{ justifyContent: 'center', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ height: 100, width: 200, flexDirection: 'row' }}>
                                                    {/* <Image source={require('../assets/images/hospital-logo.png')} style={styles.hospitalImage1} /> */}
                                                    {/* <Text numberOfLines={3} style={styles.HosName}>{this.state.targetHosName}</Text> */}

                                                    <Image source={{ uri: Utility.IsNullOrEmpty(this.state.targetHosName) ? 'https://care.patientheal.com/PatientCareServices/UserFiles/Hospital/DefaultHospital.jpg' : `data:image/jpg;base64,${this.state.targetHosName}` }} style={styles.hospitalImage2} />
                                                </View>
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
                                            <TouchableOpacity style={styles.cusButtonLargeGreen2} onPress={() => this.loginToHospital()}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {/* {this.state.isLoggingIn ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined} */}
                                                    <Text
                                                        style={{ color: '#fff', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        LOGIN
 </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>

                                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.props.navigation.navigate('ForgotPassword1', { Service_URL: this.state.hospitalServiceURL, type: 'SignUp' })}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text
                                                            style={{ color: '#3AA6CD', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                                        > Forgot password?</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.props.navigation.navigate('Register1', { Service_URL: this.state.hospitalServiceURL, locationId: this.state.locationId, HosName: this.state.targetHosName, type: 'SignUp' })}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        {/* {this.state.isLoggingIn ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined} */}
                                                        <Text
                                                            style={{ color: '#3AA6CD', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            SignUp
 </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </KeyboardAvoidingView>
                                </ScrollView>
                            </View>
                        </View>
                    </Animated.View>
                </View>
                {this.state.showLoginPopup ?
                    <TouchableOpacity onPress={() => this.removeDialog()} style={{ position: 'absolute', backgroundColor: '#00000061', top: 0, bottom: 0, zIndex: 1, width: (Dimensions.get('window').width), height: (Dimensions.get('window').height) }} />
                    :
                    null
                }
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
    hospitalImage: {
        resizeMode: 'contain',
        width: 50,
        height: 50
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
    cusButtonLargeGreen2: {
        backgroundColor: '#3AA6CD',
        color: '#fff',
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
        borderColor: '#fff',
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        flexDirection: 'row',
        marginBottom: 7
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    tab: {
        elevation: 0,
        width: (Dimensions.get('window').width / 2),
        marginBottom: 10,
        color: '#41b4af',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        borderBottomColor: '#41b4af',
        borderBottomWidth: 2
    },
    tabActive: {
        elevation: 0,
        width: (Dimensions.get('window').width / 2),
        marginBottom: 10,
        color: 'white',
        fontSize: 20,
        backgroundColor: '#41b4af',
        textAlign: 'center',
        paddingTop: 3,
        paddingBottom: 3,
        borderBottomWidth: 2
    },
    tabStyleActive1: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 25,
        borderColor: '#ECEDED',
        borderWidth: 2,
        width: 180,
        zIndex: 2,
        marginRight: -35,
        backgroundColor: '#3AA6CD'
    },
    tabStyleActive2: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 25,
        borderColor: '#ECEDED',
        borderWidth: 2,
        width: 180,
        marginLeft: -35,
        backgroundColor: '#3AA6CD',
        zIndex: 2
    },
    tabStyle: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 25,
        borderColor: '#ECEDED',
        borderWidth: 2,
        width: 180,
    },
    tabFont: {
        fontSize: 15,
        color: 'gray',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tabFontActive: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center'
    },
    hospBackgrnd: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    cusButtonLargeGreen: {
        backgroundColor: '#fff',
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
        width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5
    },
    cusButtonLargeGreenText: {
        fontWeight: 'bold',
        color: '#3aa6cd',
        textAlign: 'center',
        fontSize: 20
    },
    HosName: {
        fontWeight: 'bold', fontSize: 15, paddingTop: 19, color: '#8389A5', paddingLeft: 8, paddingRight: 8
    }
});

export default Hospital;
