/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, Platform, Dimensions, NetInfo, RefreshControl, AlertIOS, ToastAndroid } from 'react-native';
import Moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { USER_RECORD_EMPTY_ERROR } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { RECORD_ACCESS_LIST, GET_RELATIONSHIP, HOSP_GET_RELATIONSHIP, HOSP_RECORD_ACCESS_LIST } from '../constants/APIUrl';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';

let RECORD_ACCESS_LIST_URL = RECORD_ACCESS_LIST;
let GET_RELATIONSHIP_URL = GET_RELATIONSHIP;
let CONNECTION_STATUS = false;
let AccessToken = '';
let AccountId = '';
class RecordAccess extends Component {
    constructor(props) {
        super(props);
        this.state = { UserRecordResp: [], isLoading: true, refreshing: false, RelationshipData: [], hideRelation: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    CONNECTION_STATUS = connectionInfo.type != 'none';
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
                if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }

                RECORD_ACCESS_LIST_URL = RECORD_ACCESS_LIST;
                GET_RELATIONSHIP_URL = GET_RELATIONSHIP;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    GET_RELATIONSHIP_URL = USER_DATA.ServiceURL + HOSP_GET_RELATIONSHIP;
                    RECORD_ACCESS_LIST_URL = USER_DATA.ServiceURL + HOSP_RECORD_ACCESS_LIST;
                }
                AccessToken = `Bearer ${USER_DATA.ACCESS_TOKEN}`;
                AccountId = USER_DATA.Id;
                this.relationShipDropDownData();
                this.getUserRecord();
            }
        );
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*..........RelationShip DropDown API ..............*/
    relationShipDropDownData = () => {
        fetch(GET_RELATIONSHIP_URL, {
            method: 'GET',
            headers: {
                Authorization: AccessToken,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    RelationshipData: responseJson.responseData,
                    isLoading: false,
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(error);
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
    getRelationShipText = (id) => {
        const RelationShipDatas = this.state.RelationshipData.filter((Items) => { return Items._Id == id; });
        if (RelationShipDatas.length > 0) {
            return RelationShipDatas[0]._relationship;
        }
    }
    /****************************Get User's Record  ***********************************************************/
    getUserRecord = async () => {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        console.log(`${RECORD_ACCESS_LIST_URL}?AccountId=${AccountId}`);
        fetch(`${RECORD_ACCESS_LIST_URL}?AccountId=${AccountId}`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + USER_DATA.ACCESS_TOKEN,
                'Content-Type': 'application/x-www-form-urlencoded',
                'access_token': USER_DATA.ACCESS_TOKEN,
                'token_type': 'bearer'
            },
        })
        .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("gen", res);
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
                }
                this.setState({
                    UserRecordResp: res.responseData, isLoading: false, refreshing: false
                });
            })
            .catch(err => {
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
    /*************************************************************************************************** */
    updateState(data) {
        this.setState({ UserRecordResp: data.FilteredData });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Users's Record....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Record Access' searchData={this.state.UserRecordResp} updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getUserRecord}
                            />
                        }
                    >
                        <View
                            style={{
                                paddingLeft: 12, paddingRight: 12, flex: 1, alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {this.state.UserRecordResp.map(data => (
                                <TouchableOpacity key={data.id} onPress={() => this.props.navigation.navigate('UpdateRecordUser', { RecordUserId: data.id })} style={{ marginRight: 5, flex: 1 }}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 6 }}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={require('../assets/icons/user.png')} style={styles.innerImage1} />
                                                    <Text style={{ color: 'gray', fontSize: 16, paddingLeft: 5, paddingTop: 0, marginTop: 0 }}>{Utility.IsNullOrEmpty(data.firstName) ? 'No Data' : data.firstName.toUpperCase()} {Utility.IsNullOrEmpty(data.lastName) ? '' : data.lastName.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            {/* <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image source={require('../assets/icons/basic.png')} style={styles.innerImage} />
                                                    <Text style={{ fontSize: 12, color: '#767575' }}>
                                                        {(data.accessLevel == '' || data.accessLevel == null) ? 'No Data' : data.accessLevel}
                                                    </Text>
                                                </View>
                                            </View> */}
                                            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 6 }}> */}
                                            {this.state.hideRelation ?
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Image source={require('../assets/icons/family.png')} style={styles.innerImage} />
                                                        <Text style={{ fontSize: 15, color: '#767575' }}>
                                                            {this.getRelationShipText(data.relationshipId)}
                                                        </Text>
                                                    </View>
                                                </View> : null}
                                        </View>
                                        <View style={{ flexDirection: 'row',  paddingLeft: 20, marginRight:11 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Image source={require('../assets/icons/basic.png')} style={styles.innerImage} />
                                                <Text style={{ fontSize: 15, color: '#767575', marginTop:2 }}>
                                                    {Utility.IsNullOrEmpty(data.accessLevel) ? 'No Data' : data.accessLevel}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', paddingLeft: 35, }}>
                                            <Image source={require('../assets/icons/family.png')} style={styles.innerImage} />
                                                <Text numberOfLines={2} style={{ fontSize: 15, color: '#767575', marginTop:2  }}>
                                                    {Utility.IsNullOrEmpty(data.relationship) ? 'Relationship Missing' : data.relationship}
                                                </Text>
                                            </View>
                                        </View>
                                        <View>
                                            <Ionicons onPress={() => this.props.navigation.navigate('FamilyHistoryDetails')} style={{ color: '#3AA6CD', position: 'absolute', right: 0, bottom: 19 }} size={25} name='ios-arrow-forward' />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.UserRecordResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddUser')}>
                            <View
                                style={{
                                    padding: 10,
                                    borderRadius: 110,
                                    width: 55,
                                    height: 55,
                                    backgroundColor: '#F7F1FF',
                                }}
                            >
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 0, borderColor: '#fff', }}>
                                    <Ionicons
                                        style={{ fontSize: 35, fontWeight: 10, textAlign: 'center', color: '#000' }}
                                        name='ios-add'
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
    card: {
        width: (Dimensions.get('window').width),
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e'
    },
    innerImage: {
        width: 30,
        height: 30
    },
    innerImage1: {
        width: 20,
        height: 20,
        paddingRight: 7
    },
});
export default RecordAccess;
