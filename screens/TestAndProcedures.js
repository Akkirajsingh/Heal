/* eslint-disable max-len */
/* eslint-disable no-prototype-builtins */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
    Image, ScrollView, StyleSheet, Text, TouchableOpacity, Platform, AlertIOS, AsyncStorage, View, Dimensions, RefreshControl, ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialIcons, Foundation, Ionicons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { GET_TEST_RESULT, HOSP_ADD_TEST_RESULT } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import Utility from '../components/Utility';
import AccessRecord from '../components/AccessRecord';
import aPIStatusInfo from '../components/ErrorHandler';

let GET_TEST_RESULT_URL = GET_TEST_RESULT;
let CONNECTION_STATUS = false;

class TestAndProcedures extends Component {
    constructor(props) {
        super(props);
        this.state = { datatoken: '', testProcedureResp: [], userid: '', filterStat: 'All', originalData: [], loadingMsg: 'Loading Test & Procedures..', isLoading: true, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                GET_TEST_RESULT_URL = GET_TEST_RESULT;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    GET_TEST_RESULT_URL = USER_DATA.ServiceURL + HOSP_ADD_TEST_RESULT;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            datatoken: USER_DATA.ACCESS_TOKEN,
                            userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.testProcedureData();
                        });
                    }
                } else {
                    this.setState({
                        userid: USER_DATA.User_Id,
                        datatoken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.testProcedureData();
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
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userid: value.patientId
                }, function () {
                    this.testProcedureData();
                });
            }
        }
    }
    testProcedureData = () => {
        fetch(`${GET_TEST_RESULT_URL}?patientId=${this.state.userid}&pageNumber=1&pageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                console.log("restproc", res);
                if (Utility.IsNullOrEmpty(res) || res.responseData.testResults.length == 0) {
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
                    testProcedureResp: res.responseData.testResults,
                    originalData: res.responseData.testResults,

                });
            }).catch(err => {
                this.setState({
                    isLoading: false, refreshing: false
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
    updateState(data) {
        this.setState({ testProcedureResp: data.FilteredData });
    }
    renderFilterOptions = () => {
        if (this.state.filterStat == 'All') {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => this.filerList('All')}>
                        <View style={styles.filterButtonsActive}>
                            <Text style={styles.filterTextActive}>All</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.filerList('Active')}>
                        <View style={styles.filterButtons2}>
                            <Text style={styles.filterText}>Active</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            );
        } else if (this.state.filterStat == 'Active') {
            return (<View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => this.filerList('All')}>
                    <View style={styles.filterButtons1}>
                        <Text style={styles.filterText}>All</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.filerList('Active')}>
                    <View style={styles.filterButtonsActive2}>
                        <Text style={styles.filterTextActive}>Active</Text>
                    </View>
                </TouchableOpacity>

            </View>);
        } else if (this.state.filterStat == 'Inactive') {
            return (<View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => this.filerList('All')}>
                    <View style={styles.filterButtons1}>
                        <Text style={styles.filterText}>All</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.filerList('InActive')}>
                    <View style={styles.filterButtonsActive2}>
                        <Text style={styles.filterText}>InActive</Text>
                    </View>
                </TouchableOpacity>

            </View>);
        }
    };

    filerList = (filterType) => {
        this.setState({
            filterStat: filterType
        });
        const sortedData = [];
        if (filterType == 'All') {
            this.setState({
                testProcedureResp: this.state.originalData
            });
        } else if (filterType == 'Active') {
            for (let i = 0; i < this.state.originalData.length; i++) {
                if (this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                testProcedureResp: sortedData
            });
        } else if (filterType == 'Inactive') {
            for (let i = 0; i < this.state.originalData.length; i++) {
                if (!this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                testProcedureResp: sortedData
            });
        }
    };
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Test & Procedures' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }} >
                    <View style={styles.filterMed}>
                        {this.renderFilterOptions()}
                    </View>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.testProcedureData}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            {this.state.testProcedureResp.map(data => (
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('TestProcedureDetails', { testProcId: data.id, dataSource: data.dataSource })} key={data.id}>
                                    <View style={styles.card}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            {data.isActive ?
                                                <FontAwesome style={{ color: '#1ec208', paddingLeft: 5 }} size={22} name="circle" />
                                                :
                                                <FontAwesome style={{ color: '#ED1C24', paddingLeft: 5 }} size={22} name='circle' />
                                            }
                                            <Text style={{ color: '#767575', fontSize: 17, fontWeight: 'bold', paddingLeft: 10 }}>{Utility.IsNullOrEmpty(data.nameOfTest) ? '' : data.nameOfTest.toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <MaterialIcons style={{ color: '#000', marginTop: 3 }} size={18} name='date-range' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.dateSubmitted) ? '' : Moment(data.dateSubmitted).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <FontAwesome style={{ color: '#000', marginTop: 3, marginLeft: 10 }} size={18} name='user-md' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.providerName) ? 'No Data' : data.providerName}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <Foundation style={{ color: '#000', marginTop: 3 }} size={18} name='clipboard-notes' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(data.remark) ? 'No Data' : data.remark}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons onPress={() => this.props.navigation.navigate('AddTestAndProcedure')} style={{ color: '#000', position: 'absolute', right: 12.5, top: '50%' }} size={25} name='ios-arrow-forward' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.testProcedureResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>

                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddTestAndProcedure')}>
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
            </CommonView >
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
        color: 'white',
        marginBottom: 10,
    },
    innerImage: {
        width: 15,
        height: 15,
    },
    filterButtons1: {
        borderWidth: 0.8,
        borderColor: '#D7D7D7',
        borderRadius: 15,
        width: 115,
        paddingRight: 10
    },
    filterButtons2: {
        borderWidth: 0.8,
        borderColor: '#F7F1FF',
        borderRadius: 15,
        width: 115,
        paddingLeft: 10
    },
    filterText: {
        textAlign: 'center',
        color: 'gray'
    },
    filterButtonsActive: {
        borderWidth: 0.8,
        borderColor: '#F7F1FF',
        borderRadius: 15,
        backgroundColor: '#F7F1FF',
        marginRight: -26,
        zIndex: 4,
        width: 115,
    },
    filterButtonsActive2: {
        borderWidth: 0.8,
        borderColor: '#F7F1FF',
        borderRadius: 15,
        backgroundColor: '#F7F1FF',
        marginLeft: -30,
        zIndex: 4,
        width: 115,
    },
    filterMed: {
        paddingLeft: 10, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'flex-start', alignItems: 'center', position: 'absolute', top: -45, paddingBottom: 9, paddingTop: 5
    },
    filterTextActive: {
        textAlign: 'center',
        color: '#40739e'
    }
});
export default TestAndProcedures;
