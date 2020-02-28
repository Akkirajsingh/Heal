/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, Alert, ActivityIndicator, Platform, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, View, Dimensions, NetInfo, RefreshControl, ToastAndroid } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { USERS_VALIDATION_ERROR, UPDATE_USER_DATA_SUCCESS_MSG, DELETE_USER_DATA_SUCCESS_MSG } from '../constants/Messages';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import CommonView from '../components/CommonView';
import { DELETE_RECORD_ACCESS, UPDATE_RECORD_ACCESS, HOSP_GET_RECORD_ACCESS_USER_BY_ID, GET_RELATIONSHIP, HOSP_GET_RELATIONSHIP, HOSP_DELETE_RECORD_ACCESS, HOSP_UPDATE_RECORD_ACCESS, GET_RECORD_ACCESS_USER_BY_ID } from '../constants/APIUrl';
import Utility from '../components/Utility';
let DELETE_RECORD_ACCESS_URL = DELETE_RECORD_ACCESS;
let UPDATE_RECORD_ACCESS_URL = UPDATE_RECORD_ACCESS;
let GET_RELATIONSHIP_URL = GET_RELATIONSHIP;
let GET_RECORD_ACCESS_USER_BY_ID_URL = GET_RECORD_ACCESS_USER_BY_ID;
let CONNECTION_STATUS = false;

