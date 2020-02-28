import React, { Component } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    AsyncStorage,
    View,
    Alert,
    Dimensions,
    RefreshControl, ToastAndroid, NetInfo, Platform, AlertIOS
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { GET_PRESCRIPTION_DETAILS, HOSP_GET_PRESCRIPTION_DETAILS } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import AccessRecord from '../components/AccessRecord';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;
let GET_PRESCRIPTION_DETAILS_URL = '';

class Prescriptions extends Component {
    constructor(props) {
        super(props);
        this.state = { AccessToken: '', Userid: '', prescriptionResp: [], isLoading: true, refreshing: false };
       
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                GET_PRESCRIPTION_DETAILS_URL = GET_PRESCRIPTION_DETAILS;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    GET_PRESCRIPTION_DETAILS_URL = USER_DATA.ServiceURL + HOSP_GET_PRESCRIPTION_DETAILS;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            AccessToken: USER_DATA.ACCESS_TOKEN,
                            Userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.getPrescriptionList();
                        });
                    }
                } else {
                    this.setState({
                        Userid: USER_DATA.User_Id,
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.getPrescriptionList();
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
   async componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
      //  await AsyncStorage.removeItem('USER_DATA.Hospital');
        // let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        // USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        // if(USER_DATA.hasOwnProperty("Hospital")) delete USER_DATA.Hospital;
        // await AsyncStorage.removeItem("USER_DATA");
        // await AsyncStorage.setItem("USER_DATA",JSON.stringify(USER_DATA));
        // await AsyncStorage.removeItem('ACCESS_TYPE');
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    Userid: value.patientId
                }, function () {
                    this.getPrescriptionList();
                });
            }
        }
    }
    /*****************************************Get BillList **************************************************************/
    getPrescriptionList = () => {
        fetch(`${GET_PRESCRIPTION_DETAILS_URL}?Id=${this.state.Userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then((response) => response.json()).then((resp) => {
            if (Utility.IsNullOrEmpty(resp) || (resp.hasOwnProperty("responseData") && resp.responseData.length == 0)) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        DATA_NOT_AVAILABLE,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(DATA_NOT_AVAILABLE);
                }
            }
            this.setState({
                isLoading: false,
                refreshing: false,
                prescriptionResp: resp.responseData,
            });
        }).catch((error) => {
            console.error(error);
            this.setState({
                isLoading: false, refreshing: false,
            });
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
    updateState(data) {
        this.setState({ prescriptionResp: data.FilteredData });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Prescription Details....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Prescriptions' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getPrescriptionList}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 5 }}>
                            {this.state.prescriptionResp.map(data => (
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AddPrescription', { 'prescriptionNumber': data.id })}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <FontAwesome style={{ color: "#1ec208", marginTop: 3 }} size={20} name="user-md" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>{Utility.IsNullOrEmpty(data.physicianName) ? 'Physician Name is missing' : data.physicianName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <MaterialIcons style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='confirmation-number' />  Prescription Serial Number: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.prescriptionNumber) ? 'Prescription Number' : data.prescriptionNumber}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}>  <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='calendar' /> Date: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.createdDate) ? 'Date' : Moment(data.createdDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <MaterialCommunityIcons style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='pharmacy' /> Status: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.status) ? 'status' : (data.status == 2 ? 'Request Pharmacy' : 'New')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.prescriptionResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddPrescription')}>
                            <View
                                style={{
                                    padding: 10,
                                    borderRadius: 110,
                                    width: 55,
                                    height: 55,
                                    backgroundColor: '#F7F1FF',
                                }}
                            >
                                <View style={{ elevation: 1, borderRadius: 90, width: 35, height: 35, borderWidth: 0, borderColor: '#fff', }}>
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
        color: '#41b4af',
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
    }
});
export default Prescriptions;