/* eslint-disable object-property-newline */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, AsyncStorage, View, ImageBackground, Dimensions, RefreshControl, BackHandler, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { DATA_UPDATED_SUCCESS_MSG, DATA_DELETED_SUCCESS_MSG, USERS_VALIDATION_ERROR } from '../constants/Messages';
import { AntDesign, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import Utility from '../components/Utility';
import { DELETE_ALLERGY, ALLERGY_DATA, HOSP_DELETE_ALLERGY, HOSP_ALLERGY_DATA } from '../constants/APIUrl';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
let DELETE_ALLERGY_URL = DELETE_ALLERGY;
let ALLERGY_DATA_URL = ALLERGY_DATA;

let CONNECTION_STATUS = false;

const data = [{ value: 'Yes' }, { value: 'No' }];
const statusData = [{ value: 'Active' }, { value: 'Inactive' }];

class AllergyDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = {
            access_token: '', user_id: '', allergyId: '', medicationName: '', reactionDescription: '', doctorName: '', hospitalName: '', onsetDate: '', remarks: '', dataSource: '', allergyName: '', practiceName: '', description: '', isLoading: true, refreshing: false,
            todayDate: Moment(today).format('MM/DD/YYYY'), Status: '', reason: '', note: '', end_date: '', medicationAllergy: 'No', isActive: '', IsControlEnabled: true
        };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    CONNECTION_STATUS = connectionInfo.type != 'none';
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
                if (!CONNECTION_STATUS) {
                    ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); this.setState({ isLoading: false }); return;
                }
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    DELETE_ALLERGY_URL = USER_DATA.ServiceURL + HOSP_DELETE_ALLERGY;
                    ALLERGY_DATA_URL = USER_DATA.ServiceURL + HOSP_ALLERGY_DATA;
                }
                const { params } = this.props.navigation.state;
                this.setState({
                    allergyId: params.allergyId,
                    access_token: USER_DATA.ACCESS_TOKEN,
                    user_id: USER_DATA.User_Id,
                    dataSource: params.dataSource,
                    IsControlEnabled: params.dataSource == 2 ? true : false
                });
                fetch(`${ALLERGY_DATA_URL}?allergyId=${this.state.allergyId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        Authorization: `Bearer ${this.state.access_token}`,
                    },
                }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {

                    console.log("llergyData.endDatekj", res); const allergyData = res.responseData;
                    this.setState({ isLoading: false, allergyName: allergyData.allergyName, onsetDate: !Utility.IsNullOrEmpty(allergyData.onsetDate) ? Moment(allergyData.onsetDate).format('MM/DD/YYYY') : null, end_date: !Utility.IsNullOrEmpty(allergyData.endDate) ? Moment(allergyData.endDate).format('MM/DD/YYYY') : null, reactionDescription: allergyData.reactionDescription, remarks: allergyData.remarks, doctorName: allergyData.physicianName, hospitalName: allergyData.hospitalName, medicationName: allergyData.medicationName, dataSource: allergyData.dataSource, Status: allergyData.isActive, medicationAllergy: allergyData.medicationAllergy ? 'Yes' : 'No' });
                }).catch(err => {
                    this.setState({ refreshing: false });
                    const errMSg = aPIStatusInfo.logError(err);
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                });
            });
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); this.setState({ isLoading: false }); return;
        }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            DELETE_ALLERGY_URL = USER_DATA.ServiceURL + HOSP_DELETE_ALLERGY;
            ALLERGY_DATA_URL = USER_DATA.ServiceURL + HOSP_ALLERGY_DATA;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            allergyId: params.allergyId,
            access_token: USER_DATA.ACCESS_TOKEN,
            user_id: USER_DATA.User_Id,
            dataSource: params.dataSource,
            IsControlEnabled: params.dataSource == 2 ? true : false
        });
        fetch(`${ALLERGY_DATA_URL}?allergyId=${this.state.allergyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            console.log("llergyData.endDate", res);
            // console.log("llergyData.endDatemh",allergyData.onsetDate) ; 
            const allergyData = res.responseData;
            this.setState({ isLoading: false, allergyName: allergyData.allergyName, onsetDate: !Utility.IsNullOrEmpty(allergyData.onsetDate) ? Moment(allergyData.onsetDate).format('MM/DD/YYYY') : null, end_date: !Utility.IsNullOrEmpty(allergyData.endDate) ? Moment(allergyData.endDate).format('MM/DD/YYYY') : null, reactionDescription: allergyData.reactionDescription, remarks: allergyData.remarks, doctorName: allergyData.physicianName, hospitalName: allergyData.hospitalName, medicationName: allergyData.medicationName, dataSource: allergyData.dataSource, Status: allergyData.IsActive, medicationAllergy: allergyData.MedicationAllergy ? 'Yes' : 'No' });
        }).catch(err => {
            this.setState({ refreshing: false });
            const errMSg = aPIStatusInfo.logError(err);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    setDropdownItem = (val, index) => {
        this.setState({
            medicationAllergy: val,
        });
    }
    getDefaultEndDate(start_date) {
        var currentDate = new Date(start_date);
        currentDate.setDate(currentDate.getDate() + 1);
        console.log("end", new Date(currentDate))
        return new Date(currentDate);
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Allergy Details....</Text>
                </View>
            );
        }
        return (
            <CommonView Allergies={true} >
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 7 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        style={{ paddingLeft: 6, paddingRight: 6 }}
                    >
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <Text style={{ color: '#000', fontSize: 16, paddingTop: 6 }}>Name :      </Text>
                            <TextInput
                                style={styles.inputData}
                                placeholder={'Allergy Name'}
                                secureTextEntry={false}
                                maxLength={50}
                                fontSize={14}
                                onChangeText={(allergyName) => this.setState({ allergyName })}
                                value={this.state.allergyName}
                                editable={this.state.IsControlEnabled}
                            />
                        </View>
                        <Dropdown
                            baseColor="#000"
                            label='Status'
                            value={this.state.Status == true ? 'Active' : 'Inactive'}
                            data={statusData}
                            textColor='#746E6E'
                            labelHeight={7}
                            labelFontSize={16}
                            fontSize={16}
                            selectedItemColor='#41b4af'
                            containerStyle={{ marginBottom: 15, marginTop: 15 }}
                            editable={this.state.IsControlEnabled}
                            onChangeText={(val, index, data) => this.changeMedicalStatus(val, index, data)}
                        />
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 5 }}>
                            <Text style={{ color: '#000', fontSize: 16 }}>Date Started :</Text>
                            <DatePicker
                                style={{ width: '100%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 20, paddingBottom: 5 }}
                                date={this.state.onsetDate}
                                mode="date"
                                format="MM/DD/YYYY"
                                placeholder="select date"
                                /*minDate="2016-05-01"*/
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                editable={this.state.IsControlEnabled}
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: {
                                        left: 0,
                                        borderWidth: 0,
                                        color: '#746E6E',
                                        backgroundColor: 'transparent',
                                        width: '100%',
                                        fontSize: 11,
                                        marginBottom: 17,
                                    },
                                    dateText: {
                                        color: '#746E6E',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        fontSize: 14,
                                        marginBottom: 5,
                                        marginTop: 5
                                    },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 14, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(onsetDate) => { this.setState({ onsetDate, end_date: this.getDefaultEndDate(onsetDate) }); }}
                            />
                        </View>
                        {this.state.Status == false ?
                            <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 8 }}>
                                    Date Ended :
 </Text>
                                <DatePicker
                                    style={{ width: '100%', borderBottomWidth: 0.8, borderBottomColor: 'white', paddingBottom: 5 }}
                                    date={this.state.end_date}
                                    mode="date"
                                    placeholder="select date"
                                    format="MM/DD/YYYY"


                                    minDate={this.getDefaultEndDate(this.state.onsetDate)}
                                    // maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    editable={this.state.IsControlEnabled}
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        },
                                        dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#746E6E',
                                            backgroundColor: 'transparent',
                                            width: '100%',
                                            fontSize: 14,
                                            marginBottom: 5,
                                            marginTop: 5
                                        },
                                        dateText: {
                                            color: '#746E6E',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            fontSize: 14,
                                            marginBottom: 5,
                                            marginTop: 5,

                                        },
                                        placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 14, marginBottom: 5, marginTop: 5 }
                                    }}
                                    onDateChange={(end_date) => {
                                        if (new Date(end_date) <= new Date(this.state.onsetDate)) {
                                            ToastAndroid.show('Date Started and Date ended cannot be same', ToastAndroid.SHORT);
                                            return false;
                                        } this.setState({ end_date });
                                    }}
                                /></View> :
                            null
                        }
                        <View style={{ width: '100%', marginTop: 5 }}>
                            <Dropdown
                                baseColor="#000"
                                label='Is this a medication Allergy?'
                                data={data}
                                textColor='#746E6E'
                                labelFontSize={17}
                                fontSize={14}
                                labelHeight={17}
                                paddingTop={1}
                                containerStyle={{ width: '100%' }}
                                editable={this.state.IsControlEnabled}
                                selectedItemColor='#41b4af'
                                onChangeText={(val, index) => this.setDropdownItem(val, index)}
                                value={this.state.medicationAllergy}
                            /></View>
                        {this.state.medicationAllergy == 'Yes' ?
                            <View>
                                <View>
                                    <View style={{ flexDirection: 'row', borderColor: '#746E6E', borderWidth: 0.2, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f6fb', paddingTop: 4, paddingBottom: 4 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons style={{ marginTop: 3, marginRight: 5, marginLeft: 4 }} size={18} name='doctor' />
                                            <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Doctor(s)</Text>
                                        </View>
                                        {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}

                                    </View>
                                    <TextInput
                                        style={styles.inputData1}
                                        placeholder={'Doctor Name'}
                                        placeholderTextColor="#746E6E"
                                        secureTextEntry={false}
                                        maxLength={100}
                                        fontSize={14}
                                        editable={this.state.IsControlEnabled}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(doctorName) => this.setState({ doctorName })}
                                        value={this.state.doctorName}
                                    />
                                    {/* <Text style={{ paddingTop: 12, paddingBottom: 6, paddingLeft: 12, color: '#746E6E', fontSize: 12 }}>{this.state.doctorName.length == 0 ? 'No Data' : this.state.doctorName}</Text> */}
                                </View>

                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f6fb', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons style={{  marginTop: 3, marginRight: 5, marginLeft: 4 }} size={18} name='hospital-building' />
                                            <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Hospital(s)</Text>
                                        </View>
                                        {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}

                                    </View>
                                    <TextInput
                                        style={styles.inputData1}
                                        placeholder={'Hospital Name'}
                                        secureTextEntry={false}
                                        fontSize={14}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(hospitalName) => this.setState({ hospitalName })}
                                        value={this.state.hospitalName}
                                        editable={this.state.IsControlEnabled}
                                        maxLength={100}

                                    />
                                    {/* <Text style={{ paddingTop: 12, paddingBottom: 6, paddingLeft: 12, color: '#746E6E', fontSize: 12 }}>{this.state.hospitalName.length == 0 ? 'No Data' : this.state.hospitalName}</Text> */}
                                </View>

                                <View>
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons style={{ marginTop: 3, marginRight: 5, marginLeft: 4 }} size={18} name='face' />
                                            <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Reactions</Text>
                                        </View>
                                        {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}
                                    </View>
                                    {/* <Text style={{ paddingTop: 12, paddingBottom: 6, paddingLeft: 12, fontSize: 12, color: '#746E6E' }}>{this.state.reactionDescription.length == 0 ? 'No Data' : this.state.reactionDescription}</Text> */}
                                    <TextInput
                                        style={styles.inputData1}
                                        placeholder={'Reaction'}
                                        secureTextEntry={false}
                                        fontSize={14}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#746E6E"
                                        editable={this.state.IsControlEnabled}
                                        onChangeText={(reactionDescription) => this.setState({ reactionDescription })}
                                        value={this.state.reactionDescription}
                                        maxLength={100}
                                    />
                                </View>

                                <View>
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons style={{ marginTop: 3, marginRight: 5, marginLeft: 4 }} size={18} name='medical-bag' />
                                            <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Medications</Text>
                                        </View>
                                        {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}
                                    </View>
                                    <TextInput
                                        style={styles.inputData1}
                                        placeholder={'Medication Name'}
                                        secureTextEntry={false}
                                        maxLength={100}
                                        fontSize={14}
                                        editable={this.state.IsControlEnabled}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(medicationName) => this.setState({ medicationName })}
                                        value={this.state.medicationName}
                                    />
                                    {/* <Text style={{ paddingTop: 12, paddingBottom: 6, paddingLeft: 12, fontSize: 12, color: '#746E6E' }}>{this.state.medicationName.length == 0 ? 'No Data' : this.state.medicationName}</Text> */}
                                </View>
                            </View>
                            : null}
                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={{ color: '#000', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={18} name='note' />
                                    <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Notes</Text>
                                </View>
                                {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}
                            </View>
                            {/* <Text style={{ paddingTop: 12, paddingBottom: 6, paddingLeft: 12, color: '#746E6E' }}>{this.state.remarks}</Text> */}
                            <TextInput
                                style={styles.inputData1}
                                placeholder={'Notes'}
                                secureTextEntry={false}
                                fontSize={14}
                                editable={this.state.IsControlEnabled}
                                underlineColorAndroid="transparent"
                                onChangeText={(remarks) => this.setState({ remarks })}
                                value={this.state.remarks}
                                maxLength={100}
                            />
                        </View>
                        {this.state.dataSource == 2 ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.updateAllergy(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '12%' }} />
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.deleteAllergyConfirm(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            : null}
                    </ScrollView>
                </View>
            </CommonView>

        );
    }
    changeMedicalStatus = (val, index, data) => {
        this.setState({
            Status: val == 'Active' ? true : false
        });
    };
    changeDosage = (val, index, data) => {
        this.setState({
            dosage: val
        });
    };
    changeDosageUnit = (val, index, data) => {
        this.setState({
            dose_unit: val
        });
    };
    changeMedCat = (val, index, data) => {
        this.setState({
            medUnitData: val
        });
    };
    changeMedVisit = (val, index, data) => {
        this.setState({
            medvisit: val
        });
    };
    changeAppliedTo = (val, index, data) => {
        this.setState({
            applied: val
        });
    };

    updateAllergy = () => {
        const { navigate } = this.props.navigation;
        const { reactionDescription, remarks, allergyName } = this.state;
        if (reactionDescription === '' || remarks === '' || allergyName === '') {
            ToastAndroid.showWithGravity(
                USERS_VALIDATION_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); this.setState({
                isSending: false
            }); return;
        }
        let IsActive = '';
        let status = '';
        let endDate = '';
        if (this.state.Status == true) {
            status = 'Active'
            IsActive = true;
            let OnsetDate = this.state.OnsetDate;
            endDate = '';
        } else {
            IsActive = false;
            endDate = this.state.end_date;
            if (Utility.IsNullOrEmpty(endDate)) {
                ToastAndroid.showWithGravity(
                    'End Date shouldnot be empty',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ); this.setState({
                    isSending: false
                }); return;
            }
        }
        let medicationAllergy = '';
        if (this.state.medicationAllergy == 'Yes') {
            medicationAllergy = true;
        } else {
            medicationAllergy = false;
        }
        const AllergyData = {
            'allergyId': this.state.allergyId, 'PatientId': this.state.user_id, 'allergyName': this.state.allergyName, 'AppointmentDate': '7/17/2019 12:00:00 AM', 'IsActive': IsActive, 'endDate': endDate,
            'MedicationAllergy': medicationAllergy, 'OnsetDate': this.state.onsetDate, 'ReactionDescription': this.state.reactionDescription, 'Remarks': this.state.remarks, 'Status': status
        }
        // const AllergyData = `PatientId=${this.state.user_id}&allergyId=${this.state.allergyId}&allergyName=${this.state.allergyName}&appointmentDate=0001-01-01T00:00:00&physicianName=${this.state.doctorName}&hospitalName=${this.state.hospitalName}&medicationName=${this.state.medicationName
        //     }&IsActive=${status}&MedicationAllergy=${medicationAllergy}&OnsetDate=${this.state.onsetDate}&endDate=${this.state.end_date}&ReactionDescription=${this.state.reactionDescription}&Remarks=${this.state.remarks}&Status=${status}`;
        console.log('AllergyData', AllergyData);
        fetch(ALLERGY_DATA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.access_token}`,
            },
            body: JSON.stringify(AllergyData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(DATA_UPDATED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('Allergy');
                });
            }
        }).catch(err => {
            console.log('allergyerr', err);
            this.setState({
                isLoading: false,
            });
            const errMSg = aPIStatusInfo.logError(err);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    /*.............Delete Allergy Record.........................................*/
    deleteAllergyConfirm = (allergyId) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(allergyId) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };

    deleteConfirm = async (allergyId) => {
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        const data = `allergyId=${this.state.allergyId}`;
        fetch(DELETE_ALLERGY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.access_token}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                ToastAndroid.showWithGravity(
                    DATA_DELETED_SUCCESS_MSG,
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('Allergy');
                });
            })
            .catch(err => {
                this.setState({
                    isLoading: false,
                });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
    /*..........................................................................................................................*/
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

        elevation: 3,
        width: (Dimensions.get('window').width) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    detailsText: {
        fontSize: 14,
        paddingBottom: 5,
        color: '#ffffff'
    },
    inputData1: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        // borderBottomColor: '#8d9393',
        // borderBottomWidth: 0.3,
        marginBottom: 4,
        paddingTop: 9,

    },
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        marginBottom: 4,
        paddingTop: 8,
        paddingBottom: 15
    },
    inputField2: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        marginBottom: 4,
        paddingTop: 4,
        paddingBottom: 7
    },
    blockCard: {
        width: (Dimensions.get('window').width / 3) - 20,
        backgroundColor: 'white',
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        height: (Dimensions.get('window').width / 3),
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    innerImage: {
        width: 20,
        height: 20,
        alignItems: 'flex-start',
        marginRight: 5

    },
    inputData: {
        color: '#767575',
        fontSize: 12
    }
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },

};
export default AllergyDetails;