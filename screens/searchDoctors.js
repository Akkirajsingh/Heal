import React, { Component } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, View, NetInfo, AsyncStorage, ToastAndroid, DatePickerAndroid, Modal, Dimensions, Animated, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { Dropdown } from 'react-native-material-dropdown';
import Moment from 'moment';
import Utility from '../components/Utility';
import { VALIDATION_ERR, VALIDATION_EMAIL_ERR, INTERNET_CONN_ERR } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { GET_HOSPITAL_URL, GET_MYLOCATION_APPOINTMENT, GET_APPOINTMENT_TYPES, SAVE_UN_PWD_HEAL } from '../constants/APIUrl';
import aPIStatusInfo from '../components/ErrorHandler';
import { Input } from 'react-native-elements';
let CONNECTION_STATUS = false;
class searchDoctors extends Component {
    constructor(props) {
        super(props);
        const a = new Date();
        this.state = {
            isLoading: true, datatoken: '', HospitalData: [], HospSelectedItems: '', HosLocationData: '',
            page: 1, physicianID: '', userid: '', departmentData: [], physicianAvailData: { morning: [], noon: [], evening: [] },
            physicianData: [], physicianOriginalData: [], DepartSelectedItems: '', qualification: '', experience: '', PhysicianName: '', visitPurpose: '', visitPurposeItems: [], modalVisible: false, AppointmentDateTime: ''
            , selectedDate: `${a.getDate()}/${a.getMonth() + 1}/${a.getFullYear()}`
            , username: '', pwd: '', targetHosName: '', showLoginPopup: false, checked: true, isLoggingIn: false, userid: '', HOSP_USER_DATA: '',
            heightAnim: new Animated.Value((Dimensions.get('window').height)),
            searchDrTxt: '', isHospitalDataLoading: false, healId: '', visitPurposeItemsLoading: false, DepartmentItemsLoading: false, ServiceURL: '', HospName: '', ACCESS_TOKEN: '', physicianDataLoading: false, VisitNotes: ''
        };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);

