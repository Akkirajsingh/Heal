/* eslint-disable no-prototype-builtins */
/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, ToastAndroid, View, Dimensions, NetInfo, RefreshControl } from 'react-native';
import Moment from 'moment';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Utility from '../components/Utility';
import { CAMPAIGN_LIST, HOSP_CAMPAIGN_LIST } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import CommonView from '../components/CommonView';
import aPIStatusInfo from '../components/ErrorHandler';
import AccessRecord from '../components/AccessRecord';
let CAMPAIGN_LIST_URL = '';
let CONNECTION_STATUS = false;

class CampaignList extends Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true, AccessToken: '', Userid: '', startDate: '', endDate: '', campaignResp: [], startTime: '', endTime: '', eventName: '', location: '', eventDescription: '', refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                CAMPAIGN_LIST_URL = CAMPAIGN_LIST;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    CAMPAIGN_LIST_URL = USER_DATA.ServiceURL + HOSP_CAMPAIGN_LIST;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            AccessToken: USER_DATA.ACCESS_TOKEN,
                            Userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.compaignList();
                        });
                    }
                } else {
                    this.setState({
                        Userid: USER_DATA.User_Id,
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.compaignList();
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
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    Userid: value.patientId
                }, function () {
                    this.compaignList();
                });
            }
        }
    }
    /************************************Compaign API Call ***********************************************************************/
    compaignList = () => {
        fetch(`${CAMPAIGN_LIST_URL}?patientId=${this.state.Userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.responseData.length == 0) {
                if (Utility.IsNullOrEmpty(res) || (res.hasOwnProperty("responseData") && res.responseData.length == 0)) {
                    ToastAndroid.showWithGravity(
                        DATA_NOT_AVAILABLE,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                this.setState({ isLoading: false, refreshing: false, campaignResp: res.responseData });
            }
            console.log(res);
            this.setState({
                campaignResp: res.responseData,
                refreshing: false,
                isLoading: false
            });
        }).catch((error) => {
            this.setState({
                refreshing: false, isLoading: false,
            });
            const errMSg = aPIStatusInfo.logError(error);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Campaign Details....</Text>
                </View>
            );
        }
        return (

            <CommonView Campaigns >
                <View style={{ flex: 1 }}>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.compaignList}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            {this.state.campaignResp.map(data => (
                                <TouchableOpacity key={data.id} style={{ marginRight: 5, flex: 1 }}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Image source={{ uri: Utility.IsNullOrEmpty(data.photoContent) ? 'https://care.patientheal.com/PatientCareServices/UserFiles/Hospital/DefaultHospital.jpg' : `data:image/jpg;base64,${data.photoContent}` }} style={styles.compaignImage} />
                                            {/* <Image source={require('../assets/images/hospital-logo.png')} style={styles.compaignImage} /> */}
                                            <Text style={{ color: 'gray', fontSize: 15, paddingLeft: 15, paddingTop: 7, marginTop: 0, fontWeight: 'bold' }}>{data.eventName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', marginTop: 10, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <FontAwesome style={{ color: '#40739e', marginTop: 3 }} size={12} name='calendar' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.startDate) ? '' : data.startDate} {' - '} {Utility.IsNullOrEmpty(data.endDate) ? '' : data.endDate}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', paddingTop: 6 }}>
                                                <Ionicons style={{ color: '#40739e', marginTop: 3 }} size={12} name='md-time' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.startTime) ? '' : data.startTime} {' - '} {Utility.IsNullOrEmpty(data.endTime) ? '' : data.endTime}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', paddingTop: 6 }}>
                                                <MaterialIcons style={{ color: '#40739e', marginTop: 3 }} size={12} name='location-on' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.location) ? 'No Data' : data.location}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', paddingTop: 6 }}>
                                                <MaterialIcons style={{ color: '#40739e', marginTop: 3 }} size={12} name='description' />
                                                <Text style={{ fontSize: 12, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.eventDescription) ? 'No Data' : data.eventDescription}
                                                </Text>
                                            </View>

                                        </View>

                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.campaignResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        width: (Dimensions.get('window').width) - 20,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 15,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e',
    },
    compaignImage: {
        resizeMode: 'contain',
        width: 50,
        height: 50
    },
});
export default CampaignList;
