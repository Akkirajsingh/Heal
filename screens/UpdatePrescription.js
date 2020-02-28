/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, Platform, Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, AsyncStorage, View, Dimensions, NetInfo, AlertIOS, ToastAndroid } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { UPDATE_USER_DATA_EMPTY_ERROR, UPDATE_USER_DATA_SUCCESS_MSG, DELETE_USER_DATA_SUCCESS_MSG } from '../constants/Messages';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import CommonView from '../components/CommonView';
import { DELETE_RECORD_ACCESS, UPDATE_RECORD_ACCESS, GET_RELATIONSHIP } from '../constants/APIUrl';
import Utility from '../components/Utility';

let CONNECTION_STATUS = false;

const AccessLeveldata = [{ value: 'Basic', id: '1' }, { value: 'Advanced', id: '2' }];
let AccessToken = '';
let AccountId = '';
class UpdatePrescription extends Component {
    constructor(props) {
        super(props);
        this.state = { recordName: '', isLoading: true, loadingMsg: '',  RelationShipSelectedItems:'', RecordUserId: '', RelationshipData:[], recordEmail: '', recordLastName: '', OtherRelationship: '', relationshipinfo: 'Sister', AccessLevelInfo: 'Basic', access_token: '', userid: '' };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        const { params } = this.props.navigation.state;
        console.log("params", params);
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA );
        AccessToken = `Bearer ${USER_DATA.ACCESS_TOKEN}`;
        AccountId = USER_DATA.Id;
        this.setState({
            access_token: USER_DATA.ACCESS_TOKEN,
            userid: USER_DATA.User_Id,
            RecordUserId: params.RecordUserId,
            recordName: params.recordName,
            recordLastName: params.recordLastName,
            recordEmail: params.recordEmail,
            OtherRelationship: params.OtherRelationship,
            relationshipinfo: params.relationshipinfo,
            AccessLevelInfo: params.AccessLevelInfo,
            isLoading: false,
        });
        this.relationShipDropDownData();
    }
    /*******************************componentWillUnmount  *************************************************/
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**************************************************************************************************** */
    relationShipDropDownData = () => {
        fetch(GET_RELATIONSHIP, {
            method: 'GET',
            headers: {
                Authorization: AccessToken,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                const count = Object.keys(responseJson.responseData).length;
                let drop_down_data = [];
             
                for (let i = 0; i < responseJson.responseData.length; i++) {
                    drop_down_data.push({label:responseJson.responseData[i]._relationship, value: responseJson.responseData[i]._Id });
                }
                this.setState({
                    RelationshipData: drop_down_data,
                    isLoading: false,
                }, () => {
                    // if(this.state.dataSource.map(function(value, index, arr){
                    //     return value;
                    // })
                    // In this block you can do something with new state.
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                console.error(error);
            });
    }
    changeRelationShipStatus = (val) => {
        this.setState({
            RelationShipSelectedItems: val
        });
    }
    /*...........................................Update User Record. ...........................................................*/
    UpdateUserRecord = () => {
        const { navigate } = this.props.navigation;
        const { recordEmail } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (REG.test(recordEmail) === false) {
            ToastAndroid.showWithGravity(
                UPDATE_USER_DATA_EMPTY_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            this.setState({ isLoading: false, }); return;
        }
        const UpdateUser = `id=${this.state.RecordUserId}&accountId=${AccountId}&firstName=${this.state.recordName}&lastName=${this.state.recordLastName}&emailId=${(this.state.recordEmail).toLowerCase()
            }&relationship=${this.state.RelationShipSelectedItems}&accessLevel=${this.state.AccessLevelInfo}&accessHistoryDate=null&otherRelationship=${this.state.OtherRelationship}`;
       console.log("UpdateUser", UpdateUser)
            fetch(UPDATE_RECORD_ACCESS, {
            method: 'POST',
            headers: {
                'Authorization': AccessToken,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: UpdateUser
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.statusCode == 200) {
                    if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        UPDATE_USER_DATA_SUCCESS_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); } else {
                        AlertIOS.alert( UPDATE_USER_DATA_SUCCESS_MSG);
                      }
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('RecordAccess');
                    });
                }
            })
            .catch(err => {
                console.log("recordAccess", err);
                this.setState({
                    isLoading: false,
                });
                const errMSg = aPIStatusInfo.logError(err);
                if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );} else {
                    AlertIOS.alert( errMSg.length > 0 ? errMSg : COMMON_ERROR);
                  }
            });
    }
    /*.....................................................................................................................*/

    /*...........................Delete User Record......................................................*/
    DeleteUserRecord = (Id) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(Id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (Id) => {
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        let data = `Id=${this.state.RecordUserId}`;
        fetch(DELETE_RECORD_ACCESS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': AccessToken
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                ToastAndroid.showWithGravity(
                    DELETE_USER_DATA_SUCCESS_MSG,
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('RecordAccess');
                });
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
    /*..........................................................................................................................*/

    // changeRelatonshipData = (val, index, data) => {
    //     this.setState({ relationshipinfo: data[index].value });
    // }
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
            <CommonView UpdateUser={true}>
                <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                    <KeyboardAvoidingView behavior="padding" enabled>
                        <View
                            style={{ paddingLeft: 10, paddingRight: 18, flex: 1, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <View style={styles.inputField}>
                                <FontAwesome style={{ color: '#3AA6CD', paddingRight: 6, paddingTop: 6 }} size={13} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>First Name:     </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Name'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordName}
                                    secureTextEntry={false}
                                    onChangeText={(recordName) => this.setState({ recordName })}
                                />
                            </View>
                            <View style={styles.inputField}>
                                <FontAwesome style={{ color: '#3AA6CD', paddingRight: 6, paddingTop: 6 }} size={13} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Last Name:     </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'Last Name'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.recordLastName}
                                    secureTextEntry={false}
                                    onChangeText={(recordLastName) => this.setState({ recordLastName })}
                                />
                            </View>
                            <View style={styles.inputFields}>
                                <MaterialIcons style={{ color: '#3AA6CD', paddingRight: 6, paddingTop: 6 }} size={13} name='email' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Email:     </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'EmailId'}
                                    editable={false}
                                    placeholderTextColor={'gray'}
                                    keyboardType={'email-address'}
                                    value={this.state.recordEmail}
                                    secureTextEntry={false}
                                    onChangeText={(recordEmail) => this.setState({ recordEmail })}
                                />
                            </View>
                            <View style={styles.inputFieldcss}>
                                <FontAwesome style={{ color: '#3AA6CD', paddingRight: 6, paddingTop: 13 }} size={13} name='group' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 12 }}>Relationship:    </Text>
                                <Dropdown
                                    baseColor="#000"
                                    label=''
                                    data={this.state.RelationshipData}
                                    labelHeight={8}
                                    fontSize={12}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    containerStyle={{ paddingRight: 10, width: '73%', paddingLeft: 10 }}
                                    value={this.state.RelationShipSelectedItems}
                                    onChangeText={(val) => this.changeRelationShipStatus(val)} />
                            </View>
                            <View style={styles.OtherRelationShipField}>
                                <FontAwesome style={{ color: '#3AA6CD', paddingRight: 4, paddingTop: 6 }} size={13} name='user-circle-o' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Other Relationship:     </Text>
                                <TextInput
                                    style={styles.inputField1}
                                    placeholder={'OtherRelationship'}
                                    placeholderTextColor={'gray'}
                                    value={this.state.OtherRelationship}
                                    secureTextEntry={false}
                                  
                                    onChangeText={(OtherRelationship) => this.setState({ OtherRelationship })}
                                />
                            </View>
                            <View style={styles.inputFieldcss}>
                                <MaterialIcons style={{ color: '#3AA6CD', paddingTop: 13, paddingRight: 6 }} size={13} name='verified-user' />
                                <Text style={{ color: '#000', fontSize: 12, paddingTop: 13 }}>Access Level:    </Text>
                                <Dropdown
                                    baseColor="#000"
                                    label=''
                                    data={AccessLeveldata}
                                    labelHeight={12}
                                    fontSize={12}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    onChangeText={(val, index, data) => this.changeAccessLevelData(val, index, data)}
                                    value={this.state.AccessLevelInfo}
                                    containerStyle={{ paddingRight: 10, width: '73%', paddingLeft: 10 }}
                                />
                            </View>
                            <View style={{ margin: 10 }} />
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.UpdateUserRecord()}>
                                    <View style={{ flexDirection: 'row' }} >
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}> Update User</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ width: '10%' }}></View>
                                <TouchableOpacity style={styles.cusButtonLargeRed} onPress={() => this.DeleteUserRecord()}>
                                    <View style={{ flexDirection: 'row' }} >
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold' }} >
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
        flexDirection: 'row'
    },
    RelationShipField: {
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        marginTop: 12,
        flexDirection: 'row',
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
        backgroundColor: '#ffffff',
        color: '#746E6E',
        fontSize: 12
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
export default UpdatePrescription;