        console.log("USER_DATA12", USER_DATA);
        this.mounted = true;
        if (this.mounted) {
            let HOSP_USER_DATA = '';
            if (USER_DATA.hasOwnProperty('Hospital')) {
                HOSP_USER_DATA = USER_DATA.Hospital;
            }
            this.setState({
                datatoken: USER_DATA.ACCESS_TOKEN,
                HOSP_USER_DATA: HOSP_USER_DATA,
                userid: USER_DATA.User_Id,
            }, function () {
                this.hospitalData();
                // this.visitPurposeData();
                const a = new Date();
                const b = `${a.getDate()}/${a.getMonth() + 1}/${a.getFullYear()}`;
                this.setState({ selectedDate: b });
                setTimeout(() => {
                    this.setState({ isLoading: false });
                }, 10);
            });
        }
    }
    async componentWillUnmount() {
        this.mounted = false;
    }
    hospitalLogin = async (targetHospital, hospitalLocationID) => {
        let LoggedInHospital = await AsyncStorage.getItem('USER_DATA');
        LoggedInHospital = Utility.IsNullOrEmpty(LoggedInHospital) ? '' : JSON.parse(LoggedInHospital);

        console.log("hospitalLogin", LoggedInHospital);
        if (!(LoggedInHospital.hasOwnProperty('Hospital') && LoggedInHospital.Hospital.PracticeId == hospitalLocationID)) {
            this.setState({
                showLoginPopup: true,
                targetHosName: targetHospital
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
                //if (Utility.IsNullOrEmpty(LoggedInHospital.HealId)) {
                this.saveToHealConfirm(LoggedInHospital.HealId, LoggedInHospital.Hospital.PracticeId, LoggedInHospital.User_Id, LoggedInHospital.Hospital.Id);
            }
            this.physicianData();
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
        this.setState({ isLoggingIn: true });
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
        // else if (REG.test(username.trim()) === false) {
        // ToastAndroid.showWithGravity(
        // VALIDATION_EMAIL_ERR,
        // ToastAndroid.SHORT,
        // ToastAndroid.CENTER,
        // );
        // this.setState({ isLoggingIn: false }); return;
        // }
        const LoginData = `grant_type=password&username=${username.trim()}&password=${password}&scope=patient`;
        console.log("LoginData", LoginData);
        await fetch(`${this.state.ServiceURL}/Token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: LoginData
        }).then(aPIStatusInfo.handleResponse)
            .then((resp) => resp.json()).then(async (res) => {
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
                        HospName: this.state.HospName,
                        HealId: USER_DATA.HealId,
                        LastLogin_Date: res.LastLoginDate,

                        IsHealId: res.IsHealId,
                        ServiceURL: this.state.ServiceURL,
                        AppointmentLogin: true,

                        LastLogin_Date: res.LastLoginDate
                    };
                }
                console.log()
                if (res.hasOwnProperty('error')) {
                    ToastAndroid.showWithGravity(
                        res.error_description,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                    this.setState({ isLoading: false, isLoggingIn: false, ACCESS_TOKEN: HOSPITAL_DATA.Hospital.ACCESS_TOKEN });
                } else {
                    this.setState({ showLoginPopup: false, isLoggingIn: false, HOSP_USER_DATA: HOSPITAL_DATA.Hospital }, function () {

                        AsyncStorage.setItem('USER_DATA', JSON.stringify(HOSPITAL_DATA)).then(() => {

                            //if (isfirstTimecheck == undefined) {
                            if (res.IsHealId == "False") {
                                this.saveToHealConfirm(HOSPITAL_DATA.HealId, HOSPITAL_DATA.Hospital.PracticeId, HOSPITAL_DATA.User_Id, HOSPITAL_DATA.Hospital.Id);
                            }
                            ToastAndroid.show('You have LoggedIn Successfully!', ToastAndroid.SHORT);
                            console.log("@#!4213");
                            this.physicianData();
                        });
                    }); this.removeDialog();
                }
            }).catch(err => {
                console.log('errlog', err);
                this.setState({
                    isLoggingIn: false,
                });
                this.hospitalLogin(this.state.targetHosName, this.state.HospSelectedItems);
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }

    async openAndroidDatePicker() {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: new Date()
                // date: new Date(slottedDate)
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                this.setState({ selectedDate: `${day}/${month + 1}/${year}` }, function () {
                    this.physicianAvailableData();
                });
            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }
    showConfirmModal(AppointmentTime) {
        this.setState({ modalVisible: true, AppointmentDateTime: AppointmentTime });
        console.log('AppointmentDateTime', this.state.AppointmentDateTime);
    }
    closeModal() {
        this.setState({ modalVisible: false });
    }
    changeHospitalStatus = (val, index, data) => {
        console.log("hosval", val)
        this.setState({
            HospSelectedItems: val,
            DepartSelectedItems: '',
            ServiceURL: data[index].ServiceURL,
            HospName: data[index].label,
            //AppointmentURL: data[index].AppointmentURL
        }, function () {
            this.checkFirstTimeLogin();
            //.hospitalLogin(data[index].label, val);
        });

    }

    // loadDoctors= (val, index, data) => {
    //     console.log("hosval", val)
    //     this.setState({
    //         HospSelectedItems: val,
    //         DepartSelectedItems: '',
    //         ServiceURL: data[index].ServiceURL,
    //         HospName: data[index].label,
    //         //AppointmentURL: data[index].AppointmentURL
    //     }, function () {
    //         this.checkFirstTimeLogin();
    //         //.hospitalLogin(data[index].label, val);
    //     });

    // }

    async checkFirstTimeLogin() {
        fetch(`${GET_HOSPITAL_URL}?practiceId=${this.state.HospSelectedItems}&patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then((response) => response.json()).then(async (res) => {
            console.log('res', res);
            if (res.statusCode == 200) {
                let response = res.responseData;
                if (!Utility.IsNullOrEmpty(response.userName) && !Utility.IsNullOrEmpty(response.password)) {
                    this.setState({ username: response.userName, password: response.password, ServiceURL: response.serviceURL }, function () {
                        this.loginToHospital(true);

                    })
                }
                else {
                    this.hospitalLogin(this.state.HospName, this.state.HospSelectedItems);
                }
            }
        })
            .catch(err => {
                const errMSg = '';
                this.hospitalLogin(this.state.HospName, this.state.HospSelectedItems);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? "Failed to save Heal data" : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    changeVisitStatus = (val) => {
        this.setState({
            visitPurpose: val
        }, function () {
            this.hospitalData();
        });
    }
    getDepartmentText = (id) => {
        console.log('id', id);
        const departName = this.state.departmentData.filter((Items) => Items.value == id);
        if (departName.length > 0) {
            return departName[0].label;
        }
    }
    /**************************************************Get Hospital Name By Id ********************************************/
    getHospitalNameById = (id) => {
        const HospitalName = this.state.HospitalData.filter((Items) => Items.value == id);
        if (HospitalName.length > 0) {
            return HospitalName[0].label;
        }
    }
    /*****************************************Physician Name By Id ***********************************************/
    getPhysicianNameById = (id) => {
        const departName = this.state.physicianData.filter((Items) => Items.id == id);
        if (departName.length > 0) {
            return departName[0].name;
        }
    }
    changeDepartmentStatus = (value) => {
        console.log('depart', value);
        this.setState({
            DepartSelectedItems: value
        }, function () {
            this.physicianData();
        });
    }
    filterdoctor = (searchTxt) => {

        let filteredPhysician = this.state.physicianOriginalData.filter((Items) => Items.name.toUpperCase().indexOf(searchTxt.trim().toUpperCase()) > -1);// this.state.physicianOriginalData.filter(function(item){
        // return item.name==searchTxt
        //});
        if (Utility.IsNullOrEmpty(filteredPhysician))
            this.setState({ physicianData: this.state.physicianOriginalData })
        else this.setState({ physicianData: filteredPhysician })

    }
    /********************************Hospital Data API Call *******************************************************/
    hospitalData = async () => {
        this.setState({ isHospitalDataLoading: true })

        await fetch(`${GET_MYLOCATION_APPOINTMENT}?patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.datatoken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json())
            .then(async (responseJson) => {
                console.log("hospitalData", responseJson);
                let drop_down_data = [];
                // console.log(" HospitalData1")
                for (let i = 0; i < responseJson.responseData.length; i++) {
                    drop_down_data.push({ label: responseJson.responseData[i].name, index: i, value: responseJson.responseData[i].locationId, ServiceURL: responseJson.responseData[i].serviceUrl });
                }
                console.log(" HospitalData", responseJson.responseData);
                var hospSelectedItems = '';
                console.log("this.state.HOSP_USER_DATAw", this.state.HOSP_USER_DATA)
                if (!Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA)) {
                    let practiceId = this.state.HOSP_USER_DATA.PracticeId;
                    var hospitalSelected = drop_down_data.filter(function (hospData) {
                        return hospData.value = practiceId;
                    });

                    console.log("hospitalSelected", hospitalSelected)
                    if (!Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) && hospitalSelected.length > 0) {
                        hospSelectedItems = hospitalSelected[0].value;
                        this.changeHospitalStatus(hospSelectedItems, hospitalSelected[0].index, drop_down_data);
                    }
                }
                this.setState({
                    HospitalData: drop_down_data,
                    isLoading: false,
                    departmentData: [],
                    isHospitalDataLoading: false
                });
                if (this.state.HospitalData.length == 0) {
                    ToastAndroid.showWithGravity(
                        'Hospital Not Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({ isLoading: false });
                    return;
                } else {
                    console.log('this is hospital data', this.state.HospitalData);
                    // this.changeHospitalStatus()
                }
            })
            .catch((error) => {
                this.setState({ isLoading: false, isHospitalDataLoading: false });
                console.error(error);
            });
    }
    /************************************Department API Call **************************************************/
    departmentData = () => {
        this.setState({
            DepartmentItemsLoading: true
        });
        console.log(`${this.state.HOSP_USER_DATA.ServiceURL}api/PracticeService/Specialities?practiceLocationId=${this.state.HospSelectedItems}`)
        // fetch(`https://signaturesmilestest.patientheal.com/signaturesmileservices/api/PracticeService/Specialities?practiceLocationId=${this.state.HospSelectedItems}`, {
        fetch(`${this.state.HOSP_USER_DATA.ServiceURL}api/PracticeService/Specialities?practiceLocationId=${this.state.HospSelectedItems}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.HOSP_USER_DATA.ACCESS_TOKEN}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                const drop_down_data = [];
                for (let i = 0; i < responseJson.responseData.length; i++) {
                    drop_down_data.push({ label: responseJson.responseData[i].name, value: responseJson.responseData[i].id });
                }
                this.setState({
                    departmentData: drop_down_data,
                    isLoading: false, DepartmentItemsLoading: false
                });
                if (this.state.departmentData.length == 0) {
                    ToastAndroid.showWithGravity(
                        'Department Not Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({ isLoading: false });
                    return;
                }
            })
            .catch((error) => {
                this.setState({ isLoading: false, DepartmentItemsLoading: false });
                console.error(error);
            });
    }
    visitPurposeData = () => {
        this.setState({ visitPurposeItemsLoading: true });
        fetch(GET_APPOINTMENT_TYPES, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.datatoken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                let reponse = responseJson.responseData;
                let visitPurpose = [];
                for (let i = 0; i < reponse.length; i++) {
                    visitPurpose.push({ label: reponse[i].appointmentTypeName, value: reponse[i].appointmentTypeId })
                }
                this.setState({ isLoading: false, refreshing: false, visitPurposeItems: visitPurpose, visitPurposeItemsLoading: false });
            })
            .catch(() => {
                this.setState({ isLoading: false, visitPurposeItemsLoading: false });
                return false;
            });
    }
    /**********************************Get Physician Data API Cal *********************************************/
    physicianData = () => {
        this.setState({ physicianDataLoading: true });
        fetch(`${this.state.HOSP_USER_DATA.ServiceURL}api/PhysicianService/Physicians?practiceLocationId=${this.state.HospSelectedItems}&SpecialityId=0`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.HOSP_USER_DATA.ACCESS_TOKEN}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.responseData.length == 0) {
                    ToastAndroid.showWithGravity(
                        'No Data Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({ isLoading: false, refreshing: false, physicianOriginalData: responseJson.responseData, physicianData: responseJson.responseData, physicianDataLoading: false });
                    return;
                }
                this.setState({
                    physicianData: responseJson.responseData,
                    physicianOriginalData: responseJson.responseData,
                    isLoading: false,
                    physicianDataLoading: false
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false, physicianDataLoading: false });
            });
    }
    changeRelationShipStatus = (value) => {
        this.setState({
            RelationShipSelectedItems: value
        });
    }

    /******************************* Get Physician Time Slot ***********************************************************/
    physicianAvailableData = (physicianObj) => {
        let obj = {};
        if (Utility.IsNullOrEmpty(physicianObj)) {

            obj.id = this.state.physicianID;
            obj.qualification = this.state.qualification;
            obj.experience = this.state.experience;
        }
        else {
            obj = physicianObj;
        }
        console.log("physicianobj", obj);
        fetch(`${this.state.HOSP_USER_DATA.ServiceURL}api/AppointmentService/GetPhysiciansTimeSlot?practiceLocationId=${this.state.HospSelectedItems}&physicianId=${obj.id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.HOSP_USER_DATA.ACCESS_TOKEN}`,
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

                    this.setState({ isLoading: false, refreshing: false, physicianAvailData: { morning: [], noon: [], evening: [] } });
                    return;
                }
                let selectedDate = this.state.selectedDate;
                let selectedDateData = responseJson.responseData.filter(function (item) {
                    console.log("selectedDate", selectedDate);
                    return Moment(new Date(item.date)).format("D/M/YYYY") == selectedDate;
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
                    isLoading: false,
                    physicianID: obj.id,
                    qualification: obj.qualification,
                    experience: obj.experience
                }, () => {
                });
            })
            .catch((error) => {
                console.error(error);
                this.setState({ isLoading: false });
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
        fetch(SAVE_UN_PWD_HEAL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
            body: JSON.stringify(healData)
        }).then((response) => response.json()).then((res) => {
            console.log('res', res);
            if (res.statusCode == 200) {
                this.saveHealIdToClient(healId, accountID);
            }
            else if (res.statusCode == 400) {
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
    /***************************************************Add Appointment ***********************************************************************/
    saveAppointment = () => {
        let selectedDate = this.state.selectedDate.split('/');
        if (selectedDate.length > 0) {
            selectedDate = selectedDate[1] + '/' + selectedDate[0] + '/' + selectedDate[2]
        }

        const AppointmentData = {


            AppointmentDate: this.state.selectedDate,
            AppointmentTime: Moment(this.state.AppointmentDateTime).format("HH:MM"),
            AppointmentType: 'Sick Visit',
            PatientId: this.state.HOSP_USER_DATA.User_Id,
            PhysicianId: this.state.physicianID,
            PracticeId: this.state.HospSelectedItems,
            PreferredDate1: selectedDate + ' ' + Moment(this.state.AppointmentDateTime).format("hh:mm A"),
            ProblemId: '00000000-0000-0000-0000-000000000000',
            Reason: 'Sick Visit',
            ReminderSet: false,
            SelectedDateTime: Moment(new Date()).format("DD/MM/YYYY"),
            SpecialityId: this.state.DepartSelectedItems,
            Status: 0
        };
        console.log(AppointmentData);
        fetch(`${this.state.HOSP_USER_DATA.ServiceURL}api/AppointmentService/AppointmentCreate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.HOSP_USER_DATA.ACCESS_TOKEN}`,
            },
            body: JSON.stringify(AppointmentData)
        }).then((response) => response.json()).then((res) => {
            console.log('afdsfres', res);
            if (res.statusCode == 200) {
                ToastAndroid.show('Appointment Booked Successfully', ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                    page: 4,
                }, function () {
                    this.props.navigation.navigate('Appointment');
                });
            }
        })
            .catch(err => {
                console.log('errlog', err);
                this.setState({
                    isLoggingIn: false,
                });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading ...</Text>
                </View>
            );
        }
        return (  
            // <CommonView customHeading={this.state.page === 1 ? 'Appointments' : 'Antony John'}>
            <CommonView SearchDoctorsBook>
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7 }}>
                    {this.state.page === 1 ?
                        <ScrollView>
                            <View style={{ flex: 1, paddingTop: 14 }}>
                                <View style={{ paddingLeft: 15, paddingRight: 15 }}>
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
                                        containerStyle={{ marginBottom: 8, marginTop: 8 }}
                                        onChangeText={(val, index) => this.changeHospitalStatus(val, index, this.state.HospitalData)}
                                    // disabled={Utility.IsNullOrEmpty(this.state.visitPurpose) ? true : false}
                                    />
                                    {this.state.isHospitalDataLoading ? <ActivityIndicator style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end", paddingRight: 5, marginRight: 20, marginTop: -40 }} /> : undefined}

                                    {Utility.IsNullOrEmpty(this.state.HospSelectedItems) ? <View style={{ flex: 1, paddingTop: 14, flexDirection: "column" }}>
                                        <Image source={require('../assets/icons/doctors.png')} style={{ width: '100%', height: 400 }} /></View> : undefined}

                                    {!Utility.IsNullOrEmpty(this.state.HospSelectedItems) ?
                                        <TextInput
                                            style={styles.inputField2}
                                            placeholder={'Search'}
                                            placeholderTextColor={'gray'}
                                            // value={this.state.searchDrTxt}
                                            // secureTextEntry={false}
                                            maxLength={50}
                                            fontSize={17}
                                            onChangeText={(searchDrTxt) => this.filterdoctor(searchDrTxt)}
                                        /> : null
                                    }
                                    {/* <Dropdown
                                        baseColor="#000"
                                        label='Department'
                                        data={this.state.departmentData}
                                        textColor='#746E6E'
                                        labelHeight={6}
                                        value={this.state.DepartSelectedItems}
                                        labelFontSize={17}
                                        fontSize={16}
                                        selectedItemColor='#41b4af'
                                        containerStyle={{ marginBottom: 8, marginTop: 8 }}
                                        onChangeText={(val) => this.changeDepartmentStatus(val)}
                                        disabled={Utility.IsNullOrEmpty(this.state.HospSelectedItems) ? true : false}
                                    /> */}
                                    {/* {this.state.DepartmentItemsLoading ? <ActivityIndicator style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end", paddingRight: 5, marginRight: 20, marginTop: -40 }} /> : undefined} */}
                                </View>
                                {this.state.physicianDataLoading ? <ActivityIndicator style={{ padding: 50 }} /> : undefined}
                                {/* { this.state.physicianData.length > 0 ?
                                    <View style={{ backgroundColor: '#F3F6FB', padding: 15, borderBottomColor: '#9C9C9E', borderBottomWidth: 0.3, borderTopColor: '#9C9C9E', borderTopWidth: 0.3 }}>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'center', color: '#6F797A', fontSize: 20 }}>{this.getDepartmentText(this.state.DepartSelectedItems)}</Text>
                                    </View> : <ImageBackground source={require('../assets/images/doctor.png')}  style={styles.backgroundImage}></ImageBackground>} */}
                                {this.state.physicianData.map(data => (
                                    <View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomColor: '#9C9C9E', borderBottomWidth: 0.3 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ width: 50, height: 50, borderRadius: 50, borderColor: '#9C9C9E', borderWidth: 0.3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={{ uri: Utility.IsNullOrEmpty(data.photoContent) ? '../assets/images/doctorAppointments.jpg' : `data:image/jpg;base64,${data.photoContent}` }} style={{ width: 50, height: 50, borderRadius: 50, resizeMode: 'cover' }} />
                                                </View>
                                                <View>
                                                    <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                                                        <Text style={{ color: '#494A4C', fontSize: 17, fontWeight: 'bold', marginBottom: 5 }}>{data.name}</Text>
                                                        <Text style={{ color: '#494A4C', fontSize: 13, fontWeight: '300', marginBottom: 5, textAlign: 'center', justifyContent: 'center' }}>{data.qualification}</Text>
                                                        <Text style={{ color: '#494A4C', fontSize: 11, fontWeight: '500', marginBottom: 5, textAlign: 'center', justifyContent: 'center' }}>{data.experience} </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View>
                                                <TouchableOpacity style={styles.consultButton} onPress={() => { this.setState({ page: 2 }, function () { this.physicianAvailableData(data); }); }}>
                                                    <Text style={styles.consultButtonText}>Consult</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                        :
                        null
                    }
                    {
                        this.state.page === 2 ?
                            <ScrollView>
                                <View style={{ flex: 1 }}>
                                    <View style={{ padding: 15 }}>
                                        <View style={{ padding: 15, backgroundColor: '#F3F6FB', borderColor: '#736F6E', borderWidth: 0.1, flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ color: '#736F6E', textAlign: 'center' }}>{this.state.selectedDate}</Text>
                                            <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={() => { this.openAndroidDatePicker(this.state.AppointmentDateTime); }}>
                                                <FontAwesome name="calendar" size={16} color="#736F6E" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {this.state.physicianAvailData.morning.length > 0 ? <View style={{ padding: 15 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                            <Feather name="sun" size={20} color="#736F6E" />
                                            <Text style={{ fontWeight: '300' }}>&nbsp;Morning</Text>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {this.state.physicianAvailData.morning.map(data => (
                                                data.isAllocated == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                                </TouchableOpacity> : <TouchableOpacity onPress={() => { this.showConfirmModal(data.availableTime); }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
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
                                                data.isAllocated == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                                </TouchableOpacity> : <TouchableOpacity onPress={() => { this.showConfirmModal(data.availableTime); }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
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
                                                data.isAllocated == true ? <TouchableOpacity style={{ width: 75, height: 75, backgroundColor: '#F660AB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{Moment(data.availableTime).format('hh:mm A').replace(' ', '\n')}</Text>
                                                </TouchableOpacity> : <TouchableOpacity onPress={() => { this.showConfirmModal(data.availableTime); }} style={{ width: 75, height: 75, backgroundColor: '#F3F6FB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
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
                                    <Modal
                                        animationType="slide"
                                        transparent
                                        visible={this.state.modalVisible}
                                        onRequestClose={() => { }}
                                    >
                                        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: Dimensions.get('window').height, justifyContent: 'flex-end' }}>
                                            <View style={{ backgroundColor: '#ffffff', padding: 15 }}>
                                                <Text style={{ color: '#3AA6CD', fontWeight: 'bold', fontSize: 20 }}>{this.getPhysicianNameById(this.state.physicianID)}</Text>
                                                <Text style={{ color: '#3AA6CD', fontSize: 16 }}>{this.state.qualification}</Text>
                                                <Text style={{ color: '#3AA6CD', fontSize: 14 }}>{this.state.experience} </Text>
                                                <TouchableOpacity onPress={() => { this.closeModal(); }} style={{ position: 'absolute', top: 10, right: 10 }}>
                                                    <AntDesign name="closecircleo" size={14} color="#3AA6CD" />
                                                </TouchableOpacity>
                                                <View style={{ borderTopColor: '#9C9C9E', borderTopWidth: 0.1, padding: 15, alignItems: 'center', justifyContent: 'center' }}>
                                                    <TouchableOpacity style={styles.consultButton} onPress={() => { this.saveAppointment(); }}>
                                                        <Text style={styles.consultButtonText}>Confirm Consultation</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>
                            </ScrollView>
                            :
                            null
                    }
                    {
                        this.state.page === 3 ?
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ padding: 15 }}>
                                    <View style={{ padding: 15, backgroundColor: '#F3F6FB', borderColor: '#9C9C9E', borderWidth: 0.2 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#38A6CB', textAlign: 'center', marginBottom: 20, fontSize: 22 }}>Booking Successful</Text>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 20 }}>{this.getPhysicianNameById(this.state.physicianID)}</Text>
                                        <Text style={{ fontSize: 16 }}>{this.getHospitalNameById(this.state.HospSelectedItems)}</Text>
                                        {/* <Text style={{ fontSize: 16 }}>Token No : 10</Text> */}
                                        <Text style={{ fontSize: 16 }}>{Moment(new Date(this.state.AppointmentDateTime)).format("DD-MMM-YYYY")}</Text>
                                    </View>
                                </View>
                            </View>
                            :
                            null
                    }
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
                                                <View style={{ height: 60, borderRadius: 400, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                    {/* <Image source={require('../assets/images/hospital-logo.png')} style={styles.hospitalImage1} /> */}
                                                    <Text numberOfLines={3} style={styles.HosName}>{this.state.targetHosName}</Text>
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
                                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.loginToHospital()}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {this.state.isLoggingIn ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                                    <Text style={{ color: '#3AA6CD', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }} >LOGIN</Text>
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
                </View>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
    consultButton: {
        backgroundColor: '#3AA6CD',
        padding: 10,
        borderRadius: 5,
    },
    consultButtonText: {
        fontWeight: 'bold',
        color: '#ffffff',
        fontSize: 19
    },
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
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
    },
    cusButtonLargeGreen1: {
        backgroundColor: '#fff',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        // position: 'absolute',
        // top: 40,
        flexDirection: 'row'
    },
    inputField2: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        fontSize: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#8d9393',
        padding: 10
    }
});
export default searchDoctors;