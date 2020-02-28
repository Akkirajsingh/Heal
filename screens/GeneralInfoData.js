import React, { Component } from 'react';
import { Image, ScrollView, ActivityIndicator, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Dimensions, TextInput, ToastAndroid, NetInfo, Platform, AlertIOS, Modal } from 'react-native';
import { Dropdown } from "react-native-material-dropdown";
import CommonView from "../components/CommonView";
import { UPDATE_GENERAL_ERROR_MSG, UPDATE_GENERAL_SUCCESS_MSG, PROFILE_LOAD_GENERAL_ERROR_MSG, DATA_NOT_AVAILABLE } from "../constants/Messages";
import Moment from 'moment';
import { ImagePicker, Permissions } from 'expo';
import Constants from 'expo-constants'
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from "../components/ErrorHandler";
import { GENERAL_PATIENT_INFO, GENERAL_PATIENT_INFO_UPDATE, GET_STATE_DATA, HOSP_GENERAL_PATIENT_INFO, HOSP_GENERAL_PATIENT_INFO_UPDATE, HOSPGET_STATE_DATA, UPDATE_PIN_API, BASE_URL } from '../constants/APIUrl';
import Utility from '../components/Utility';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
let CONNECTION_STATUS = false;
let MOB_VALIDATE_URL = BASE_URL;
let MOB_Change_UserName_URL = BASE_URL;
let GENERAL_PATIENT_INFO_URL = '';
let GENERAL_PATIENT_INFO_UPDATE_URL = '';
let GET_STATE_DATA_URL = '';
let data = [{ label: 'Select', value: "0" }, { label: 'Separated', value: "2" }, { label: 'Divorced', value: "3" }, { label: 'Single', value: "1" }, { label: 'Married', value: "4" }];
let data1 = [{ value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'AB-', label: 'AB-' }, { value: 'B-', label: 'B-' }, { value: 'O-', label: 'O-' }, { value: 'B+', label: 'B+' }, { value: 'O+', label: 'O+' }, { value: 'AB+', label: 'AB+' }];
let heightdrop = [{ value: "1", label: 'ft' }, { value: "2", label: 'cm' }];
let weightdrop = [{ value: "1", label: 'kg' }, { value: "2", label: 'lb' }];
let tempdrop = [{ value: "1", label: 'Celsius' }, { value: "2", label: 'Fahrenheit' }];
class GeneralInfoData extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        var today = new Date();
        this.state = {
            accountId: '',
            heightUnits: '', access_token: '', general_info: '', isSending: false, clickableImage: true, image: '', bloodGroup: '', temperature: '', bloodPressure: '', showSetPIN: false,
            presentAddr: '', pulseRate: '', permanentAddr: '', city: '', States: '', zipCode: '', emailId: '', tempUnit: '1', weightUnit: "1", heightUnit: '1', bloodPressureUnit: ' mmHg', PulseRateUnit: ' bpm',
            uploading: false, datatoken: '', contact_no: '', email_id: '', stateItem: [], StateData: '', gender: '', height: '', weight: '', lastUpdated: '', isLoading: true, refreshing: false, dateOfBirth: today, maritalStatus: '', pickerResult: null, isFilledT: false, isFilledPR: false, isFilledBP: false, isFilledW: false, isFilledH: false
        }
    };
    /*******************************Blood Group ********************************************************************/
    changeBloodGroup = (val, index, data) => {
        this.setState({ bloodGroup: val, })
    }
    changeHeightUnits = (val) => {
        this.setState({ heightUnit: val })
    }
    changeWeightUnits = (val) => {
        this.setState({ weightUnit: val })
    }
    changeTempUnits = (val) => {
        this.setState({ tempUnit: val })
    }
    /******************************************** MARITIAL STATUS ***************************************************************** */
    changeMaritialStatus = (value, index, data, code) => {
        this.setState({ maritalStatus: data[index].value })
    }
    /***********************************************OnChange Event for state ************************************************* */
    changeStateStatus = (val) => {
        this.setState({
            StateData: val
        });
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); this.setState({ isLoading: false }); return;
        }
        let { params } = this.props.navigation.state;
        GENERAL_PATIENT_INFO_URL = GENERAL_PATIENT_INFO;
        GENERAL_PATIENT_INFO_UPDATE_URL = GENERAL_PATIENT_INFO_UPDATE;
        GET_STATE_DATA_URL = GET_STATE_DATA;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');

        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let accountId = USER_DATA.Id;
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            GENERAL_PATIENT_INFO_URL = USER_DATA.ServiceURL + HOSP_GENERAL_PATIENT_INFO;
            GENERAL_PATIENT_INFO_UPDATE_URL = USER_DATA.ServiceURL + HOSP_GENERAL_PATIENT_INFO_UPDATE;
            GET_STATE_DATA_URL = USER_DATA.ServiceURL + HOSPGET_STATE_DATA;
            MOB_VALIDATE_URL = `${USER_DATA.ServiceURL}api/`;
            MOB_Change_UserName_URL = `${USER_DATA.ServiceURL}api/`;
            accountId = USER_DATA.Hospital.Id;
        }
        this.setState({
            datatoken: USER_DATA.ACCESS_TOKEN,
            userid: USER_DATA.User_Id,
            email_id: USER_DATA.userName,
            accountId: accountId
        });
        console.log("rakj", accountId);
        this.GeneralInfoData();
        this.getPermissionAsync();
        this.statesData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /******************************************State API Call ***************************************************/
    statesData = () => {
        fetch(GET_STATE_DATA_URL, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                const statedropDown_data = [];
                for (let i = 0; i < responseJson.responseData.length; i++) {
                    statedropDown_data.push({ label: responseJson.responseData[i]._state, value: responseJson.responseData[i]._Id });
                }
                this.setState({
                    stateItem: statedropDown_data,
                    isLoading: false,
                }, () => {
                    // if(this.state.dataSource.map(function(value, index, arr){
                    //     return value;
                    // })
                    // In this block you can do something with new state.
                });
            })
            .catch((err) => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /****************************************getStateName By Id ****************************************************************************************/
    getStateNameById = (id) => {
        let statevalue = this.state.stateItem.filter((Items) => Items.value == id)
        if (statevalue.length > 0) {
            return statevalue[0].label;
        }
    }
    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }
    checkempty(value) {
        if (value == null ||
            value == undefined ||
            value.length == 0) {
            return true;
        } else {
            return false;
        }
    }
    checkEmptyField(value) {
        if (value == null ||
            value == undefined ||
            value.length == 0) {
            return 0;
        } else {
            return 1;
        }
    }
    ValidateUserName = () => {
        // if(Utility.IsNullOrEmpty(this.state.UserName) ||(this.state.UserName.length<3)){this.setState({isValidUser:false})  return;}
        console.log(`${MOB_VALIDATE_URL}PatientSignUp/IsUserNameExist?UserName=${this.state.general_info}`)
        fetch(`${MOB_VALIDATE_URL}PatientSignUp/IsUserNameExist?UserName=${this.state.general_info}`, {

            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json()).then((responseJson) => {
            let response = responseJson.responseData;
            console.log("response", response);
            if (response == 0) {
                this.ChangeUserName();
            } else {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        "User Name Already exist",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert("User Name Already exist");
                }
                this.setState({ isValidUser: false })
            }

        }).catch((error) => {
            console.log('User name error is ', error);
            this.setState({ isLoading: false, isValidUser: false });
        });
    }
    async ChangeUserName() {
        // if(Utility.IsNullOrEmpty(this.state.UserName) ||(this.state.UserName.length<3)){this.setState({isValidUser:false})  return;}
        //  https://care.patientheal.com/PatientCareServices/api/PatientSignUp/ChangeUserName?id=e71d51a5-0346-4319-b685-4a9b2c41c7e8&UserName=Akki
        console.log(`${MOB_Change_UserName_URL}PatientSignUp/ChangeUserName
        ?id=${this.state.accountId}&UserName=${this.state.general_info}`)
        fetch(`${MOB_Change_UserName_URL}PatientSignUp/ChangeUserName?id=${this.state.accountId}&UserName=${this.state.general_info}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json()).then((responseJson) => {
            let response = responseJson;
            console.log("response", response);
            if (response.statusCode == 200 && response.succeeded == true) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        "User Name Updated Successfully",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    let USER_DATA = AsyncStorage.getItem('USER_DATA');
                    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);


                    if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                        USER_DATA.Hospital.fullName = this.state.general_info;
                        AsyncStorage.setItem('USER_DATA', JSON.stringify(USER_DATA))
                    }
                    else {
                        let DASHBOARD_DATA = AsyncStorage.getItem('DASHBOARD_DATA');
                        DASHBOARD_DATA = Utility.IsNullOrEmpty(DASHBOARD_DATA) ? '' : JSON.parse(DASHBOARD_DATA);
                        DASHBOARD_DATA.firstName = this.state.general_info;
                        AsyncStorage.setItem('DASHBOARD_DATA', JSON.stringify(DASHBOARD_DATA))
                    }
                } else {
                    AlertIOS.alert("User Name Updated Successfully");
                }
            } else {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        "Failed to update User Name",
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert("Failed to update User Name");
                }
                this.setState({ isValidUser: false })
            }

        }).catch((error) => {
            console.log('User name update error is ', error);
            this.setState({ isLoading: false });
        });
    }
    checkLength(type, val) {
        if (val != undefined && val != null) {
            val = val.toString();
            if (type == 'phone') {
                if (val.length >= 4 && val.length <= 15 && val.indexOf('+') > -1) {
                    return 1;
                }
                else if (val.length == 10) { return 1; }
                else {
                    // if (Platform.OS !== 'ios') {
                    //     ToastAndroid.showWithGravity(
                    //         'Contact Number is not valid',
                    //         ToastAndroid.SHORT,
                    //         ToastAndroid.CENTER,
                    //     );
                    // } else {
                    //     AlertIOS.alert('Contact Number is not valid');
                    // }
                    return 0;
                }
            } else if (type == 'email_id') {

                if (val.length >= 6 && val.indexOf('@') > -1 && val.indexOf('.') > -1) {

                    const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    if (REG.test(val) != false) {
                        return 1;
                    }
                    else return 0;
                }
                else if (val.length >= 3) { return 1; }

                else {
                    // if (Platform.OS !== 'ios') {
                    //     ToastAndroid.showWithGravity(
                    //         'Email is not valid',
                    //         ToastAndroid.SHORT,
                    //         ToastAndroid.CENTER,
                    //     );
                    // } else {
                    //     AlertIOS.alert('Email is not valid');
                    // }
                    return 0;
                }
            } else if (type == 'otherEmail') {
                if (val.length >= 1) {
                    const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                    if (REG.test(val) != false) {
                        return 1;
                    } else {
                        // if (Platform.OS !== 'ios') {
                        //     ToastAndroid.showWithGravity(
                        //         'Alternate Email is not valid',
                        //         ToastAndroid.SHORT,
                        //         ToastAndroid.CENTER,
                        //     );
                        // } else {
                        //     AlertIOS.alert('Alternate Email is not valid');
                        // }
                        return 0;
                    }
                } else {
                    return 1;
                }
            } else if (type == 'address') {
                if (val.length >= 1) {
                    if (val.length >= 10 && val.length <= 100) {
                        return 1;
                    } else {
                        // if (Platform.OS !== 'ios') {
                        //     ToastAndroid.showWithGravity(
                        //         'Present Address should be between 10 to 100 characters',
                        //         ToastAndroid.SHORT,
                        //         ToastAndroid.CENTER,
                        //     );
                        // } else {
                        //     AlertIOS.alert('Present Address should be between 10 to 100 characters');
                        // }
                        return 0;
                    }
                } else {
                    return 1;
                }
            } else if (type == 'address2') {
                if (val.length >= 1) {
                    if (val.length >= 10 && val.length <= 100) {
                        return 1;
                    } else {
                        // if (Platform.OS !== 'ios') {
                        //     ToastAndroid.showWithGravity(
                        //         'Permanent Address should be between 10 to 100 characters',
                        //         ToastAndroid.SHORT,
                        //         ToastAndroid.CENTER,
                        //     );
                        // } else {
                        //     AlertIOS.alert('Permanent Address should be between 10 to 100 characters');
                        // }
                        return 0;
                    }
                } else {
                    return 1;
                }
            } else if (type == 'city') {
                if (val.length >= 1) {
                    if (val.length >= 3 && val.length <= 100) {
                        return 1;
                    } else {
                        // if (Platform.OS !== 'ios') {
                        //     ToastAndroid.showWithGravity(
                        //         'City Name should be between 3 to 100 characters ',
                        //         ToastAndroid.SHORT,
                        //         ToastAndroid.CENTER,
                        //     );
                        // } else {
                        //     AlertIOS.alert('City Name should be between 3 to 100 characters');
                        // }
                        return 0;
                    }
                } else {
                    return 1;
                }
            }
        }
        return 0;
    }
    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.cancelled) {
            this.setState({ image: result.uri, isLoading: false, });
        }
    };
    GeneralInfoData = () => {
        GeneralArrData = [];
        var Generaldata = "id=" + this.state.userid;
        fetch(GENERAL_PATIENT_INFO_URL, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            "body": Generaldata
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("generalinfo", res);
                if (res.statusCode == 409) {
                    ToastAndroid.showWithGravity(
                        PROFILE_LOAD_GENERAL_ERROR_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                else {
                    if (res.responseData.length > 0) {
                        var Response = res.responseData[0];
                        this.setState({
                            general_info: (Response.firstName == undefined || Response.firstName == null || Response.firstName == '' || Response.firstName == 'null') ? '' : Response.firstName,
                            StateData: (Response.state == undefined || Response.state == null || Response.state == '' || Response.state == 'null') ? '' : Response.state,
                            //  StateData: (Response.state == undefined || Response.state == null || Response.state == '' || Response.state == 'null') ? 'No Data' : getStateNameById(Response.state),
                            contact_no: (Response.phone == undefined || Response.phone == null || Response.phone == '' || Response.phone == 'null') ? '' : Response.phone, height: (Response.height == undefined || Response.height == null || Response.height == '' || Response.height == 'null') ? '' : Response.height,
                            weight: (Response.weight == undefined || Response.weight == null || Response.weight == '' || Response.weight == 'null') ? '' : Response.weight, bloodGroup: (Response.bloodGroup == undefined || Response.bloodGroup == null || Response.bloodGroup == '' || Response.bloodGroup == 'null') ? '' : Response.bloodGroup, tempUnit: Utility.IsNullOrEmpty(Response.temperatureUnit) ? this.state.tempUnit : Response.temperatureUnit, weightUnit: Utility.IsNullOrEmpty(Response.weightunit) ? this.state.weightUnit : Response.weightunit,
                            heightUnit: Utility.IsNullOrEmpty(Response.heightunit) ? this.state.heightUnit : Response.heightunit,
                            image: (Response.photoContent == undefined || Response.photoContent.length == 0) ? '' : Response.photoContent, temperature: (Response.temperature == undefined || Response.temperature.length == 0) ? '' : Response.temperature.toString(), bloodPressure: (Response.bloodPressure == undefined || Response.bloodPressure.length == 0) ? '' : Response.bloodPressure, presentAddr: (Response.address == undefined || Response.address.length == 0) ? '' : Response.address, pulseRate: (Response.pulseRate == undefined || Response.pulseRate.length == 0) ? '' : Response.pulseRate.toString(), PulseRateUnit: Utility.IsNullOrEmpty(Response.pulseRateUnit) ? this.state.PulseRateUnit : Response.pulseRateUnit,
                            permanentAddr: (Response.address2 == undefined || Response.address2.length == 0) ? '' : Response.address2, city: (Response.city == undefined || Response.city.length == 0) ? '' : Response.city, zipCode: (Response.zipCode == undefined || Response.zipCode.length == 0) ? '' : Response.zipCode, maritalStatus: (Response.maritialStatus == undefined || Response.maritialStatus.length == 0) ? '' : Response.maritialStatus, lastUpdated: (Response.lastUpdated == undefined || Response.lastUpdated.length == 0) ? '' : Moment(new Date(Response.lastUpdated)).format('MM/DD/YYYY'), emailId: (Response.otherEmail == undefined || Response.otherEmail.length == 0) ? '' : Response.otherEmail,
                            isLoading: false,
                        });
                    }
                    else {
                        ToastAndroid.showWithGravity(
                            DATA_NOT_AVAILABLE,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    }
                }
            }).catch(err => {
                this.setState({
                    isLoading: false,
                })
                let errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    render() {
        const { goBack } = this.props.navigation;
        let { image } = this.state;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading GeneralInfo Data....</Text>
                </View>
            );
        } else {
            return (
                <CommonView GeneralInfo={true}>
                    <View style={{ flex: 1, }}>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingLeft: 6, paddingRight: 8, backgroundColor: '#fff' }} keyboardShouldPersistTaps='always'>
                            <View style={{ paddingLeft: 6, marginBottom: 10 }}><Text style={{ color: '#746E70', fontSize: 16 }}>Details as on: {this.state.lastUpdated}</Text></View>
                            <View style={{
                                backgroundColor: '#F3F6FB', padding: 4, shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,

                                elevation: 3, justifyContent: 'center', alignItems: 'center'
                            }}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>Patient Info</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
                                <View style={{ alignItems: "center", justifyContent: "center", borderRadius: 100 / 2, backgroundColor: '#f3f6fb', }}>
                                    {this.state.image.length > 0 ?
                                        <View>
                                            <TouchableOpacity activeOpacity={.5} onPress={this._takePhoto}>

                                                <Image source={{ uri: this.state.image ? `data:image/jpg;base64,${this.state.image}` : null }} style={{
                                                    width: 90,
                                                    height: 90,
                                                    borderRadius: 90 / 2
                                                }} />

                                            </TouchableOpacity>
                                            {this._maybeRenderUploadingOverlay()}
                                        </View>
                                        :
                                        <TouchableOpacity activeOpacity={.5} onPress={this._takePhoto}>
                                            <Image source={require('../assets/icons/John.png')} style={{
                                                width: 90,
                                                height: 90
                                            }} />
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Name:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'column' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        secureTextEntry={false}
                                        fontSize={15}
                                        onChangeText={(general_info) => this.setState({ general_info })}
                                        placeholderTextColor="#746E70"
                                        value={this.state.general_info} />
                                    <TouchableOpacity onPress={() => { this.ValidateUserName(); }}>
                                        <Text style={{ color: '##F7F1FF', borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}><MaterialCommunityIcons size={20} name='account-edit' />Update</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Contact Number:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        fontSize={15}
                                        onChangeText={(contact_no) => this.setState({ contact_no })}
                                        value={this.state.contact_no}
                                        minLength={4}
                                        maxLength={15}
                                        keyboardType='phone-pad' />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Marital Status:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={data}
                                        fontSize={15}
                                        labelHeight={7}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        onChangeText={(val, index, data) => this.changeMaritialStatus(val, index, data)}
                                        // value={data.filter(item=> item.code === this.state.maritalStatus )[0].value}
                                        value={this.state.maritalStatus}
                                        containerStyle={{ paddingLeft: 5 }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Email Address:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.emailinputField}
                                        placeholder={this.state.email_id}
                                        editable={false}
                                        numberOfLines={2}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(email_id) => this.setState({ email_id })}
                                        maxLength={50}
                                    // value={this.state.email_id}
                                    ></TextInput>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Alternate Email Address:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        numberOfLines={2}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(emailId) => this.setState({ emailId })}
                                        value={this.state.emailId}
                                    ></TextInput>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Blood Group:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={data1}
                                        labelHeight={7}
                                        fontSize={15}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        onChangeText={(val, index, data) => this.changeBloodGroup(val, index, data)}
                                        value={this.state.bloodGroup}
                                        containerStyle={{ paddingLeft: 5 }} />
                                </View>
                            </View>
                            <View style={{
                                backgroundColor: '#F3F6FB', padding: 4, shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,

                                elevation: 3, justifyContent: 'center', alignItems: 'center'
                            }}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>Vital Info</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Height:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TextInput
                                        style={styles.inputField5}
                                        placeholder={''}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        fontSize={15}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(height) => this.setState({ height })}
                                        value={this.state.height}
                                    />
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={heightdrop}
                                        labelHeight={7}
                                        fontSize={15}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        onChangeText={(val, index, data) => this.changeHeightUnits(val, index, data)}
                                        value={this.state.heightUnit}
                                        containerStyle={{ width: '30%' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Weight:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TextInput
                                        style={styles.inputField5}
                                        placeholder={''}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(weight) => this.setState({ weight })}
                                        value={this.state.weight}
                                    />
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={weightdrop}
                                        labelHeight={7}
                                        fontSize={15}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        onChangeText={(val, index, data) => this.changeWeightUnits(val, index, data)}
                                        value={this.state.weightUnit}
                                        containerStyle={{ width: '30%' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Temperature:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TextInput
                                        style={styles.inputField5}
                                        placeholder={''}
                                        maxLength={3}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(temperature) => this.setState({ temperature })}
                                        value={this.state.temperature}
                                    />
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={tempdrop}
                                        labelHeight={7}
                                        fontSize={15}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        onChangeText={(val, index, data) => this.changeTempUnits(val, index, data)}
                                        value={this.state.tempUnit}
                                        containerStyle={{ width: '60%' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Blood Pressure:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TextInput
                                        style={styles.inputField6}
                                        placeholder={''}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        fontSize={15}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(bloodPressure) => this.setState({ bloodPressure })}
                                        value={this.state.bloodPressure}
                                    />
                                    <Text style={{ color: '#746E70', fontSize: 15, width: '30%', marginTop: 8 }}>{this.state.bloodPressureUnit}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Pulse Rate:</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row' }}>
                                    <TextInput
                                        style={styles.inputField6}
                                        placeholder={''}
                                        keyboardType={'numeric'}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(pulseRate) => this.setState({ pulseRate })}
                                        value={this.state.pulseRate}
                                    />
                                    <Text style={{ color: '#746E70', fontSize: 15, width: '35%', marginTop: 10 }}>{this.state.PulseRateUnit}</Text>
                                </View>
                            </View>
                            <View style={{
                                backgroundColor: '#F3F6FB', padding: 4, justifyContent: 'center', alignItems: 'center', shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,

                                elevation: 3,
                            }}><Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>Contact Info</Text></View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Present Address:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        secureTextEntry={false}
                                        fontSize={15}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(presentAddr) => this.setState({ presentAddr })}
                                        value={this.state.presentAddr}
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Permanent Address:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(permanentAddr) => this.setState({ permanentAddr })}
                                        value={this.state.permanentAddr}
                                    />
                                </View>
                            </View>
                            {/* <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 12 }}>States:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Dropdown
                                        baseColor="#746E70"
                                        label=''
                                        data={this.state.stateItem}
                                        fontSize={12}
                                        labelHeight={7}
                                        textColor='#746E70'
                                        selectedItemColor='#746E70'
                                        value={this.state.StateData}
                                        onChangeText={(val, index, data) => this.changeStateStatus(val, index, data)}
                                        containerStyle={{ paddingLeft: 5 }} />
                                </View>
                            </View> */}
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>City:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(city) => this.setState({ city })}
                                        value={this.state.city}
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>Zip Code:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        maxLength={6}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(zipCode) => this.setState({ zipCode })}
                                        value={this.state.zipCode}
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: 'transparent', borderBottomWidth: 0.3, alignItems: 'center', }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ color: '#383636', paddingLeft: 5, fontSize: 16 }}>PIN:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={''}
                                        maxLength={6}
                                        fontSize={15}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        placeholderTextColor="#746E70"
                                        onChangeText={(PIN) => this.setState({ PIN })}
                                        value={this.state.PIN}
                                    />
                                </View>
                            </View>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={this.state.showSetPIN}
                                onRequestClose={() => { }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ padding: 10, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                        <View style={{ minWidth: Dimensions.get('window').width - 30, backgroundColor: '#ffffff', padding: 10 }}>
                                            <TouchableOpacity style={{ position: 'absolute', right: -10, top: -10, backgroundColor: 'red', width: 20, height: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                                <FontAwesome
                                                    onPress={() => { this.setState({ showSetPIN: false }) }}
                                                    style={{
                                                        fontSize: 20, textAlign: 'center', color: '#ffffff'
                                                    }}
                                                    name='times-circle'
                                                />
                                            </TouchableOpacity>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>

                                                <TextInput
                                                    placeholder={'Old Pin'} secureTextEntry
                                                    keyboardType={'numeric'}
                                                    onChangeText={(OldPIN) => this.setState({ OldPIN })}
                                                    maxLength={6}
                                                    placeholderTextColor="#746E6E"
                                                    style={styles.inputField1}
                                                    contextMenuHidden={true}
                                                />
                                                <TextInput
                                                    placeholder={'New Pin'} secureTextEntry
                                                    keyboardType={'numeric'}
                                                    onChangeText={(PIN) => this.setState({ PIN })}
                                                    maxLength={6}
                                                    placeholderTextColor="#746E6E"
                                                    style={styles.inputField1}
                                                    contextMenuHidden={true}
                                                />
                                            </View>
                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={styles.cusButtonLargeGreen1}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            this.updatePIN();
                                                        }} style={{ textAlign: 'center' }}>
                                                        <Text style={{ color: '#ffffff' }}>Update</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.updateGeneralInfo()}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold' }}
                                        >
                                            Update
                                </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.setState({ showSetPIN: true })}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold' }}
                                        >
                                            Update PIN
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
    /**
  * Update GeneralInfo API Starts
  */
    updateGeneralInfo = () => {
        const { navigate } = this.props.navigation;
        const { general_info, weight, height, contact_no } = this.state;
        if (general_info === '' || weight === '' || height === '' || contact_no === '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'All fields are mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('All fields are mandatory');
            }
            return false;
        }
        this.setState({ isSending: false, isLoading: false, });
        var GeneralUsersInfo = {
            "id": this.state.userid,
            "prefixName": null,
            "aadharCardNo": null,
            "firstName": this.state.general_info,
            "middleName": null,
            "lastName": null,
            "sufixName": null,
            "maritialStatus": this.state.maritalStatus,
            "otherEmail": this.state.emailId,
            "address": this.state.presentAddr,
            "city": this.state.city,
            "states": null,
            "zipCode": this.state.zipCode,
            "email": "",
            "phone": this.state.contact_no,
            "alternateContactNumber": null,
            "address2": this.state.permanentAddr,
            "prefLanguage": "Chinese",
            "ethnicity": null,
            "otp": null,
            "photoContent": null,
            "financialClass": null,
            "height": this.state.height,
            "heightunit": this.state.heightUnit,
            "weight": this.state.weight,
            "bloodGroup": this.state.bloodGroup,
            "bloodPressure": this.state.bloodPressure,
            "bloodSugar": null,
            "weightunit": this.state.weightUnit,
            "temperature": this.state.temperature,
            "temperatureUnit": this.state.tempUnit,
            "pulseRate": this.state.pulseRate,
            "pulseRateUnit": this.state.PulseRateUnit,
            "countryCodes": "101",
            "gender": null,
            "dateofBirth": Moment(new Date(this.state.dateOfBirth)).format('MM/DD/YYYY'),
            "lastUpdated": this.state.lastUpdated,
            "otpVerified": 0,
            "mobOtpVerified": 0,
            "insuranceCompanyNameEncrypted": "",
            "insuranceCompanyName": "",
            "insurancePolicyNumberEncrypted": "",
            "insurancePolicyNumber": "",
            "insuranceAddress1Encrypted": "",
            "insuranceAddress1": "",
            "insuranceAddress2Encrypted": "",
            "insuranceAddress2": "",
            "insuranceCityEncrypted": "",
            "insuranceCity": "",
            "insuranceStateEncrypted": "",
            "insuranceState": "",
            "insuranceZipCodeEncrypted": "",
            "insuranceZipCode": "",
            "insurancePhoneNumberEncrypted": "",
            "insurancePhoneNumber": ""
        }
        console.log("GeneralUsersInfo", GeneralUsersInfo);
        var tempStatusArr = [];
        var tempLengthArr = [];
        var mandatoryFields = [
            'firstName'
        ];
        var lengthCheck = [
            'phone', 'otherEmail', 'address', 'address2', 'city'
        ];
        var lengthCheckText = [
            'Contact Number  is not valid', 'Alternate Email Address  is not valid', 'Present Address should be between 10 to 100 characters', 'Permanent Address should be between 10 to 100 characters', 'City Name should be between 3 to 100 characters'
        ];

        mandatoryFields.forEach(key => {
            tempStatusArr.push(this.checkEmptyField(GeneralUsersInfo[key]));
        });
        lengthCheck.forEach(key => {
            tempLengthArr.push(this.checkLength(key, GeneralUsersInfo[key]));
        });
        if (tempStatusArr.indexOf(0) > -1) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'All fields are mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('All fields are mandatory');
            }
            this.setState({
                isSending: false,
                isLoading: false,
            });
            return false;
        }
        console.log("GeneralUsersInfo", GeneralUsersInfo);
        console.log("tempLengthArr", tempLengthArr);
        if (tempLengthArr.indexOf(0) > -1) {
            this.setState({
                isSending: false,
                isLoading: false,
            });

            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    lengthCheckText[tempLengthArr.indexOf(0)],
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(lengthCheckText[tempLengthArr.indexOf(0)]);
            }
            return false;
        }
        console.log("GENERAL_PATIENT_INFO_UPDATE_URL", GENERAL_PATIENT_INFO_UPDATE_URL);
        fetch(GENERAL_PATIENT_INFO_UPDATE_URL, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(GeneralUsersInfo)
        })
            // .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then(async (res) => {
                console.log("GENERAL_PATIENT_INFO_UPDATE", res);
                if (res.statusCode == 409) {
                    ToastAndroid.showWithGravity(
                        UPDATE_GENERAL_ERROR_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({
                        isSending: false,
                        isLoading: false,
                    }); return;
                }
                else {
                    //  let DASHBOARD_DATA.ProfileImage = this.state.image;
                    //   AsyncStorage.setItem('DASHBOARD_DATA',DASHBOARD_DATA.ProfileImage );

                    ToastAndroid.showWithGravity(
                        UPDATE_GENERAL_SUCCESS_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({
                        isSending: false,
                        isLoading: false,
                    });
                    let DASHBOARD_DATA = await AsyncStorage.getItem('DASHBOARD_DATA');
                    DASHBOARD_DATA = Utility.IsNullOrEmpty(DASHBOARD_DATA) ? '' : JSON.parse(DASHBOARD_DATA);
                    if (DASHBOARD_DATA != '') {
                        DASHBOARD_DATA.ProfileImage = this.state.image;
                        DASHBOARD_DATA.firstName = this.state.general_info;
                        AsyncStorage.setItem('DASHBOARD_DATA', JSON.stringify(DASHBOARD_DATA));
                    }
                }
            }).catch(err => {
                console.log("GENERAL_PATIENT_INFO_UPDATEerr", err);
                this.setState({
                    isSending: false,
                    isLoading: false,
                })
                let errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }

    async updatePIN() {
        const { PIN } = this.state;
        //  const IsOTPSet = await AsyncStorage.getItem('IsOTPSet');
        const USER_DATA = JSON.parse(await AsyncStorage.getItem('USER_DATA'));
        if (PIN === '') {
            ToastAndroid.showWithGravity(
                'Please enter PIN',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); return;
        }
        else if (PIN.length < 6 || PIN.length >= 7) {
            ToastAndroid.showWithGravity(
                'PIN should be of 6 digits',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); return;
        }
        else if (Utility.IsNullOrEmpty(this.state.OldPIN)) {
            ToastAndroid.showWithGravity(
                'Old PIN is empty',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); return;
        }
        var pinData = {
            "AccountID": USER_DATA.Id, "OldPin": this.state.OldPIN, "NewPin": this.state.PIN
        }


        fetch(UPDATE_PIN_API, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(pinData)
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then(async (res) => {
                if (res.statusCode == 409) {
                    ToastAndroid.showWithGravity(
                        UPDATE_GENERAL_ERROR_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({
                        isSending: false,
                        isLoading: false,
                        showSetPIN: false
                    }); return;
                }
                else {
                    //  let DASHBOARD_DATA.ProfileImage = this.state.image;
                    //   AsyncStorage.setItem('DASHBOARD_DATA',DASHBOARD_DATA.ProfileImage );

                    ToastAndroid.showWithGravity(
                        'OTP Updated Successfully',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({
                        isSending: false,
                        isLoading: false,
                        showSetPIN: false
                    });

                }
            }).catch(err => {
                this.setState({
                    isSending: false,
                    isLoading: false,
                })
                let errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    _maybeRenderUploadingOverlay = () => {
        if (this.state.uploading) {
            return (
                <View
                    style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
                    <ActivityIndicator color="#fff" size="large" />
                </View>
            );
        }
    };
    _share = () => {
        Share.share({
            message: this.state.image,
            title: 'Check out this photo',
            url: this.state.image,
        });
    };

    _copyToClipboard = () => {
        Clipboard.setString(this.state.image);
        alert('Copied image URL to clipboard');
    };

    _takePhoto = async () => {
        const {
            status: cameraPerm
        } = await Permissions.askAsync(Permissions.CAMERA);

        const {
            status: cameraRollPerm
        } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        // only if user allows permission to camera AND camera roll
        if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
            let pickerResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                base64: true,
                quality: 0.4,
                aspect: [4, 3]
            });

            this._handleImagePicked(pickerResult);
        }
    };

    _pickImage = async () => {
        const {
            status: cameraRollPerm
        } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        // only if user allows permission to camera roll
        if (cameraRollPerm === 'granted') {
            let pickerResult = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });

            this._handleImagePicked(pickerResult);
        }
    };

    _handleImagePicked = async pickerResult => {
        let uploadResponse, uploadResult;

        try {
            this.setState({
                uploading: true,
                isLoading: false,
            });

            if (!pickerResult.cancelled) {
                uploadResponse = await uploadImageAsync(pickerResult.uri);
                uploadResult = await uploadResponse.json();

                this.setState({
                    // image: uploadResult.location, clickableImage: false, uploading: false

                    image: pickerResult ? pickerResult.base64 : null, clickableImage: false, uploading: false, isLoading: false,
                });
            }
        } catch (e) {
            alert('Upload failed, sorry :(');
        } finally {
            this.setState({
                uploading: false,
                isLoading: false,
            });
        }
    };
}
async function uploadImageAsync(uri) {
    let apiUrl = 'https://file-upload-example-backend-dkhqoilqqn.now.sh/upload';
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('photo', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
    });

    let options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
    };
    return fetch(apiUrl, options);
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    icons_footer: {
        color: 'black',
        justifyContent: 'flex-end',
        paddingRight: 12, paddingBottom: 12, paddingTop: 8,
        fontSize: 16,
        borderRadius: 50,
    },
    maybeRenderUploading: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        borderRadius: 100 / 2,
    },
    maybeRenderImageContainer: {
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        overflow: 'hidden',
    },
    maybeRenderImage: {
        height: 50,
        width: 50,
        borderRadius: 20
    },
    maybeRenderImageText: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    boxDetails: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    card: {

        elevation: 3,
        width: (Dimensions.get("window").width) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    detailsText: {
        fontSize: 14,
        paddingBottom: 5,
        color: '#ffffff'
    },
    inputField: {
        width: '100%',
        color: 'gray',
        borderWidth: 0,
        fontSize: 13,
        paddingBottom: 1,
        paddingLeft: 5,
        borderBottomWidth: 0.3,
        borderBottomColor: 'gray',
    },
    emailinputField: {
        width: '100%',
        color: 'gray',
        borderWidth: 0,
        fontSize: 12,
        paddingBottom: 1,
        paddingLeft: 5,
    },
    inputField1: {
        width: '100%',
        color: 'gray',
        fontSize: 12,
        borderWidth: 0,
        paddingBottom: 1,
        paddingLeft: 5
    },
    inputField5: {
        width: '20%',
        color: 'gray',
        fontSize: 12,
        height: '16%',
        paddingTop: 8,
        borderWidth: 0,
        borderBottomWidth: 0.3,
        borderBottomColor: 'gray',
        marginRight: 3,
        paddingLeft: 5
    },
    inputField6: {
        width: '23%',
        color: 'gray',
        fontSize: 12,
        borderWidth: 0,
        borderBottomWidth: 0.3,
        borderBottomColor: 'gray',
        paddingBottom: 1,
        paddingLeft: 5
    },
    blockCard: {
        width: (Dimensions.get("window").width / 3) - 20,
        backgroundColor: 'white',
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        height: (Dimensions.get("window").width / 3),
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    innerImage: {
        width: 20,
        height: 20,
        marginLeft: 8

    },
    CircleShapeView: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        backgroundColor: '#f3f6fb',

    },
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#8dd5ee',
        elevation: 1,
        marginBottom: 10,
        marginTop: 15,
        marginRight: 5,
        marginLeft: 5,
        minWidth: (Dimensions.get("window").width) / 3,
        flexDirection: 'row'
    },
    inputField1: {
        width: '100%',
        fontSize: 12,
        color: '#a9a9a9',
        marginTop: 10,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
        paddingLeft: 15,
        paddingRight: 15,
        width: '100%'
    }
});
export default GeneralInfoData;