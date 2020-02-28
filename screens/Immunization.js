import React, { Component } from 'react';
import {
    Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, Dimensions, RefreshControl, ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons, Foundation } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { IMMUNIZATION, HOSP_IMMUNIZATION } from '../constants/APIUrl';
import Utility from '../components/Utility';
import AccessRecord from '../components/AccessRecord';
import aPIStatusInfo from '../components/ErrorHandler';

let IMMUNIZATION_URL = '';
let CONNECTION_STATUS = false;

class Immunization extends Component {
    constructor(props) {
        super(props);
        let today = new Date();
        this.state = { immunizationResp: [], userid: '', todayDate: today, datatoken: '', isLoading: true, ReminderDate: '', loadingMsg: 'Loading Immunization Details', filterStat: 'All', filterData: '', originalData: [], showSearch: false, isLoading: true, medicationResp: [], showMenu: false, refreshing: false, searchText: '', userid: '', value: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                IMMUNIZATION_URL = IMMUNIZATION;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    IMMUNIZATION_URL = USER_DATA.ServiceURL + HOSP_IMMUNIZATION;
                }
                const { params } = this.props.navigation.state;
                let access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    let ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {

                        this.setState({
                            datatoken: USER_DATA.ACCESS_TOKEN,
                            userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.immunizationData();
                        });
                    }
                } else {
                    this.setState({
                        userid: USER_DATA.User_Id,
                        datatoken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.immunizationData();
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
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /***************************************************Access Record for ******************************************************/
    AccessChange = async (val) => {
        if (val != null) {
            let value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userid: value.patientId
                }, function () {
                    this.immunizationData();
                });
            }
        }
    }
    immunizationData = () => {
        fetch(`${IMMUNIZATION_URL}?patientId=${this.state.userid}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                const response = res;
                if (Utility.IsNullOrEmpty(response) || (response.hasOwnProperty("responseData") && response.responseData.length == 0)) {
                    ToastAndroid.showWithGravity(
                        'No Data Available',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                this.setState({
                    isLoading: false,
                    immunizationResp: response.responseData.immunizations,
                });
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
                this.setState({ refreshing: false });
                return;
            });
    }
    updateState(data) {
        this.setState({ immunizationResp: data.FilteredData });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        } else {
            return (
                <CommonView customHeading='Immunization' updateParentState={this.updateState.bind(this)}>

                    <View style={{ flex: 1 }} >
                        <AccessRecord onAccessChange={this.AccessChange.bind(this)} ></AccessRecord>
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.immunizationData}
                                />
                            }
                        >
                            <View style={{ flex: 1 }}>

                                {this.state.immunizationResp.map(data => (
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('ImmunizationDetails', { immunizationId: data.id, dataSource: data.dataSource })} key={data.id}>
                                        <View style={styles.card}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AddReminder', { immunizationId: data.id })} >
                                                    <FontAwesome style={{ color: data.reminderSet == true ? '#1ec208' : '#ED1B24', paddingLeft: 5 }} size={19} name='bell' />
                                                </TouchableOpacity>
                                                <View style={{ flexDirection: 'row', paddingLeft: 10, alignItems: 'center' }}>
                                                    <Image source={require('../assets/images/immunization.png')} style={styles.innerImage} />
                                                    <Text style={{ color: '#767575', fontSize: 14, fontWeight: 'bold', paddingLeft: 10 }}>{data.immunizationName.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                    <MaterialIcons style={{ color: '#000', marginTop: 3 }} size={17} name='date-range' />
                                                    <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.immunizationDate) ? '' : Moment(data.immunizationDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                    <MaterialCommunityIcons style={{ color: '#000', marginTop: 3, marginLeft: 15 }} size={17} name='checkbox-multiple-blank-outline' />
                                                    <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.sequenceNumber) ? '' : data.sequenceNumber}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                    <Foundation style={{ color: '#000', marginTop: 3 }} size={17} name='clipboard-notes' />
                                                    <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.description) ? 'No Data' : data.description}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons onPress={() => this.props.navigation.navigate('ImmunizationDetails')} style={{ color: '#000', position: 'absolute', right: 6, bottom: 20 }} size={25} name='ios-arrow-forward' />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                {this.state.immunizationResp.length == 0 ?
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                        <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                    </View>
                                    : null}
                            </View>

                        </ScrollView>
                        <View style={{ position: 'absolute', right: 8, bottom: 5, marginBottom: 12 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AddImmunization')}>
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
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    boxDetails: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
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
    textTopField: {
        maxWidth: '100%',
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        marginBottom: 10,
    },
    filterButtons: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        paddingTop: 5,
        paddingBottom: 5,
        width: 100,
    },
    innerImage: {
        width: 19,
        height: 19,
    },
    filterText: {
        textAlign: 'center',
        color: 'white'
    },
    filterButtonsActive: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        backgroundColor: 'white',
        paddingTop: 5,
        marginRight: -26,
        zIndex: 4,
        paddingBottom: 5,
        width: 100,

    },
    filterButtonsActive2: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        backgroundColor: 'white',
        paddingTop: 5,
        marginLeft: -30,
        zIndex: 4,
        paddingBottom: 5,
        width: 100,

    },
    filterTextActive: {
        textAlign: 'center',
        color: '#40739e'
    },
});
export default Immunization;