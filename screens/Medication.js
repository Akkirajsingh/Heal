/* eslint-disable max-len */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, Image, TouchableOpacity, AsyncStorage, View, Dimensions, RefreshControl, ToastAndroid, NetInfo } from 'react-native';
import Moment from 'moment';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { MEDICATION_DATA_EMPTY_ERROR } from '../constants/Messages';
import { MEDICATION_LIST, HOSP_MEDICATION_LIST } from '../constants/APIUrl';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import AccessRecord from '../components/AccessRecord';
let MEDICATION_LIST_URL = MEDICATION_LIST;
class Medication extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = { loadingMsg: 'Loading Medication...', ReminderDate: '', dataSource: '', filterStat: 'All', filterData: '', originalData: [], showSearch: false, isLoading: true, medicationResp: [], showMenu: false, refreshing: false, searchText: '', userid: '', accessToken: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                if (this._isMounted) {
                    let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                    USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                    MEDICATION_LIST_URL = MEDICATION_LIST;
                    if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                        USER_DATA = USER_DATA.Hospital;
                        MEDICATION_LIST_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_LIST;
                    }
                    const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                    console.log("access_typewait", access_type);
                    if (access_type != null) {
                        const ACCESS_TYPE = JSON.parse(access_type);
                        if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                            this.setState({
                                accessToken: USER_DATA.ACCESS_TOKEN,
                                userid: ACCESS_TYPE.patientId
                            }, function () {
                                this.medicationData();
                            });
                        }
                    } else {
                        this.setState({
                            userid: USER_DATA.User_Id,
                            accessToken: USER_DATA.ACCESS_TOKEN,
                        }, function () {
                            this.medicationData();
                        });
                    }
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
        this._isMounted = true;
        if (this._isMounted) {
            let USER_DATA = await AsyncStorage.getItem('USER_DATA');
            USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
            if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                USER_DATA = USER_DATA.Hospital;
                MEDICATION_LIST_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_LIST;
            }
            else MEDICATION_LIST_URL = MEDICATION_LIST;
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userid: value.patientId
                }, function () {
                    this.medicationData();
                });
            }
        }
    }
    updateState(data) {
        this.setState({ medicationResp: data.FilteredData });
    }
    medicationData = () => {
        fetch(`${MEDICATION_LIST_URL}?patientId=${this.state.userid}&pageNumber=1&pageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                console.log(res);
                if (Utility.IsNullOrEmpty(res) || res.responseData.medications.length == 0) {
                    ToastAndroid.showWithGravity(
                        MEDICATION_DATA_EMPTY_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                this.setState({
                    isLoading: false,
                    medicationResp: res.responseData.medications,
                    dataSource: res.responseData.medications.dataSource,
                    originalData: res.responseData.medications,
                    filterStat: 'All'
                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                    refreshing: false
                });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
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
                medicationResp: this.state.originalData
            });
        } else if (filterType == 'Active') {
            for (let i = 0; i < this.state.originalData.length; i++) {
                if (this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
                // else if(this.state.originalData.length > 0 ){
                //     ToastAndroid.showWithGravity(
                //         'No Active Data Available',
                //         ToastAndroid.SHORT,
                //         ToastAndroid.CENTER,
                //     );
                //     this.setState({medicationResp: sortedData });
                //     return;
                // }
            }//end for
            this.setState({
                medicationResp: sortedData
            });
        } else if (filterType == 'Inactive') {
            for (var i = 0; i < this.state.originalData.length; i++) {
                if (!this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                medicationResp: sortedData
            });
        }
    };
    /*********************************************************************************************************** */
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
            <CommonView customHeading='Medication' updateParentState={this.updateState.bind(this)}> 
                <View style={{ flex: 1 }}>
                <View style={styles.filterMed}>
                    {this.renderFilterOptions()}
                </View>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        keyboardShouldPersistTaps='always'
                        showsVerticalScrollIndicator={false}
                        style={{}}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.medicationData}
                            />
                        } >
                        <View style={{ flex: 1 }}>
                            {this.state.medicationResp.map(data => (
                                <TouchableOpacity style={{ marginRight: 5, flex: 1 }} key={data.id} onPress={() => this.props.navigation.navigate('MedicationDetails', { medicationId: data.id, dataSource: data.dataSource, visitId: data.visitId })}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('MedicationReminder', { medicationId: data.id })} >
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 8 }}>
                                                    <FontAwesome style={{ color: data.reminderSet == true ? '#1ec208' : '#ED1B24' }} size={17} name='bell' />
                                                </View>
                                            </TouchableOpacity>
                                            {data.isActive ?
                                                <FontAwesome style={{ color: '#1ec208', paddingLeft: 5 }} size={16} name="circle" />
                                                :
                                                <FontAwesome style={{ color: '#ED1C24', paddingLeft: 5 }} size={16} name='circle' />
                                            }
                                            <Text style={{ color: '#767575', fontSize: 17, fontWeight: 'bold', paddingLeft: 10 }}>{data.drugName.toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <FontAwesome style={{ color: '#000', marginTop: 3 }} size={15} name='eyedropper' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                    {data.dosage.length == 0 ? 'Not taken' : data.dosage} {data.dosageUnit.length == 0 ? '' : data.dosageUnit}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <FontAwesome style={{ color: '#000', marginTop: 3 }} size={15} name='calendar' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10  }}>
                                                    {data.dateStarted.length == 0 ? 'No Data' : Moment(data.dateStarted).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <FontAwesome style={{ color: '#000', marginTop: 3, marginLeft: 4 }} size={15} name='thermometer-half' />
                                                <Text style={{ fontSize: 15, color: '#767575', marginLeft: 10 }}>
                                                    {data.illness == '' ? 'Treatment' : data.illness}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons onPress={() => this.props.navigation.navigate('MedicationDetails')} style={{ color: '#000', position: 'absolute', right: 12.5, top: '50%' }} size={25} name='ios-arrow-forward' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.medicationResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    {/* {this.state.dataSource == 'Patient' ? */}
                    <View style={{ position: 'absolute', right: 8, bottom: 5, marginBottom: 12 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddMedication')}>
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
                    {/* : null} */}
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
        paddingLeft: 10, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'flex-start', alignItems: 'center',position:'absolute', top:-45, paddingBottom: 9, paddingTop: 5 
    },
    filterTextActive: {
        textAlign: 'center',
        color: '#40739e'
    }
});
export default Medication;
