import React, { Component } from 'react';
import { TextInput, Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Platform, AlertIOS, Alert, Dimensions, NetInfo, RefreshControl, ToastAndroid } from 'react-native';
import Moment from 'moment';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { RELATIONSHIP_DATA, FAMILY_HISTORY, HOSP_RELATIONSHIP_DATA, HOSP_FAMILY_HISTORY } from '../constants/APIUrl';
import { DATA_NOT_AVAILABLE } from '../constants/Messages';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import AccessRecord from '../components/AccessRecord';

let RELATIONSHIP_DATA_URL = '';
let FAMILY_HISTORY_URL = '';
let CONNECTION_STATUS = false;

class FamilyHistory extends Component {
    constructor(props) {
        super(props);
        this.state = { filterStat: 'All', filterData: '', originalData: [], RelationshipData: [], showSearch: false, isLoading: true, familyResp: [], showMenu: false, refreshing: false, searchText: '', userId: '', accessToken: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                RELATIONSHIP_DATA_URL = RELATIONSHIP_DATA;
                FAMILY_HISTORY_URL = FAMILY_HISTORY;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    RELATIONSHIP_DATA_URL = USER_DATA.ServiceURL + HOSP_RELATIONSHIP_DATA;
                    FAMILY_HISTORY_URL = USER_DATA.ServiceURL + HOSP_FAMILY_HISTORY;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            accessToken: USER_DATA.ACCESS_TOKEN,
                            userId: ACCESS_TYPE.patientId
                        }, function () {
                            this.relationShipData();

                            this.FamilyHistory();
                        });
                    }
                } else {
                    this.setState({
                        userId: USER_DATA.User_Id,
                        accessToken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.relationShipData();

                        this.FamilyHistory();
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
    relationShipData = () => {
        fetch(RELATIONSHIP_DATA_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.accessToken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    RelationshipData: responseJson.responseData,
                    isLoading: false,
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    FamilyHistory = () => {
        fetch(`${FAMILY_HISTORY_URL}?patientId=${this.state.userId}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            }
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((response) => {
                console.log("familyErr", response);
                if (Utility.IsNullOrEmpty(response) || (response.hasOwnProperty("responseData") && response.responseData.length == 0)) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            DATA_NOT_AVAILABLE,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        AlertIOS.alert(DATA_NOT_AVAILABLE);
                    }
                    this.setState({ isLoading: false, refreshing: false, familyResp: response.responseData.familyHistories, originalData: response.responseData.familyHistories });
                    return;
                }
                this.setState({
                    isLoading: false,
                    familyResp: response.responseData.familyHistories,
                    originalData: response.responseData.familyHistories
                });
            }).catch(err => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({ refreshing: false });
                return;
            });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /****************************************************************************************** **************/
    getRelationShipText = (id) => {
        let RelationShipDatas = this.state.RelationshipData.filter(function (Items) { return Items.id == id })
        if (RelationShipDatas.length > 0) {
            return RelationShipDatas[0].relationshipEN;
        }
    }
    AccessChange = async (val) => {
        if (val != null) {
            let value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userId: value.patientId
                }, function () {
                    this.FamilyHistory();
                });
            }
        }
    }
    updateState(data) {
        this.setState({ familyResp: data.FilteredData });
    }
    render() {
        const { goBack } = this.props.navigation;
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Family History....</Text>
                </View>
            );
        }
        return (
            <CommonView customHeading='Family History' updateParentState={this.updateState.bind(this)}>
                <View style={{ flex: 1 }}>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} ></AccessRecord>
                    <ScrollView showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.FamilyHistory}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            {this.state.familyResp.map(data => (
                                <TouchableOpacity key={data.id} onPress={() => this.props.navigation.navigate('FamilyHistoryDetails', { familyHistoryId: data.id, relativeFirstName: data.relativeFirstName, relativeLastName: data.relativeLastName, relativeCondition: data.conditionName, onsetDate: data.onsetDate, status: data.isActive, dateOfBirth: data.birthDate, Relationship: this.getRelationShipText(data.relationship), resolution: data.resolution, note: data.note, deathDate: data.relativeDeathDate, causeDeath: data.relativeCauseOfDeath, dataSource: data.dataSource })} style={{ flex: 1 }}>
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <FontAwesome style={{ color: '#3AA6CD', paddingLeft: 5 }} size={18} name='user-circle-o' />
                                            <Text style={{ color: '#767575', fontSize: 16, fontWeight: 'bold', paddingLeft: 10 }}>{data.relativeFirstName.toUpperCase()} {data.relativeLastName.toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <Image source={require('../assets/icons/img-2.png')} style={styles.innerImage} />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {(data.resolution.length == '' || data.resolution == null || data.resolution == 'null') ? 'No Data' : data.resolution}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <Image source={require('../assets/icons/img-3.png')} style={styles.innerImage} />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {(data.birthDate == '' || data.birthDate == null) ? 'No Data' : Moment(data.birthDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1, paddingLeft: 8 }}>
                                                <Image source={require('../assets/icons/img-5.png')} style={styles.innerImage} />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {this.getRelationShipText(data.relationship)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons onPress={() => this.props.navigation.navigate('FamilyHistoryDetails')} style={{ color: '#000', position: 'absolute', right: 12.5, top: '50%' }} size={25} name='ios-arrow-forward' />
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {this.state.familyResp.length == 0 ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                    <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                </View>
                                : null}
                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AddFamilyHistory')}>
                            <View
                                style={{
                                    padding: 10,
                                    borderRadius: 110,
                                    width: 55,
                                    height: 55,
                                    backgroundColor: '#F7F1FF',
                                }}
                            >
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 1, borderColor: '#ffffff80', }}>
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
                        <View style={styles.filterButtons}>
                            <Text style={styles.filterText}>Active</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else if (this.state.filterStat == 'Active') {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => this.filerList('All')}>
                        <View style={styles.filterButtons}>
                            <Text style={styles.filterText}>All</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.filerList('Active')}>
                        <View style={styles.filterButtonsActive2}>
                            <Text style={styles.filterTextActive}>Active</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else if (this.state.filterStat == 'Inactive') {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => this.filerList('All')}>
                        <View style={styles.filterButtons}>
                            <Text style={styles.filterText}>All</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.filerList('Active')}>
                        <View style={styles.filterButtons}>
                            <Text style={styles.filterText}>Active</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    };
    filerList = (filterType) => {
        this.setState({
            filterStat: filterType
        });
        const sortedData = [];
        if (filterType == 'All') {
            this.setState({
                familyResp: this.state.originalData
            });
        } else if (filterType == 'Active') {
            for (var i = 0; i < this.state.originalData.length; i++) {
                if (this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }
            this.setState({
                familyResp: sortedData
            });
        } else if (filterType == 'Inactive') {
            for (var i = 0; i < this.state.originalData.length; i++) {
                if (!this.state.originalData[i].isActive) {
                    sortedData.push(this.state.originalData[i]);
                }
            }
            this.setState({
                familyResp: sortedData
            });
        }
    };
    showSearchBar = () => {
        if (this.state.showSearch) {
            this.setState({
                showSearch: false
            });
        } else {
            this.setState({
                showSearch: true
            });
        }
    };
    searchLocal = (key) => {
        this.setState({
            filterStat: 'All'
        });
        if (key.length >= 1) {
            const sortedData = [];
            for (let i = 0; i < this.state.originalData.length; i++) {
                const searchKey = key.toLowerCase();
                const firstName = this.state.originalData[i].relativeFirstName.toLowerCase() + this.state.originalData[i].relativeLastName.toLowerCase();
                if (firstName.indexOf(searchKey) > -1) {
                    sortedData.push(this.state.originalData[i]);
                }
            }
            this.setState({
                familyResp: sortedData
            });
        } else if (key.length == 0) {
            this.setState({
                familyResp: this.state.originalData
            });
        }
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
        width: 100
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
        width: 100
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
    innerImage: {
        width: 22,
        height: 22,
        marginLeft: 7,
    },
    filterTextActive: {
        textAlign: 'center',
        color: '#40739e'
    }
});
export default FamilyHistory;
