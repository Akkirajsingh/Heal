/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, Image, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, Platform, AlertIOS, View, NetInfo, Dimensions, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import { EvilIcons, MaterialCommunityIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import RadioForm, { } from 'react-native-simple-radio-button';
import CommonView from '../components/CommonView';
import {
    MEDICATION_UNITS, MEDICATION_METHODS, TREATMENT_CATEGORIES, GET_VISIT, INSERT_MEDICATION,
    HOSP_MEDICATION_UNITS, HOSP_MEDICATION_METHODS, HOSP_TREATMENT_CATEGORIES, HOSP_GET_VISIT, HOSP_INSERT_MEDICATION
} from '../constants/APIUrl';
import Moment from 'moment';
import { ADDED_MEDICATION_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import Validation from '../components/Validation';

let MEDICATION_UNITS_URL = '';
let MEDICATION_METHODS_URL = '';
let TREATMENT_CATEGORIES_URL = '';
let GET_VISIT_URL = GET_VISIT;
let INSERT_MEDICATION_URL = '';

let CONNECTION_STATUS = false;

const data1 = [{ value: 'Yes' }, { value: 'No' }];
const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class AddMedication extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = { loadingMsg: 'Loading Medications....', visitId: '', addNotes: false, dropDownData: [], visitType: '', encounterDate: '', practiceName: '', isSending: false, MedCategory: [], medicineCategorySelectedItem: '', user_id: '', illness: '', dose: '', accessToken: '', isLoading: false, showMenu: false, refreshing: false, todayDate: today, med_name: '', other_name: '', dose: '', dose_unit: [], dose_unitSelectedItem: '', appliedData: [], applied: '', instructions: '', status: 'Active', reason: '', note: '', start_date: Moment(today).format('MM/DD/YYYY'), end_date: Moment(today).format('MM/DD/YYYY'), medicationAllergyView: '' };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        MEDICATION_UNITS_URL = MEDICATION_UNITS;
        MEDICATION_METHODS_URL = MEDICATION_METHODS;
        TREATMENT_CATEGORIES_URL = TREATMENT_CATEGORIES;
        GET_VISIT_URL = GET_VISIT;
        INSERT_MEDICATION_URL = INSERT_MEDICATION;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            MEDICATION_UNITS_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_UNITS;
            MEDICATION_METHODS_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_METHODS;
            TREATMENT_CATEGORIES_URL = USER_DATA.ServiceURL + HOSP_TREATMENT_CATEGORIES;
            GET_VISIT_URL = USER_DATA.ServiceURL + HOSP_GET_VISIT;
            INSERT_MEDICATION_URL = USER_DATA.ServiceURL + HOSP_INSERT_MEDICATION;
        }
        this.setState({
            user_id: USER_DATA.User_Id,
            accessToken: USER_DATA.ACCESS_TOKEN
        });
        console.log('user_id', this.state.user_id);
        this.medicineCategory();
        // this.TreatmentCategory();
        this.dosageUnit();
        this.appliedTo();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
    }
    /**************************************************************************************************** */
    setDropdownItem = (value, index, data1, dropDownField) => {
        if (dropDownField == 'MedicineCategory') {
            this.setState({
                // medicineCategorySelectedItem: data1[index]._Id,
                medicineCategorySelectedItem: value.toString(),
            });
        } else if (dropDownField == 'DoseUnit') {
            this.setState({
                dose_unitSelectedItem: value.toString(),
            });
        } else if (dropDownField == 'AppliedTo') {
            this.setState({
                applied: value.toString(),
            });
        }
    }
    /******************************************This Medication is based on Visit API? ****************************/
    saveMedication = () => {
        const { med_name, status, illness, medicineCategorySelectedItem, dose, applied, dose_unitSelectedItem, instructions, end_date, start_date, medicationAllergy } = this.state;
        let obj = [med_name, status, illness, medicineCategorySelectedItem, dose, applied, dose_unitSelectedItem, instructions, end_date, start_date];
        let mandatoryMsg = ['Enter Medication Name', 'Select Status', 'Enter Illness', 'Select Medicine Category', 'Enter Dose', 'Select Applied To', 'Select Dose Unit', 'Enter Instructions', 'select End Date', 'select Start Date'];
        let pattern = [/^.{3,100}$/, "", "", "", "", "", "", "", "", ""];
        let patternMsg = [" Medication name should be between 3 and 100 characters", "", "", "", "", "", "", "", "", ""];
        let length = [3, "", "", "", "", "", "", "", "", ""];
        let lengthMsg = ["Please enter Medication name atleast minimum of 3 characters", "", "", "", "", "", "", "", "", ""];
        // this.setState({ isSending: true });
        var validInput = Validation.Validate(mandatoryMsg, pattern, patternMsg, length, lengthMsg, obj);
        if (!Utility.IsNullOrEmpty(validInput)) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    validInput,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(validInput);
            } this.setState({
                isSending: false
            }); return;
        }
        let statusData = '';
        if (this.state.status == 'Active') {
            statusData = 'true';
            const end_date = '';
        } else {
            statusData = 'false';
            const end_date = this.state.end_date;
        }
        let VisitId = '';
        if (this.state.medicationAllergy == 'Yes') {
            VisitId = Utility.IsNullOrEmpty(this.state.visitId) ? 0 : this.state.visitId;
        }
        else { VisitId = 0; }
        const data = {
            patientId: this.state.user_id,
            illness: this.state.illness,
            drugName: this.state.med_name,
            dosage: this.state.dose,
            dosageUnit: this.state.dose_unitSelectedItem,
            //  dosageUnit: this.state.dose_unitSelectedItem,
            medicationTaken: this.state.applied,
            frequency: 'axz',
            status: statusData,
            isActive: statusData,
            dateStarted: this.state.start_date,
            dateStopped: this.state.end_date,
            note: this.state.notes,
            genericName: this.state.other_name,
            dataSource: 'Patient',
            catagory: this.state.medicineCategorySelectedItem,
            visitId: VisitId,
            date: this.state.encounterDate
        };
        console.log('data', data);
        console.log(INSERT_MEDICATION_URL)
        fetch(INSERT_MEDICATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(data),

        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            console.log('AddM', res);
            if (res.statusCode == 200) {
                ToastAndroid.show(ADDED_MEDICATION_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isSending: false,
                }, function () {
                    this.props.navigation.navigate('Medication');
                });
            }
        }).catch(err => {
            this.setState({
                isSending: false
            });
            console.log('MedDetailsErrormsg:', err);
            const errMSg = '';// aPIStatusInfo.logError(err);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }
    /*******************************************Get Visit Api Call  ************************************************************/
    getVisit = () => {
        console.log("`${GET_VISIT_URL}?PatientId=${this.state.user_id}", `${GET_VISIT_URL}?PatientId=${this.state.user_id}`)
        // fetch(`${GET_VISIT} ?PatientId=${this.state.user_id}`, {
        fetch(`${GET_VISIT_URL}?PatientId=${this.state.user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then((response) => response.json()).then((res) => {
            console.log('getVisit', res);
            const drop_down_data = [];
            for (let i = 0; i < res.responseData.encounters.length; i++) {
                drop_down_data.push({
                    visitId: res.responseData.encounters[i].id,
                    visitType: res.responseData.encounters[i].visitType,
                    encounterDate: res.responseData.encounters[i].encounterDate,
                    practiceName: res.responseData.encounters[i].practiceName
                });
            }
            this.setState({
                dropDownData: drop_down_data
            });
            console.log('dropDownData', this.state.dropDownData);
        });
    }
    /****************************************************************************************************************************** */
    changeMedicalStatus = (val, index, data) => {
        this.setState({
            status: val
        });
    };
    changeVisitData = (val) => {
        console.log('changeVisitData', val);
        if (val == 'Yes') {
            this.getVisit();
        }
        this.setState({
            medicationAllergy: val,
            medicationAllergyView: val
        });
    };
    /**********************************medicineCategory dropdown Api  **********************************************************/
    medicineCategory = () => {
        fetch(TREATMENT_CATEGORIES_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData, 'MedicineCategory');
        });
    }
    /******************************************************Applied For dropdown Api ******************************/
    appliedTo = () => {
        fetch(MEDICATION_METHODS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData, 'AppliedTo');
        });
    }
    /**************************dosageUnitAPI Call *******************************************************************/
    dosageUnit = () => {
        fetch(MEDICATION_UNITS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            console.log("fetchDropdownData", res)
            this.fetchDropdownData(res.responseData, 'DoseUnit');
        });
    }
    /********************************************************************************************************* */
    fetchDropdownData(apidata, dropDownField) {
        const DropDownItems = [];
        let i;
        if (dropDownField == 'MedicineCategory') {
            for (i = 0; i < apidata.length; i++) {
                DropDownItems.push({ value: apidata[i]._Id, label: apidata[i]._treatmentcategory });
            }
            this.setState({
                MedCategory: DropDownItems,
            });
        } else if (dropDownField == 'DoseUnit') {
            for (i = 0; i < apidata.length; i++) {
                DropDownItems.push({ value: apidata[i].id, label: apidata[i].medicationUnit });
            }
            this.setState({
                dose_unit: DropDownItems,
            });
        } else if (dropDownField == 'AppliedTo') {
            for (i = 0; i < apidata.length; i++) {
                DropDownItems.push({ value: apidata[i].id, label: apidata[i].medicationMethod });
            }
            this.setState({
                appliedData: DropDownItems,
            });
        }
    }
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    render() {
        return (
            <CommonView AddMedication={true}>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>

                    <ScrollView style={{ paddingLeft: 8, paddingRight: 8 }} keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                        <View style={styles.inputField} >
                            <AntDesign size={20} style={styles.IconCss} name='medicinebox' />
                            <TextInput
                                placeholder={'Medicine Name'}
                                secureTextEntry={false}
                                fontSize={18}
                                style={{ width: '100%' }}
                                value={this.state.med_name}
                                placeholderTextColor='#938F97'
                                onChangeText={(med_name) => this.setState({ med_name })}
                            />
                        </View>
                        <View style={{ flexDirection: "column", marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontSize: 17 }} >Status</Text>
                            <View>
                                {this.state.status == 'Active' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 0 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.activestatus}>
                                        <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                            <Text style={{ color: 'white' }}>Active</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                            <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                        </View></View></TouchableOpacity>
                                </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                        <TouchableOpacity style={{ marginRight: 15, marginLeft: 0 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.Inactivestatus}>
                                            <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                                <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                            </View></View></TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.activestatus}>
                                            <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                                <Text style={{ color: 'white' }}>Inactive</Text>
                                            </View></View></TouchableOpacity>
                                    </View>}
                            </View></View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.fontSizeCss}>Start Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons size={20} style={styles.IconCss} name='calendar-clock' />
                            <DatePicker
                                date={this.state.start_date}
                                mode="date"
                                placeholder="Start Date"
                                format="MM/DD/YYYY"
                                // maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 }
                                }}
                                onDateChange={(start_date) => { this.setState({ start_date }); }}
                            /></View>
                        {this.state.status == 'Inactive' ?
                            <View><View style={{ marginTop: 15 }}>
                                <Text style={style.fontSizeCss}>End Date</Text>
                            </View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingTop: 2, paddingBottom: 3 }}>
                                    <MaterialCommunityIcons size={20} style={styles.IconCss} name='calendar-clock' />
                                    <DatePicker
                                        date={this.state.end_date}
                                        mode="date"
                                        placeholder="End Date"
                                        minDate={this.state.start_date}
                                        format="MM/DD/YYYY"
                                        // maxDate={this.state.todayDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 3 },
                                            dateText: { marginTop: 3 }
                                        }}
                                        onDateChange={(end_date) => {
                                            if (new Date(end_date) <= new Date(this.state.start_date)) {
                                                ToastAndroid.show('Date Started and Date ended cannot be same', ToastAndroid.SHORT);
                                                return false;
                                            } this.setState({ end_date });
                                        }}
                                    /></View></View> :
                            <View />
                        }
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 10, fontSize: 17 }}>Medicine Category</Text>
                            <Dropdown
                                baseColor="#000"
                                //  label='Medicine Category'
                                data={this.state.MedCategory}
                                labelHeight={9}
                                textColor='#746E6E'
                                selectedItemColor='#41b4af'
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                value={this.state.medicineCategorySelectedItem}
                                onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.MedCategory, 'MedicineCategory'
                                )}
                            />
                        </View>
                        <View style={{ marginTop: 15, marginBottom: 10 }}>
                            <Text style={{ marginBottom: 15, fontSize: 17 }}>This Medication Is Based On Visit?</Text>
                            {this.state.medicationAllergy == 'Yes' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeVisitData('Yes')}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 3, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                        <Text style={{ color: 'white' }}>Yes</Text>
                                    </View></View></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeVisitData('No')}><View style={styles.Inactivestatus}>
                                    <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                        <Text style={{ color: '#cdcdcd' }}>No</Text>
                                    </View></View></TouchableOpacity>
                            </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeVisitData('Yes')}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                            <Text style={{ color: '#cdcdcd' }}>Yes</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.changeVisitData('No')}><View style={styles.activestatus}>
                                        <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                            <Text style={{ color: 'white' }}>No</Text>
                                        </View></View></TouchableOpacity>
                                </View>}
                        </View>
                        {this.state.medicationAllergyView == 'Yes' ?
                            <View style={{ backgroundColor: '#fff', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {this.state.dropDownData.map(data => (

                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, paddingTop: 0, marginTop: 3 }}>{data.practiceName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <EvilIcons style={{}} size={20} name='calendar' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {Moment(data.encounterDate).format('MM/DD/YYYY')}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <MaterialCommunityIcons style={{ marginLeft: 5 }} size={20} name='hospital-building' />
                                                <Text style={{ fontSize: 14, color: '#767575', marginLeft: 10 }}>
                                                    {data.visitType}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                                                <TouchableOpacity style={{ borderRadius: 15, paddingTop: 3, paddingBottom: 3, paddingLeft: 10, paddingRight: 10, backgroundColor: '#F7F1FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3AA6CD' }} onPress={() => this.setState({ medicationAllergyView: 'No', visitId: data.visitId })}>
                                                    <View style={{ borderRadius: 12, backgroundColor: '#F7F1FF', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#000' }}>Select</Text></View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            : null}

                        <View style={styles.inputField}>
                            <AntDesign size={20} style={styles.IconCss} name='medicinebox' />
                            <TextInput
                                placeholder={'Enter Illness'}
                                secureTextEntry={false}
                                fontSize={18}
                                style={{ width: '100%' }}
                                maxLength={100}
                                placeholderTextColor='#938F97'
                                value={this.state.illness}
                                onChangeText={(illness) => this.setState({ illness })}
                            />
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '48%' }}>
                                <View style={{ marginTop: 15 }}>
                                    <Text style={{ marginBottom: 10, fontSize: 17 }}>Dosage</Text>
                                    <TextInput
                                        placeholder={'Dosage Count'}
                                        keyboardType={'numeric'}
                                        maxLength={15}
                                        style={{ width: '100%', marginTop: 10, marginBottom: 5, height: 30, borderBottomWidth: 0.4, borderBottomColor: 'grey', fontSize: 18 }}
                                        value={this.state.dose}
                                        placeholderTextColor='#938F97'
                                        secureTextEntry={false}
                                        onChangeText={(dose) => this.setState({ dose })}
                                    /></View>
                            </View>
                            <View style={{ width: '4%' }}></View>
                            <View style={{ width: '48%' }}>
                                <View style={{ marginTop: 15 }}>
                                    <Text style={{ marginBottom: 10, fontSize: 17 }}>Unit</Text>
                                    <Dropdown
                                        baseColor="#000"
                                        data={this.state.dose_unit}
                                        labelHeight={8}
                                        fontSize={14}
                                        textColor='#746E6E'
                                        selectedItemColor='#41b4af'
                                        value={this.state.dose_unitSelectedItem}
                                        inputContainerStyle={styles.dropdownCss}
                                        onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.dose_unit, 'DoseUnit')}
                                    /></View></View>
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 10, fontSize: 17 }}>Applied To / Taken for</Text>
                            <Dropdown
                                baseColor="#000"
                                data={this.state.appliedData}
                                value={this.state.applied}
                                labelHeight={9}
                                fontSize={14}
                                textColor='#746E6E'
                                inputContainerStyle={styles.dropdownCss}
                                selectedItemColor='#41b4af'
                                onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.appliedData, 'AppliedTo')}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons size={20} style={styles.IconCss} name='folder-clock-outline' />
                            <TextInput
                                placeholder={'Instructions'}
                                maxLength={500}
                                fontSize={18}
                                style={{ width: '100%' }}
                                placeholderTextColor='#938F97'
                                value={this.state.instructions}
                                onChangeText={(instructions) => this.setState({ instructions })}
                            />
                        </View>
                        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => { this.addNotes(); }} >
                            <View style={styles.notes}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={styles.icons1} size={17} name='note' />
                                    <Text style={styles.boxTextCss}>Notes</Text>
                                </View>
                                {!this.state.addNotes ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                            </View></TouchableOpacity>
                        {this.state.addNotes ?
                            <TextInput
                                style={styles.inputField}
                                placeholder={'Note'}
                                placeholderTextColor='#938F97'
                                onChangeText={(notes) => this.setState({ notes })}
                                maxLength={100}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveMedication(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Medication
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    boxTextCss: {
        color: '#000', marginLeft: 5, fontSize: 17
    },
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#8dd5ee',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 1.2,
        flexDirection: 'row'
    },
    IconCss: {
        marginTop: 5, marginRight: 10
    },
    fontSizeCss: {
        marginBottom: 5, fontSize: 17
    },
    dropdownCss: {
        borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf'
    },
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 4
    },
    plusCircleIcon: {
        color: '#000', marginTop: 3, marginRight: 5
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
    activestatus: {
        borderRadius: 8, borderColor: 'white', backgroundColor: '#2fd473', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },

    Inactivestatus: {
        borderRadius: 6, borderColor: '#cdcdcd', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    }
});

export default AddMedication;