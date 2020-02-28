/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, View, Dimensions, NetInfo, RefreshControl, ToastAndroid, Platform } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { INSERT_RECORD_ACCESS, GET_RELATIONSHIP, HOSP_INSERT_RECORD_ACCESS, HOSP_GET_RELATIONSHIP, IS_USERNAME_EXISTS_API } from '../constants/APIUrl';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import CommonView from '../components/CommonView';
import Utility from '../components/Utility';
import { USERS_VALIDATION_ERROR, USER_EMAIL_VALIDATION_ERROR, USER_EXIST_ERROR, USER_RECORD_INSERTED_SUCCESS_MSG } from '../constants/Messages';
let CONNECTION_STATUS = false;
let INSERT_RECORD_ACCESS_URL = '';
let GET_RELATIONSHIP_URL = '';
let IS_USERNAME_EXISTS_URL = IS_USERNAME_EXISTS_API;
const AccessLeveldata = [{ value: 'Basic', id: '1' }, { value: 'Advanced', id: '2' }];
let AccessToken = '';
let AccountId = '';
let UserName = '';
class AddUser extends Component {
    constructor(props) {
        super(props);
        this.state = { recordName: '', recordEmail: '', OtherRelationshipDropDown: false, RelationShipSelectedItems: '', recordLastName: '', OtherRelationship: '', RelationshipData: [], relationshipinfo: [], AccessLevelInfo: '', access_token: '', userid: '', RecordUserName: '', MobileNumber: '', usernameAvailable: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({ CountryID: 101 });
                this.countryData();
                this.relationShipDropDownData();
            });
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        INSERT_RECORD_ACCESS_URL = INSERT_RECORD_ACCESS;
        GET_RELATIONSHIP_URL = GET_RELATIONSHIP;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            INSERT_RECORD_ACCESS_URL = USER_DATA.ServiceURL + HOSP_INSERT_RECORD_ACCESS;
            GET_RELATIONSHIP_URL = USER_DATA.ServiceURL + HOSP_GET_RELATIONSHIP;
        } else if (!Utility.IsNullOrEmpty(params.Service_URL)) {
            IS_USERNAME_EXISTS_URL = `${Service_URL}api/MasterService/IsUserNameExist`;
        }
        AccessToken = `Bearer ${USER_DATA.ACCESS_TOKEN}`;
        AccountId = USER_DATA.Id;
        UserName = USER_DATA.userName;
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
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

    /*..........RelationShip DropDown API ..............*/
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
        }).then((response) => response.json()).then((responseJson) => {
            const drop_down_data = [];
            for (let i = 0; i < responseJson.responseData.length; i++) {
                drop_down_data.push({ label: responseJson.responseData[i]._relationship, value: responseJson.responseData[i]._Id });
            }
            this.setState({
                RelationshipData: drop_down_data,
                isLoading: false,
            });
        }).catch((error) => {
            this.setState({ isLoading: false });
            const errMSg = aPIStatusInfo.logError(error);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    /*..................................................*/

    /***************************************Insert User's Record  *******************************************/

    isUsernameAvailable = (username) => {
        console.log(username);
        this.setState({ isLoading: true, RecordUserName: username });
        fetch(IS_USERNAME_EXISTS_URL + '?UserName=' + username, {
            method: 'GET',
            headers: {
                'content-Type': 'application/json',
            },
        }).then((response) => response.json()).then((res) => {
            console.log(res);
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
    AddUserRecord = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
        }
        const { navigate } = this.props.navigation;
        const { recordEmail, recordName, AccessLevelInfo, relationshipinfo, RelationShipSelectedItems } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (recordName.length < 3) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'First name is not valid',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('First name is not valid');
            }
            this.setState({ isLoggingIn: false, }); return;
        }
        //  else if (this.state.recordLastName.length < 3) {
        //     if (Platform.OS !== 'ios') {
        //         ToastAndroid.showWithGravity(
        //             'Last name is not valid',
        //             ToastAndroid.SHORT,
        //             ToastAndroid.CENTER,
        //         );
        //     } else {
        //         AlertIOS.alert('Last name is not valid');
        //     }
        //     this.setState({ isLoggingIn: false, }); return;
        // } 
        else if (Utility.IsNullOrEmpty(this.state.RecordUserName)) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Username is not valid!',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Username is not valid!');
            }
            this.setState({ isLoggingIn: false, }); return;
        } else if (!this.state.usernameAvailable) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    USER_EXIST_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(USER_EXIST_ERROR);
            }
            this.setState({ isLoggingIn: false, }); this.props.navigation.navigate("RecordAccess"); return;
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
        console.log('this is userdata from adduser ', USER_DATA);
        const RecordUser = {
            "AccountId": USER_DATA.Id,
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
        console.log(RecordUser, RecordUser);
        fetch(INSERT_RECORD_ACCESS_URL, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + USER_DATA.ACCESS_TOKEN,
                'access_token': USER_DATA.ACCESS_TOKEN,
                'token_type': 'bearer',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(RecordUser)
        }).then((response) => response.json()).then((res) => {
            console.log(res);
            if (res.statusCode == 400 && res.message.indexOf("This user exist in your access list") > -1) {
                ToastAndroid.showWithGravity(
                    USER_EXIST_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ); this.setState({

                });
                this.props.navigation.navigate("RecordAccess")
                return;
            }
            ToastAndroid.showWithGravity(
                USER_RECORD_INSERTED_SUCCESS_MSG,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({
            }, function () {
                this.props.navigation.navigate('RecordAccess');
            });
        }).catch(err => {
            console.log(err);
            let errMSg = '';
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }

    /************************************************************************************************ */
    changeRelationShipStatus = (val, index) => {
        console.log("val", val);
        const valu = val.toString();
        console.log(valu);
        if (val == 15) {
            this.setState({
                OtherRelationshipDropDown: true,
                RelationShipSelectedItems: val
            });
        } else {
            this.setState({
                OtherRelationshipDropDown: false,
                RelationShipSelectedItems: val
            });
        }
    }
    changeAccessLevelData = (value, index, data) => {
        this.setState({ AccessLevelInfo: data[index].value });
    }
    render() {
        return (
            // <CommonView1 customHeading={'Add User'}  IsFooterVisible = {true} >
            <CommonView AddUser >
                <ScrollView keyboardShouldPersistTaps='always'>
                    <KeyboardAvoidingView behavior="padding" enabled>
                        <View
                            style={{
                                paddingLeft: 10, paddingRight: 18, flex: 1, alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <View style={styles.inputFields}>
                                <FontAwesome style={styles.iconCss} size={20} name='user-circle-o' />
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Name'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordName}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    fontSize={17}
                                    onChangeText={(recordName) => this.setState({ recordName })}
                                />
                            </View>
                            <View style={styles.inputFields}>
                                <FontAwesome style={styles.iconCss} size={20} name='user-circle-o' />
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Last Name'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordLastName}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    fontSize={17}
                                    onChangeText={(recordLastName) => this.setState({ recordLastName })}
                                />
                            </View>
                            <View style={styles.inputFields}>
                                <FontAwesome style={styles.iconCss} size={20} name='user-circle-o' />
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Username'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.RecordUserName}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    fontSize={17}
                                    onChangeText={(RecordUserName) => this.isUsernameAvailable(RecordUserName)}
                                />
                            </View>

                            <View style={styles.inputFields}>
                                <MaterialIcons style={styles.iconCss} size={20} name='email' />
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'EmailId'}
                                    keyboardType={'email-address'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordEmail}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    fontSize={17}
                                    onChangeText={(recordEmail) => this.setState({ recordEmail })}
                                />
                            </View>
                            <View style={[styles.RelationShipField, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', }]}>
                                <MaterialIcons style={styles.iconCss} size={20} name='phone' />
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%' }}>
                                    <Dropdown
                                        label='Country'
                                        data={this.state.CountryItem}
                                        labelHeight={9}
                                        fontSize={15}
                                        style={{ width: '40%' }}
                                        value={this.state.CountryID}
                                        textColor='gray'
                                        selectedItemColor='#41b4af'
                                        onChangeText={(val, index, data) => this.changeCountry(val, index, data)}
                                        containerStyle={{ width: '15%', marginRight: 10 }}
                                        baseColor="#746E70"
                                    />
                                    <TextInput
                                        style={styles.inputField}
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
                            <View style={styles.RelationShipField}>
                                <FontAwesome style={{ marginLeft: 2, marginRight: 10, marginTop: 15 }} size={20} name='group' />
                                <Dropdown
                                    baseColor="#746E70"
                                    label='RelationShip'
                                    data={this.state.RelationshipData}
                                    labelHeight={12}
                                    labelFontSize={17}
                                    fontSize={16}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    value={this.state.RelationShipSelectedItems}
                                    onChangeText={(val, index) => this.changeRelationShipStatus(val, index)}

                                    // value = {'RelationShip'}
                                    containerStyle={{ width: '97%' }}
                                />
                            </View>
                            {this.state.OtherRelationshipDropDown == true ?
                                <View style={styles.inputFields}>
                                    <FontAwesome style={{ marginLeft: 2, marginRight: 10 }} size={20} name='group' />
                                    <TextInput
                                        style={styles.inputField1}
                                        placeholder={'OtherRelationship'}
                                        placeholderTextColor={'gray'}
                                        value={this.state.OtherRelationship}
                                        secureTextEntry={false}
                                        fontSize={17}
                                        onChangeText={(OtherRelationship) => this.setState({ OtherRelationship })}
                                    />
                                </View>
                                : null}
                            <View style={styles.RelationShipField}>
                                <MaterialIcons style={{ marginTop: 5, marginRight: 10, marginTop: 16 }} size={20} name='verified-user' />
                                <Dropdown
                                    baseColor="#746E70"
                                    label='Access Level'
                                    data={AccessLeveldata}
                                    labelHeight={12}
                                    labelFontSize={17}
                                    fontSize={16}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    onChangeText={(val, index, data) => this.changeAccessLevelData(val, index, data)}
                                    value={this.state.AccessLevelInfo}
                                    containerStyle={{ paddingRight: 8, width: '99%', }}
                                />
                            </View>
                            <View style={{ margin: 10 }} />
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.AddUserRecord()} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}
                                    >
                                        Add User
                                </Text>

                                </View>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </CommonView>
        );
    }

}
const styles = StyleSheet.create({
    inputField: {
        width: '90%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        flexDirection: 'row'
    },
    inputFields: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    RelationShipField: {
        width: '97%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 14,
        flexDirection: 'row',
        marginRight: 14
    },
    iconCss: {
        marginTop: 5, marginRight: 10
    },
    OtherRelationShipField: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 10,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        flexDirection: 'row'
    },
    DropDownField: {
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 10,        // borderBottomColor: '#8d9393',
        // borderBottomWidth: 0.3,
        flexDirection: 'row'
    },
    inputField1: {
        width: '100%',
        color: '#a9a9a9',
        color: '#746E6E',
        fontSize: 12
    },
    innerImage: {
        width: 22,
        height: 22,
        paddingRight: 9,
        marginBottom: 6,
        marginRight: 4
    },
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        marginBottom: 10,
        flexDirection: 'row'
    },

});
export default AddUser;