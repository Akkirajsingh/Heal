import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Dimensions, RefreshControl, ToastAndroid, NetInfo } from 'react-native';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Moment from 'moment';
import CommonView from '../components/CommonView';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import { ALLERGY_DATA, HOSP_ALLERGY_DATA } from '../constants/APIUrl';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import AccessRecord from '../components/AccessRecord';
import { COMMON_ERROR } from '../constants/ErrorMessage';
let ALLERGY_DATA_URL = '';

let CONNECTION_STATUS = false;

class Allergy extends Component {
    constructor(props) {
        super(props);
        this.state = { Userid: '', datatoken: '', filterStat: 'All', originalData: [], showSearch: false, isLoading: true, allergyResp: [], appointmentResp: [], showMenu: false, refreshing: false };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                ALLERGY_DATA_URL = ALLERGY_DATA;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    ALLERGY_DATA_URL = USER_DATA.ServiceURL + HOSP_ALLERGY_DATA;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                console.log("access_type", access_type)
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            datatoken: USER_DATA.ACCESS_TOKEN,
                            Userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.RefreshAllergyData();
                        });
                    }
                } else {
                    this.setState({
                        Userid: USER_DATA.User_Id,
                        datatoken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.RefreshAllergyData();
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
    updateState(data) {
        this.setState({ allergyResp: data.FilteredData });
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    Userid: value.patientId
                }, function () {
                    this.RefreshAllergyData();
                });
            }
        }
    }
    /*********************************************************************************************************** */
    RefreshAllergyData = () => {
        console.log(`${ALLERGY_DATA_URL}?patientId=${this.state.Userid}&pageNumber=1&pageSize=10`)
        fetch(`${ALLERGY_DATA_URL}?patientId=${this.state.Userid}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: 'Bearer ' + this.state.datatoken,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((response) => {
                if (Utility.IsNullOrEmpty(response) || response.responseData.allergies.length == 0) {
                    ToastAndroid.showWithGravity(
                        DATA_NOT_AVAILABLE,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                this.setState({
                    isLoading: false,
                    allergyResp: response.responseData.allergies,
                    originalData: response.responseData.allergies,
                });
            }).catch(err => {
                console.log(err)
                this.setState({ refreshing: false, isLoading: false, });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
    }
    /*****************************************************Filter Allergy Data **********************************************************************/
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
                allergyResp: this.state.originalData
            });
        } else if (filterType == 'Active') {
            for (let i = 0; i < this.state.originalData.length; i++) {
                if (this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                allergyResp: sortedData
            });
        } else if (filterType == 'Inactive') {
            for (var i = 0; i < this.state.originalData.length; i++) {
                if (!this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }//end for
            this.setState({
                allergyResp: sortedData
            });
        }
    };
    render() {
        const { goBack } = this.props.navigation;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Allergy....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Allergy' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }} >
                <View style={styles.filterMed}>
                    {this.renderFilterOptions()}
                </View>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.RefreshAllergyData}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            {this.state.allergyResp.map(data => (
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AllergyDetails', { allergyId: data.allergyId, dataSource: data.dataSource })} key={data.allergyId}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AppointmentsByAllergy', { allergyId: data.allergyId })} >
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 8 }}>
                                                    <MaterialCommunityIcons style={{ color: '#1ec208' }} size={21} name='calendar-range' />
                                                </View>
                                            </TouchableOpacity>
                                            {data.isActive ?
                                                <FontAwesome style={{ color: "#1ec208", paddingLeft: 5 }} size={20} name="circle" />
                                                :
                                                <FontAwesome style={{ color: '#ED1B24', paddingLeft: 5 }} size={20} name='circle' />
                                            }
                                            <Text style={{ color: '#767575', fontSize: 16, fontWeight: 'bold', paddingLeft: 10, paddingTop: 0, marginTop: 0 }}>{data.allergyName.toUpperCase()}</Text>

                                            <AntDesign style={{ color: "#FDBECD", marginLeft: 5, marginBottom: 10 }} size={15} name="infocirlceo" />
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <MaterialIcons style={{ color: '#000' }} size={18} name='face' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {data.reactionDescription}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <MaterialCommunityIcons style={{ color: '#000' }} size={18} name='calendar-clock' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {Moment(data.onsetDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <AntDesign style={{ color: '#000', marginLeft: 6 }} size={18} name='medicinebox' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {data.remarks.length > 0 ? data.remarks : 'Treatment'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons onPress={() => this.props.navigation.navigate('AllergyDetails', { allergyId: data.allergyId })} style={{ color: '#000', position: 'absolute', right: 12.5, top: '50%' }} size={25} name='ios-arrow-forward' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.allergyResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5, marginBottom: 12 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddAllergy')}>
                            <View style={{
                                padding: 10,
                                borderRadius: 110,
                                width: 55,
                                height: 55,
                                backgroundColor: '#F7F1FF',
                            }}>
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 1, borderColor: '#000', }}>
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
    allergy: {
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
export default Allergy;

