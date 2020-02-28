import React, { Component } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    AsyncStorage,
    View,
    Dimensions, TouchableOpacity, 
    RefreshControl, ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import { GET_BILL_DETAILS, HOSP_GET_BILL_DETAILS } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;

let GET_BILL_DETAILS_URL = '';
class BillList extends Component {
    constructor(props) {
        
        super(props);
        this.state = { AccessToken: '', Userid: '', billResp: [], isLoading: true, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                GET_BILL_DETAILS_URL = GET_BILL_DETAILS;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    GET_BILL_DETAILS_URL = USER_DATA.ServiceURL + HOSP_GET_BILL_DETAILS;
                }
                this.setState({
                    AccessToken: USER_DATA.ACCESS_TOKEN,
                    Userid: USER_DATA.User_Id,
                });
                this.getBillList();
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
    getBillList = () => {
        fetch(`${GET_BILL_DETAILS_URL}?Id=${this.state.Userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((resp) => {
            if (Utility.IsNullOrEmpty(resp) || resp.responseData.length == 0) {
                ToastAndroid.showWithGravity(
                    DATA_NOT_AVAILABLE,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
            this.setState({
                isLoading: false,
                refreshing: false,
                billResp: resp.responseData,
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
        this.setState({ billResp: data.FilteredData });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Bill Details....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='BillPay' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getBillList}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 5 }}>
                            {this.state.billResp.map(data => (
                                <TouchableOpacity style={{ marginRight: 5, flex: 1 }} key={data.billId} onPress={() => this.props.navigation.navigate('BillDetails', { billId: data.billId, totalAmount: data.amount, balanceAmount: data.balanceAmount, paidStatus: data.paidStatus })}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Ionicons style={{ color: "#1ec208", marginTop: 3 }} size={20} name="md-list-box" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>{data.billType}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' />  Balance Amount: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.balanceAmount) ? 'Balance Amount' : data.balanceAmount}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}>  <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='calendar' /> Due Date: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.paymentDueDate) ? 'Payment Due Date' : Moment(data.paymentDueDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' /> Amount To Pay: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.amount) ? 'Balance Amount' : data.amount}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <AntDesign style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='infocirlceo' />  Status: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.paidStatus) ? 'Status' : data.paidStatus}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                            ))}
                            {this.state.billResp.length == 0 ?
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
export default BillList;
