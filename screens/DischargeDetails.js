/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Image, Text, TouchableOpacity, AsyncStorage, View, RefreshControl, Dimensions, ToastAndroid, NetInfo } from 'react-native';
import { AntDesign, Feather, Foundation, FontAwesome, Ionicons, MaterialIcons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import Moment from 'moment';
import CommonView from '../components/CommonView';
import { DISCHARGE_DETAILS_LIST, HOSP_DISCHARGE_DETAILS_LIST } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import AccessRecord from '../components/AccessRecord';
let DISCHARGE_DETAILS_LIST_URL = '';
let CONNECTION_STATUS = false;

class DischargeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = { Userid: '', datatoken: '', dischargeResp: [], filterStat: 'All', filterData: '', showSearch: false, isLoading: true, showMenu: false, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                DISCHARGE_DETAILS_LIST_URL = DISCHARGE_DETAILS_LIST;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    DISCHARGE_DETAILS_LIST_URL = USER_DATA.ServiceURL + HOSP_DISCHARGE_DETAILS_LIST;
                }
                else {
                    DISCHARGE_DETAILS_LIST_URL = DISCHARGE_DETAILS_LIST;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            datatoken: USER_DATA.ACCESS_TOKEN,
                            Userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.dischargeDetails();
                        });
                    }
                } else {
                    this.setState({
                        Userid: USER_DATA.User_Id,
                        datatoken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.dischargeDetails();
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
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); this.setState({ isLoading: false }); return;
        }
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    AccessChange = async (val) => {
        if (val != null) {
            let value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    Userid: value.patientId
                }, function () {
                    this.dischargeDetails();
                });
            }
        }
    }
    dischargeDetails = () => {
        fetch(`${DISCHARGE_DETAILS_LIST_URL}?patientId=${this.state.Userid}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((resp) => {
                if (resp.responseData.length == 0) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            DATA_NOT_AVAILABLE,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        AlertIOS.alert(DATA_NOT_AVAILABLE);
                    }
                    this.setState({ isLoading: false, refreshing: false, dischargeResp: resp.responseData.dischargeNotes });
                    return;
                }
                this.setState({
                    isLoading: false,
                    dischargeResp: resp.responseData.dischargeNotes,
                });
            })
            .catch(err => {
                this.setState({ refreshing: false, isLoading: false });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    updateState(data) {
        this.setState({ dischargeResp: data.FilteredData });
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Discharge instructions....</Text>
                </View>
            );
        } else {
            return (
                <CommonView customHeading='Discharge Details' updateParentState={this.updateState.bind(this)}>
                    <View style={{ flex: 1  }}>
                        <AccessRecord onAccessChange={this.AccessChange.bind(this)} ></AccessRecord>
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.dischargeDetails}
                            />
                        }
                            showsVerticalScrollIndicator={false}>
                            {this.state.dischargeResp.map(data => (
                                <TouchableOpacity key={data.id} onPress={() => this.props.navigation.navigate('DischargeDetailsData', { dischargeId: data.id, dataSource: data.dataSource })} style={{ flex: 1 }}>
                                    <View style={{ paddingLeft: 15, paddingRight: 15 }}>
                                        <View style={{ flexDirection: 'row', padding: 10, elevation: 2, marginBottom: 10, borderColor: 'transparent', borderWidth: 1 }}>
                                            <View style={{ flex: 2, backgroundColor: '#F3F6FB', padding: 15, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                <FontAwesome name="calendar" size={16} color="#736F6E" style={{ position: 'absolute', top: 10, left: 10 }} />
                                                <Text style={{ fontWeight: '100', fontSize: 15, marginBottom: 2 }}>{Moment(data.dischargeDate).format('MMM')}</Text>
                                                <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 2 }}>{Moment(data.dischargeDate).format('DD')}</Text>
                                                <Text style={{ fontWeight: '100', fontSize: 15 }}>{Moment(data.dischargeDate).format('YYYY')}</Text>
                                            </View>
                                            <View style={{ flex: 6, padding: 10 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5 }}>{data.practiceName}</Text>
                                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                                    <View style={{ width: 16 }}>
                                                        <Foundation name="clipboard-notes" size={16} color="#000" />
                                                    </View>
                                                    <Text style={{ marginLeft: 5, fontSize: 14 }}>{data.dischargeNote}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                                    <View style={{ width: 16 }}>
                                                        <Entypo name="info-with-circle" size={16} color="#000" />
                                                    </View>
                                                    <Text style={{ marginLeft: 5, fontSize: 14 }}>{data.instructions}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                                    <View style={{ width: 16 }}>
                                                        <MaterialCommunityIcons name="map-marker" size={16} color="#000"/>
                                                    </View>
                                                    <Text style={{ marginLeft: 5, fontSize: 14 }}>{data.practiceName}</Text>
                                                </View>

                                            </View>
                                            {/* <Entypo name="dots-three-vertical" size={16} color="#736F70" style={{ position: 'absolute', top: 10, right: 10 }} /> */}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.dischargeResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </ScrollView>
                        <View style={{ position: 'absolute', right: 9, bottom: 8 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AddDischargeDetails')}>
                                <View style={{ padding: 10, borderRadius: 110, width: 55, height: 55, backgroundColor: '#F7F1FF' }}>
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
export default DischargeDetails;

