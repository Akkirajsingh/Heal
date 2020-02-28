/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Image, Text, TouchableOpacity, AsyncStorage, View, Platform, RefreshControl, Dimensions, ToastAndroid, NetInfo } from 'react-native';
import { AntDesign, Feather, Foundation, FontAwesome, Ionicons, MaterialIcons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import Moment from 'moment';
import CommonView from '../components/CommonView';
import { HEALTH_TRACKER_LIST_API, HOSP_HEALTH_TRACKER_LIST_API } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import AccessRecord from '../components/AccessRecord';
let HEALTH_TRACKER_LIST_API_URL = '';
let CONNECTION_STATUS = false;

class HealthTrackerListing extends Component {
    constructor(props) {
        super(props);
        this.state = { Userid: '', AccessToken: '', HealthTrackerResp: [], isLoading: true, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                HEALTH_TRACKER_LIST_API_URL = HEALTH_TRACKER_LIST_API;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    HEALTH_TRACKER_LIST_API_URL = USER_DATA.ServiceURL + HOSP_HEALTH_TRACKER_LIST_API;
                }
                this.setState({
                    AccessToken: USER_DATA.ACCESS_TOKEN,
                    Userid: USER_DATA.User_Id,
                });
                this.HealthTrackerDetails();
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
    HealthTrackerDetails = () => {
        console.log(`${HEALTH_TRACKER_LIST_API_URL}?patientId=${this.state.Userid}`);
        fetch(`${HEALTH_TRACKER_LIST_API_URL}?patientId=${this.state.Userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        })
        // .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((resp) => {
                console.log("resp", resp);
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
                    this.setState({ isLoading: false, refreshing: false, HealthTrackerResp: resp.responseData });
                    return;
                }
                this.setState({
                    isLoading: false,
                    HealthTrackerResp: resp.responseData
                });
            })
            .catch(err => {
                console.log("err", err);
                this.setState({ refreshing: false, isLoading: false });
                const errMSg = aPIStatusInfo.logError(err);
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
                    <Text>Loading Health Tracker ....</Text>
                </View>
            );
        } else {
            return (
                <CommonView HealthTracker >
                    <View style={{ flex: 1 }}>
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.HealthTrackerDetails}
                            />
                        }
                            showsVerticalScrollIndicator={false}>
                            {this.state.HealthTrackerResp.map(data => (
                                <TouchableOpacity key={data.id} onPress={() => this.props.navigation.navigate('HealthTrackerDetailsData', { healthTracker: data.id })} style={{ flex: 1 }}>
                                      <View style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 5 }}>
                                    <View style={styles.card} >
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="human-male" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 16, fontWeight: 'bold' }}>Height</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.height} {data.heightunit}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.heightRecordDate) ? 'Height Record Date' : Moment(data.heightRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="human" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Weight</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.weight} {data.weightunit}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.weightRecordDate) ? 'Weight Record Date' : Moment(data.weightRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Entypo style={{ color: "#1ec208", marginTop: 3 }} size={20} name='thermometer' />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Temperature</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.temperature} {data.temperatureUnit}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.temperatureRecordDate) ? 'Temperature Record Date' : Moment(data.temperatureRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="pulse" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Blood Pressure</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.bloodPressure}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.bloodPressureRecordDate) ? 'BP Record Date' : Moment(data.bloodPressureRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="test-tube" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Blood Sugar</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.bloodSugar}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.fbsRecordDate) ? 'fbs Record Date' : Moment(data.fbsRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="heart-pulse" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Pulse Rate</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.pulseRate}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.pulseRateRecordDate) ? 'Pulse Rate Record Date' : Moment(data.pulseRateRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View><View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <MaterialCommunityIcons size={20} style={{ color: "#1ec208", marginTop: 3 }} name="test-tube" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>PPBS</Text>
                                        </View>
                                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15  }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#767575', fontSize: 15 }}>{data.ppbs}</Text>
                                                    <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                        {Utility.IsNullOrEmpty(data.ppbsRecordDate) ? 'ppbs' : Moment(data.ppbsRecordDate).format('MM/DD/YYYY')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View></View>
                                </TouchableOpacity>
                            ))}
                            {this.state.HealthTrackerResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </ScrollView>
                        <View style={{ position: 'absolute', right: 9, bottom: 8 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('HealthTracker')}>
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
const styles = StyleSheet.create({
    card: {
        paddingBottom: 8,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e',
        elevation: 2, 
        borderColor: 'transparent',
         borderWidth: 1
    },
});
export default HealthTrackerListing;
