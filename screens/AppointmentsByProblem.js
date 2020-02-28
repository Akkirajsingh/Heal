import React, { Component } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    AsyncStorage,
    View,
    Dimensions,
    RefreshControl, ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { GETALL_PROBLEM_APPOINTMENT, HOSP_GETALL_PROBLEM_APPOINTMENT } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;

let GETALL_PROBLEM_APPOINTMENT_URL = '';
class AppointmentsByProblem extends Component {
    constructor(props) {
        super(props);
        this.state = { AccessToken: '', Userid: '', ProblemId: '', appointmentByPrblm: true, appointmentPrblmResp: [], isLoading: true, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                GETALL_PROBLEM_APPOINTMENT_URL = GETALL_PROBLEM_APPOINTMENT;
                const { params } = this.props.navigation.state;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    GETALL_PROBLEM_APPOINTMENT_URL = USER_DATA.ServiceURL + HOSP_GETALL_PROBLEM_APPOINTMENT;
                }
                this.setState({
                    AccessToken: USER_DATA.ACCESS_TOKEN,
                    Userid: USER_DATA.User_Id,
                    ProblemId: params.ProblemId,
                });
                this.getAppointmentByProblem();
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
    /*****************************************Get BillList **************************************************************/
    getAppointmentByProblem = () => {
        fetch(`${GETALL_PROBLEM_APPOINTMENT_URL}?problemId=${this.state.ProblemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        })
            // .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((resp) => {
                if (Utility.IsNullOrEmpty(resp) || (resp.hasOwnProperty("responseData") && resp.responseData.length == 0)) {
                    ToastAndroid.showWithGravity(
                        DATA_NOT_AVAILABLE,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                this.setState({
                    isLoading: false,
                    refreshing: false,
                    appointmentPrblmResp: resp.responseData,
                });
            }).catch((error) => {
                console.error(error);
                this.setState({
                    isLoading: false, refreshing: false,
                });
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    updateState(data) {
        this.setState({ appointmentPrblmResp: data.FilteredData });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Appointment Details....</Text>
                </View>
            );
        }
        return (
            <CommonView Appointments>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getAppointmentByProblem}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 5 }}>
                            {this.state.appointmentPrblmResp.map(data => (
                                <View style={styles.card} >
                                    <View key={data.id} style={{ marginRight: 5, flex: 1 }} >
                                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' />  Practice Name: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.practiceName) ? 'Practice Name' : data.practiceName}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}>  <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='calendar' /> Physician Name: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.physicianName) ? 'Physician Name' : data.physicianName}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' /> Reason: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.reason) ? 'No Data' : data.reason}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <AntDesign style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='infocirlceo' />  Appointment Date: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.appointmentDate) ? '' : Moment(data.appointmentDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                            {this.state.appointmentPrblmResp.length == 0 ?
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
        width: ((Dimensions.get('window').width)) - 20,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 12,
        marginBottom: 15,
        paddingTop: 5,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e',
        borderRadius: 10,
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
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
export default AppointmentsByProblem;
