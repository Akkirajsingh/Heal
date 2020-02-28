/* eslint-disable global-require */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, Platform, AlertIOS, Dimensions, RefreshControl, NetInfo, ToastAndroid } from 'react-native';
import Moment from 'moment';
import { FontAwesome, MaterialCommunityIcons, AntDesign, Foundation, Ionicons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { ADD_PROBLEM, HOSP_ADD_PROBLEM } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import AccessRecord from '../components/AccessRecord';
let ADD_PROBLEM_URL = '';
let CONNECTION_STATUS = false;

class Problems extends Component {
    constructor(props) {
        super(props);
        this.state = { filterStat: 'All', Userid: '', filterData: '', originalData: [], showSearch: false, isLoading: true, probResp: [], showMenu: false, refreshing: false, searchText: '', userid: '', value: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                ADD_PROBLEM_URL = ADD_PROBLEM;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    ADD_PROBLEM_URL = USER_DATA.ServiceURL + HOSP_ADD_PROBLEM;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            AccessToken: USER_DATA.ACCESS_TOKEN,
                            Userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.problemData();
                        });
                    }
                } else {
                    this.setState({
                        Userid: USER_DATA.User_Id,
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.problemData();
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
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
    }
    AccessChange = async (val) => {
        if (val != null) {
            let value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    Userid: value.patientId
                }, function () {
                    this.problemData();
                });
            }
        }
    }
    updateState(data) {
        this.setState({ probResp: data.FilteredData });
    }
    /*******************************************Problem API ******************************************************/
    problemData = () => {
        this.setState({ refreshing: true });
        fetch(`${ADD_PROBLEM_URL}?patientId=${this.state.Userid}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((response) => {
            console.log("response", response);
            if (Utility.IsNullOrEmpty(response) || response.responseData.problems.length == 0) {
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
                probResp: response.responseData.problems,
                originalData: response.responseData.problems,
                filterStat: 'All'
            });
        })
            .catch((error) => {
                this.setState({ isLoading: false, refreshing: false });
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
    /********************************************Filter Data **********************************************************************/
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
                probResp: this.state.originalData
            });
        } else if (filterType == 'Active') {
            for (let i = 0; i < this.state.originalData.length; i++) {
                if (this.state.originalData[i].isProblemActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                probResp: sortedData
            });
        } else if (filterType == 'Inactive') {
            for (var i = 0; i < this.state.originalData.length; i++) {
                if (!this.state.originalData[i].isProblemActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                probResp: sortedData
            });
        }
    };
    /***************************************************************************************************************** */
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Medical Problems....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Medical Problems' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                    <View style={styles.filterMed}>
                        {this.renderFilterOptions()}
                    </View>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} ></AccessRecord>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.problemData}
                            />
                        }
                    >
                        <View style={{ flex: 1, marginTop: 4 }}>
                            {this.state.probResp.map(data => (
                                <TouchableOpacity key={data.problemId} style={{ marginRight: 5, flex: 1 }} onPress={() => this.props.navigation.navigate('ProblemDetails', { problemId: data.problemId, dataSource: data.dataSource })}>
                                    <View style={styles.card}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentsByProblem', { ProblemId: data.problemId })} >
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 8 }}>
                                                    <MaterialCommunityIcons style={{ color: '#1ec208' }} size={21} name='calendar-range' />
                                                </View>
                                            </TouchableOpacity>
                                            {data.isProblemActive ?
                                                <FontAwesome style={{ color: "#1ec208", paddingLeft: 5 }} size={18} name="circle" />
                                                :
                                                <FontAwesome style={{ color: '#ED1B24', paddingLeft: 5 }} size={18} name='circle' />
                                            }
                                            <Text style={{ color: '#767575', fontSize: 14, fontWeight: 'bold', paddingLeft: 10 }}>{data.problemName.toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <Foundation style={{ color: '#000', marginTop: 3 }} size={16} name='clipboard-notes' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {data.problemDescription.length > 0 ? data.problemDescription : 'Details'}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <MaterialCommunityIcons style={{ color: '#000', marginTop: 3 }} size={16} name='calendar-clock' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {Moment(data.startDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            {data.isProblemActive === false ?
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                    <View style={{ marginLeft: 10, marginRight: 10 }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <FontAwesome style={{ color: '#000', marginTop: 3 }} size={16} name='calendar' />
                                                            <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                                {data.endDate == null ? 'NA' : Moment(data.endDate).format('MM/DD/YYYY')}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                : null
                                            }
                                        </View>
                                        <Ionicons onPress={() => this.props.navigation.navigate('ProblemDetails', { problemId: data.problemId })} style={{ color: '#000', position: 'absolute', right: 12.5, top: '50%' }} size={25} name='ios-arrow-forward' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.probResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddProblem')}>
                            <View style={{ padding: 10, borderRadius: 110, width: 55, height: 55, backgroundColor: '#F7F1FF' }}>
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 0, borderColor: '#fff', }}>
                                    <Ionicons style={{ fontSize: 35, fontWeight: 10, textAlign: 'center', color: '#000' }}
                                        name='ios-add' />
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
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e'
    },
    problems: {
        width: (Dimensions.get('window').width / 2) - 30,
        backgroundColor: 'transparent',
        borderRadius: 20,
        elevation: 1,
        alignItems: 'flex-start',
        padding: 10
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
        color: '#D7D7D7'
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
export default Problems;