const AccessLeveldata = [{ value: 'Basic', id: '1' }, { value: 'Advanced', id: '2' }];
let AccessToken = '';
let AccountId = '';
class UpdateRecordUser extends Component {
    constructor(props) {
        super(props);
        this.state = { recordName: '', isLoading: true, loadingMsg: '', RelationShipSelectedItems: '', RecordUserId: '', RelationshipData: [], recordEmail: '', recordLastName: '', OtherRelationship: '', relationshipinfo: 'Sister', AccessLevelInfo: 'Basic', access_token: '', userid: '', CountryID: '', usernameAvailable: true };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.countryData();
                this.relationShipDropDownData();
                this.getRecordAccessUserById();
            }
        );
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        const { params } = this.props.navigation.state;
        DELETE_RECORD_ACCESS_URL = DELETE_RECORD_ACCESS;
        UPDATE_RECORD_ACCESS_URL = UPDATE_RECORD_ACCESS;
        GET_RELATIONSHIP_URL = GET_RELATIONSHIP;
        GET_RECORD_ACCESS_USER_BY_ID_URL = GET_RECORD_ACCESS_USER_BY_ID;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            DELETE_RECORD_ACCESS_URL = USER_DATA.ServiceURL + HOSP_DELETE_RECORD_ACCESS;
            UPDATE_RECORD_ACCESS_URL = USER_DATA.ServiceURL + HOSP_UPDATE_RECORD_ACCESS;
            GET_RELATIONSHIP_URL = USER_DATA.ServiceURL + HOSP_GET_RELATIONSHIP;
            GET_RECORD_ACCESS_USER_BY_ID_URL = USER_DATA.ServiceURL + HOSP_GET_RECORD_ACCESS_USER_BY_ID;
        }
        AccessToken = `Bearer ${USER_DATA.ACCESS_TOKEN}`;
        AccountId = USER_DATA.Id;
    }
    /*******************************componentWillUnmount  *************************************************/
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**************************************************************************************************** */
    relationShipDropDownData = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        fetch(GET_RELATIONSHIP_URL, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + USER_DATA.ACCESS_TOKEN,
                'Content-Type': 'application/json',
                access_token: USER_DATA.ACCESS_TOKEN,
                token_type: 'bearer'
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((responseJson) => {
            const drop_down_data = [];
            for (let i = 0; i < responseJson.responseData.length; i++) {
                drop_down_data.push({ label: responseJson.responseData[i]._relationship, value: responseJson.responseData[i]._Id });
            }
            this.setState({
                RelationshipData: drop_down_data,
                isLoading: false,
            });
            let curRel = drop_down_data.filter(x => x.label == this.state.relationshipinfo)[0];
            if (curRel) {
                this.changeRelationShipStatus(curRel.value);
            }
        }).catch((error) => {
            this.setState({ isLoading: false });
            console.error(error);
        });
    }
    changeRelationShipStatus = (val) => {
        this.setState({
            RelationShipSelectedItems: val
        });
    }
    getRecordAccessUserById = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        const { params } = this.props.navigation.state;
        fetch(GET_RECORD_ACCESS_USER_BY_ID_URL + '?id=' + params.RecordUserId, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + USER_DATA.ACCESS_TOKEN,
                'Content-Type': 'application/json',
                'access_token': USER_DATA.ACCESS_TOKEN,
                'token_type': 'bearer'
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (Utility.IsNullOrEmpty(res) || (res.hasOwnProperty("responseData") && res.responseData.length == 0)) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        USER_RECORD_EMPTY_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(USER_RECORD_EMPTY_ERROR);
                }
                return;
            }
            console.log(res);
            this.setState({
                access_token: USER_DATA.ACCESS_TOKEN,
                userid: USER_DATA.User_Id,
                accountId: USER_DATA.Id,
                RecordUserId: res.responseData.id,
                status: res.responseData.status,
                RecordUserName: res.responseData.userName,
                CountryID: Number(res.responseData.countryCode),
                mobileNumberEncrypt: res.responseData.mobileNumberEncrypt,
                MobileNumber: res.responseData.mobileNumber,
                firstNameEncrypt: res.responseData.firstNameEncrypt,
                recordName: res.responseData.firstName,
                lastNameEncrypt: res.responseData.lastNameEncrypt,
                recordLastName: res.responseData.lastName,
                emailCipher: res.responseData.emailCipher,
                recordEmail: res.responseData.emailId,
                relationship: res.responseData.relationship,
                RelationShipSelectedItems: res.responseData.relationshipId,
                AccessLevelInfo: res.responseData.accessLevel,
                accessHistoryDate: res.responseData.accessHistoryDate,
                otherRelationship: res.responseData.OtherRelationship,
                isEmailEditable: res.responseData.isEmailEditable,
                isLoading: false,
            });
        }).catch(err => {
            console.log('recorderr', err);
            this.setState({
                isLoading: false,
                refreshing: false
            });
            const errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
            }
        });
    }
    isUsernameAvailable = (username) => {
        this.setState({ isLoading: true, RecordUserName: username });
        fetch(IS_USERNAME_EXISTS_URL + '?UserName=' + username, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json',
            },
        }).then((response) => response.json()).then((res) => {
            if (res.responseData == 1) {
                this.setState({ usernameAvailable: false });
            } else if (res.responseData == 0) {
                this.setState({ usernameAvailable: true });
            } else {
                this.setState({ usernameAvailable: false });
            }
            this.setState({ isLoading: false });
        }).catch((err) => {
            this.setState({ isLoading: false });
        });
    }
    /*...........................................Update User Record. ...........................................................*/
    UpdateUserRecord = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        const { recordEmail, recordName, AccessLevelInfo, relationshipinfo, RelationShipSelectedItems } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (this.state.recordName.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'First name is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('First name is mandatory');
            }
            this.setState({ isLoading: false, }); return;
        } else if (this.state.recordLastName.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Last name is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Last name is mandatory');
            }
            this.setState({ isLoading: false, }); return;
        } else if (!this.state.usernameAvailable) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Username is already taken!',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Username is already taken!');
            }
            this.setState({ isLoggingIn: false, }); return;
        }
        if (recordName === '' || AccessLevelInfo === '' || relationshipinfo === '' || RelationShipSelectedItems.length <= 0 || AccessLevelInfo.length <= 0 || this.state.MobileNumber.length < 10 || this.state.RecordUserName.length <= 0) {
            ToastAndroid.showWithGravity(
                USERS_VALIDATION_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); return;
        } else if (recordEmail.length > 0 && REG.test(recordEmail) === false) {
            ToastAndroid.showWithGravity(
                USER_EMAIL_VALIDATION_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({ isLoggingIn: false }); return;
        }
        const UpdateUser = {
            "AccountId": USER_DATA.Id,
            "id": this.state.RecordUserId,
            "AccessLevel": this.state.AccessLevelInfo,
            "CountryCode": this.state.CountryID,
            "FirstName": this.state.recordName,
            "LastName": this.state.recordLastName,
            "MobileNumber": this.state.MobileNumber,
            "OtherRelationship": this.state.OtherRelationship,
            "RelationshipId": this.state.RelationShipSelectedItems,
            "UserName": this.state.RecordUserName,
            "name": USER_DATA.userName
        }
        console.log('UpdateUser', UpdateUser);
        fetch(UPDATE_RECORD_ACCESS_URL, {
            method: 'POST',
            headers: {
                Authorization: AccessToken,
                'access_token': USER_DATA.ACCESS_TOKEN,
                'token_type': 'bearer',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(UpdateUser)
        })
         .then(aPIStatusInfo.handleResponse)
        .then((response) => response.json()).then((res) => {
            console.log("record", res)
            if (res.statusCode == 200) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        UPDATE_USER_DATA_SUCCESS_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(UPDATE_USER_DATA_SUCCESS_MSG);
                }
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('RecordAccess');
                });
            } else {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(res.message);
                }
                this.setState({
                    isLoading: false,
                }); return;
            }
        }).catch(err => {
            console.log('recordAccess', err);
            this.setState({
                isLoading: false,
            });
            const errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
            }
        });
    }
    /*.....................................................................................................................*/

    /*...........................Delete User Record......................................................*/
    DeleteUserRecord = () => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm() },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (Id) => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        const data = {
            "id": this.state.RecordUserId
        };
        fetch(DELETE_RECORD_ACCESS_URL, {
            method: 'POST',
            headers: {
                Authorization: AccessToken,
                'access_token': USER_DATA.ACCESS_TOKEN,
                'token_type': 'bearer',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        DELETE_USER_DATA_SUCCESS_MSG,
                        ToastAndroid.LONG,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(DELETE_USER_DATA_SUCCESS_MSG);
                }
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('RecordAccess');
                });
            } else {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.LONG,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(res.message);
                }
                this.setState({
                    isLoading: false,
                }); return;
            }
        }).catch(err => {
            this.setState({
                isLoading: false,
            });
            const errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
            }
        });
    };
    countryData = () => {
        fetch('https://care.patientheal.com/PatientCareServices/api/MasterService/CountryCodes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json()).then((responseJson) => {
            const CountrydropDown_data = [];
            for (let i = 0; i < responseJson.responseData.length; i++) {
                CountrydropDown_data.push({ label: responseJson.responseData[i].countryCode, value: responseJson.responseData[i].id });
            }
            this.setState({
                CountryItem: CountrydropDown_data,
                isLoading: false,
            });
        }).catch((error) => {
            console.log('country data error is ', error);
            this.setState({ isLoading: false });
        });
    }
    changeCountry = (value, index) => {
        this.setState({
            CountryID: value
        });
    }
    changeAccessLevelData = (value, index, data) => {
        this.setState({ AccessLevelInfo: data[index].value });
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading User's Recorded Details....</Text>
                </View>
            );
        }
        return (
            <CommonView UpdateUser>
                <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                    <KeyboardAvoidingView behavior="padding" enabled>
                        <View
                            style={{ paddingLeft: 12, paddingRight: 12, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.inputField}>
                                <FontAwesome style={{ marginTop: 5, marginRight: 10 }} size={20} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 6 }}>First Name :      </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Name'}
                                    fontSize={14}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordName}
                                    secureTextEntry={false}
                                    onChangeText={(recordName) => this.setState({ recordName })}
                                />
                            </View>
                            <View style={styles.inputField}>
                                <FontAwesome style={{ marginTop: 5, marginRight: 10 }}  size={20} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 6 }}>Last Name :      </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Last Name'}
                                    placeholderTextColor={'gray'}
                                    fontSize={14}
                                    value={this.state.recordLastName}
                                    secureTextEntry={false}
                                    onChangeText={(recordLastName) => this.setState({ recordLastName })}
                                />
                            </View>
                            <View style={styles.inputField}>
                                <FontAwesome style={{ marginTop: 5, marginRight: 10 }} size={20} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 6 }}>Username :      </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Username'}
                                    fontSize={14}
                                    placeholderTextColor={'gray'}
                                    value={this.state.RecordUserName}
                                    secureTextEntry={false}
                                    onChangeText={(RecordUserName) => this.setState({ RecordUserName })}
                                />
                            </View>
                            {/* <View style={styles.inputFields}>
                                <MaterialIcons style={{ color: '#3AA6CD', paddingRight: 6, paddingTop: 6 }} size={13} name='email' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Email :      </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'EmailId'}
                                    editable={this.state.isEmailEditable}
                                    placeholderTextColor={'gray'}
                                    keyboardType={'email-address'}
                                    value={this.state.recordEmail}
                                    secureTextEntry={false}
                                    onChangeText={(recordEmail) => this.setState({ recordEmail })}
                                />
                            </View> */}
                            <View style={[styles.RelationShipField2, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', }]}>
                                <MaterialIcons style={{ marginTop: 5, marginRight: 10 }}  size={20} name='phone' />
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%' }}>
                                    <Dropdown
                                        label='Country'
                                        data={this.state.CountryItem}
                                        labelHeight={13}
                                        fontSize={14}
                                        style={{ width: '40%' }}
                                        // inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                        value={this.state.CountryID}
                                        textColor='gray'
                                        selectedItemColor='#41b4af'
                                        onChangeText={(val, index, data) => this.changeCountry(val, index, data)}
                                        containerStyle={{ width: '20%', marginRight: 10 }}
                                        baseColor="#000"
                                    />
                                    <TextInput
                                        style={styles.inputField2}
                                        placeholder={'Mobile Number'}
                                        keyboardType={'phone-pad'}
                                        placeholderTextColor={'gray'}
                                        value={this.state.MobileNumber}
                                        secureTextEntry={false}
                                        maxLength={10}
                                        fontSize={17}
                                        onChangeText={(MobileNumber) => this.setState({ MobileNumber })}
                                        contextMenuHidden={true}
                                    />
                                </View>
                            </View>
                            <View style={styles.inputFieldcss}>
                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <FontAwesome style={{ marginTop: 5, marginRight: 10, marginBottom: 1 }}  size={18} name='group' />
                                    <Text style={{ color: '#000', fontSize: 17 }}>Relationship :     </Text>
                                </View>
                                <Dropdown
                                    baseColor="#000"
                                    label=''
                                    data={this.state.RelationshipData}
                                    labelHeight={8}
                                    fontSize={13}
                                    fontSize={17}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                    containerStyle={{ width: '100%', margin: 0 }}
                                    value={this.state.RelationShipSelectedItems}
                                    onChangeText={(val) => this.changeRelationShipStatus(val)}
                                />
                            </View>
                            <View style={styles.OtherRelationShipField}>
                                <FontAwesome style={{ marginTop: 5, marginRight: 10 }}  size={20} name='user-circle-o' />
                                {/* <Text style={{ color: '#000', fontSize: 17, paddingTop: 6 }}>Other Relationship :      </Text> */}
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'OtherRelationship'}
                                    placeholderTextColor={'gray'}
                                    fontSize={14}
                                    value={this.state.OtherRelationship}
                                    secureTextEntry={false}
                                 
                                    onChangeText={(OtherRelationship) => this.setState({ OtherRelationship })}
                                />
                            </View>
                            <View style={styles.inputFieldcss}>
                                <View style={{ width: '100%', flexDirection: 'row' }}>
                                    <MaterialIcons style={{ marginTop: 5, marginRight: 10 }} size={20} name='verified-user' />
                                    <Text style={{ color: '#000', fontSize: 17  }}>Access Level :     </Text>
                                </View>
                                <Dropdown
                                    baseColor="#000"
                                    label=''
                                    data={AccessLeveldata}
                                    labelHeight={12}
                                    fontSize={17}
                                    textColor='#746E70'
                                    inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                    selectedItemColor='#746E70'
                                    onChangeText={(val, index, data) => this.changeAccessLevelData(val, index, data)}
                                    value={this.state.AccessLevelInfo}
                                    containerStyle={{ width: '100%', margin: 0 }}
                                />
                            </View>
                            <View style={{ margin: 10 }} />
                            <View style={{ flexDirection: 'row', marginBottom:15 }}>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.UpdateUserRecord()}>
                                    <View style={{ flexDirection: 'row' }} >
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}> Update User</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ width: '10%' }} />
                                <TouchableOpacity style={styles.cusButtonLargeRed} onPress={() => this.DeleteUserRecord()}>
                                    <View style={{ flexDirection: 'row' }} >
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold' }}
                                        >
                                            Delete User
                                </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomColor: '#000',
        borderBottomWidth: 0.3,
        marginTop: 14,
        flexDirection: 'row'
    },
    inputField2: {
        width: '90%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomColor: '#000',
        borderBottomWidth: 0.3,
        flexDirection: 'row'
    },
    inputFields: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomColor: '#000',
        borderBottomWidth: 0.3,
        marginTop: 14,
        flexDirection: 'row'
    },
    inputFieldcss: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 7,
    },
    RelationShipField: {
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 12,
        flexDirection: 'row',
    },
    RelationShipField2: {
        width: '97%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 14,
        flexDirection: 'row',
        marginRight: 14
    },
    OtherRelationShipField: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomColor: '#000',
        borderBottomWidth: 0.3,
        marginTop: 9,
        flexDirection: 'row'
    },
    DropDownField: {
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 10,
        flexDirection: 'row'
    },
    inputField1: {
        width: '100%',
        color: '#746E6E',
        fontSize: 13
    },
    OtherRelationShip: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderBottomColor: '#000',
        borderBottomWidth: 0.3,
        color: '#746E6E',
        fontSize: 12
    },
    cusButtonLargeRed: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#E23B44',
        elevation: 1,
        flex: 1,
        width: '45%',
        flexDirection: 'row'
    },
    cusButtonLargeGreen1: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        width: '45%',
        flexDirection: 'row'
    },
});
export default UpdateRecordUser;

