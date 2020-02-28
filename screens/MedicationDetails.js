/* eslint - disable no - undef * /
/* eslint-disable camelcase */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, AsyncStorage, View, Dimensions, ToastAndroid, TextInput, NetInfo, Platform } from 'react-native';
import Moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { EvilIcons, MaterialCommunityIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import Utility from '../components/Utility';
import {
    GET_MEDICATION_BY_ID, GET_VISIT, TREATMENT_CATEGORIES, MEDICATION_UNITS, MEDICATION_METHODS, DELETE_MEDICATION, UPDATE_MEDICATION,
    HOSP_GET_MEDICATION_BY_ID, HOSP_GET_VISIT, HOSP_TREATMENT_CATEGORIES, HOSP_MEDICATION_UNITS, HOSP_MEDICATION_METHODS, HOSP_UPDATE_MEDICATION, HOSP_DELETE_MEDICATION
} from '../constants/APIUrl';
import { CLINICAL_DOCS_UPDATE_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
let GET_MEDICATION_BY_ID_URL = GET_MEDICATION_BY_ID;
let GET_VISIT_URL = GET_VISIT;
let TREATMENT_CATEGORIES_URL = TREATMENT_CATEGORIES;
let MEDICATION_UNITS_URL = MEDICATION_UNITS;
let MEDICATION_METHODS_URL = MEDICATION_METHODS;
let DELETE_MEDICATION_URL = DELETE_MEDICATION;
let UPDATE_MEDICATION_URL = UPDATE_MEDICATION;

const data = [{ value: 'Yes' }, { value: 'No' }];
const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class MedicationDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = { access_token: '', visitId: '', dataSource: '', addNotes: false, medicationAllergy: '', user_id: '', facility: '', Illness: '', visitedDate: today, encounterDate: '', practiceName: '', otherName: '', VisitType: '', description: '', dosage: '', dosageSelectedItem: '', medUnitData: [], medUnitSelectedItem: '', isLoading: true, medicationResp: [], showMenu: false, refreshing: false, backPress: 1, todayDate: today, med_name: '', dose: '', dose_unit: [], dose_unitSelectedItem: ' ', applied: '', instructions: '', medvisit: [], medvisitSeletedItem: '', medcat: '', status: 'Active', reason: '', note: '', start_date: '', end_date: '', medicineCategoryDate: [], appliedData1: [], medicineCategorySelectedItem: '', IsControlEnabled: true, medicationAllergyView: 'No' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {

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
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        console.log('USER_DATA', USER_DATA);
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        GET_MEDICATION_BY_ID_URL = GET_MEDICATION_BY_ID;
        GET_VISIT_URL = GET_VISIT;
        TREATMENT_CATEGORIES_URL = TREATMENT_CATEGORIES;
        MEDICATION_UNITS_URL = MEDICATION_UNITS;
        MEDICATION_METHODS_URL = MEDICATION_METHODS;
        DELETE_MEDICATION_URL = DELETE_MEDICATION;
        UPDATE_MEDICATION_URL = UPDATE_MEDICATION;
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            GET_MEDICATION_BY_ID_URL = USER_DATA.ServiceURL + HOSP_GET_MEDICATION_BY_ID;
            GET_VISIT_URL = USER_DATA.ServiceURL + HOSP_GET_VISIT;
            TREATMENT_CATEGORIES_URL = USER_DATA.ServiceURL + HOSP_TREATMENT_CATEGORIES;
            MEDICATION_UNITS_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_UNITS;
            MEDICATION_METHODS_URL = USER_DATA.ServiceURL + HOSP_MEDICATION_METHODS;
            UPDATE_MEDICATION_URL = USER_DATA.ServiceURL + HOSP_UPDATE_MEDICATION;
            DELETE_MEDICATION_URL = USER_DATA.ServiceURL + HOSP_DELETE_MEDICATION;
        }
        const { params } = this.props.navigation.state;
        console.log("medparams", params);
        this.setState({
            access_token: USER_DATA.ACCESS_TOKEN,
            user_id: USER_DATA.User_Id,
            medicationId: params.medicationId,
            dataSource: params.dataSource,
            visitId: params.visitId,
            IsControlEnabled: params.dataSource == 'Patient',
            medicationAllergy: (!Utility.IsNullOrEmpty(params.visitId) && params.visitId != "0") ? data[0].value : data[1].value,
            medicationAllergyView: (!Utility.IsNullOrEmpty(params.visitId) && params.visitId != "0") ? data[0].value : data[1].value
        });
        this.getMedicationById();
        this.dosageUnit();
        this.appliedTo();
        this.medicineCategory();
        this.getVisit();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
    }

    /*********************************************GetMedication ById ****************************************************/
    getMedicationById = () => {
        fetch(`${GET_MEDICATION_BY_ID_URL}?medicationId=${this.state.medicationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `bearer ${this.state.access_token}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                console.log('res', res);
                const response = res;
                this.setState({
                    isLoading: false,
                    medicationResp: response.responseData,
                }, function () {
                    this.setValue(response.responseData);
                });
            }).catch(() => {
                this.setState({
                    isLoading: false,
                });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /****************************************************************************************************** */

    setDropdownItem = (value, index, data1, dropDownField) => {
        if (dropDownField == 'MedicineCategory') {
            this.setState({
                // medicineCategorySelectedItem: data1[index]._Id,
                medicineCategorySelectedItem: value.toString(),
            });
        } else if (dropDownField == 'TreatmentCategory') {
            this.setState({
                medUnitData: data1[index]._Id,
            });
        } else if (dropDownField == 'Dosage') {
            this.setState({
                dosageSelectedItem: data1[index].id,
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
    setValue = (medicationData) => {
        this.setState({
            med_name: Utility.IsNullOrEmpty(medicationData.drugName) ? 'drugName is missing' : medicationData.drugName,
            // other_name: Utility.IsNullOrEmpty(medicationData.genericName) ? 'No Data' : medicationData.genericName,
            start_date: Utility.IsNullOrEmpty(medicationData.dateStarted) ? '' : Moment(medicationData.dateStarted).format('MM/DD/YYYY'),
            end_date: Utility.IsNullOrEmpty(medicationData.dateStopped) ? '' : Moment(medicationData.dateStopped).format('MM/DD/YYYY'),
            dose_unitSelectedItem: Utility.IsNullOrEmpty(medicationData.dosageUnit) ? 'dosageUnit is missing' : Number(medicationData.dosageUnit),
            note: Utility.IsNullOrEmpty(medicationData.note) ? 'note is missing' : medicationData.note,
            medicineCategorySelectedItem: Utility.IsNullOrEmpty(medicationData.catagory) ? 'catagory is missing' : medicationData.catagory,
            applied: Utility.IsNullOrEmpty(medicationData.medicationTaken) ? 'medicationTaken is missing' : medicationData.medicationTaken,
            practiceName: Utility.IsNullOrEmpty(medicationData.practiceName) ? 'practiceName is missing' : medicationData.practiceName,
            visitedDate: Utility.IsNullOrEmpty(medicationData.visitDate) ? '' : medicationData.visitDate,
            // facility: medicationData.date,
            isActive: Utility.IsNullOrEmpty(medicationData.isActive) ? '' : medicationData.isActive,
            otherName: Utility.IsNullOrEmpty(medicationData.genericName) ? 'genericName is missing' : medicationData.genericName,
            Illness: Utility.IsNullOrEmpty(medicationData.illness) ? 'illness is missing' : medicationData.illness,
            VisitType: Utility.IsNullOrEmpty(medicationData.visitType) ? '' : medicationData.visitType,
            description: Utility.IsNullOrEmpty(medicationData.frequency) ? '' : medicationData.frequency,
            dosage: Utility.IsNullOrEmpty(medicationData.dosage) ? 'dosage is missing' : medicationData.dosage,
            status: Utility.IsNullOrEmpty(medicationData.status) ? 'status is missing' : medicationData.status,
            reason: Utility.IsNullOrEmpty(medicationData.reason) ? 'reason is missing' : medicationData.reason,
        });
    };

    /****************************Visit Type Api call**********************************************************************/
    getVisit = () => {
        fetch(`${GET_VISIT_URL}?PatientId=${this.state.user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then((response) => response.json()).then((res) => {
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
        });
    }
    /****************************************************************************************************************************** */
    changeVisitData = (val) => {
        if (val == 'Yes') {
            this.getVisit();
        }
        this.setState({
            medicationAllergy: val,
            medicationAllergyView: val
        });
    };
    /*********************************************************************************************************** */
    MedBasedVisit = (val) => {
        this.setState({
            medicationAllergy: val,
            medicationAllergyView: val
        });
    }
    medicineCategory = () => {
        fetch(TREATMENT_CATEGORIES_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData, 'MedicineCategory');
        });
    }
    changeMedicalStatus = (val) => {
        if (val == 'Inactive') {
            this.setState({
                status: 'Inactive',
                isActive: false
            });
        } else {
            this.setState({
                status: 'Active',
                isActive: true
            });
        }
    };
    changeDosage = (val) => {
        this.setState({
            dosage: val
        });
    };
    /*************************************************************************************************************************** */
    fetchDropdownData(apidata, dropDownField) {
        const DropDownItems = [];
        let i;
        if (dropDownField == 'MedicineCategory') {
            for (i = 0; i < apidata.length; i++) {
                DropDownItems.push({ value: apidata[i]._Id, label: apidata[i]._treatmentcategory });
            }
            this.setState({
                medicineCategoryData: DropDownItems,
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
                appliedData1: DropDownItems,
            });
        }
    }
    /*************************************dosageUnit Api Call ********************************************************************************/
    dosageUnit = () => {
        fetch(MEDICATION_UNITS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData, 'DoseUnit');
            // this.setState({
            // medUnitData: res.responseData.toString()
            // });
        });
    }
    /********************************************************************************************************************* */
    /*******************************Taken for/Applied To *****************************************************************/
    appliedTo = () => {
        fetch(MEDICATION_METHODS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData, 'AppliedTo');
            // this.setState({
            // medUnitData: res.responseData.toString()
            // });
        });
    }
    /*********************************************************************************************************************** */
    /*********************************Update Medication ************************************************************************************/
    updateMedication = () => {
        let VisitId = '';
        if (this.state.medicationAllergy == 'Yes') {
            VisitId = this.state.visitId;
        } else { VisitId = 0; }
        let endDate = '';
        if (this.state.med_name.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Medication name is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Medication name is mandatory');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.med_name.length <= 1) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Medication name is not valid',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Medication name is not valid');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.otherName.length <= 2) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Other name is not valid',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Other name is not valid');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.dosage <= 0 || this.state.dosage == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Dosage is required / not valid',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Dosage is required / not valid');
            } this.setState({
                isSending: false
            }); return;
        }
        if (this.state.isActive == false) {
            endDate = this.state.end_date;
            if (this.state.end_date == '') {
                ToastAndroid.showWithGravity(
                    'End Date shouldnot be empty',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ); this.setState({
                    isSending: false
                }); return;
            }
        } else {
            endDate = '';
        }
        //  if (Moment(this.state.end_date).isSameOrAfter(this.state.start_date)) {
        const MedicationData = {
            id: this.state.medicationId,
            patientId: this.state.user_id,
            illness: this.state.Illness,
            drugName: this.state.med_name,
            dosage: this.state.dosage,
            dosageUnit: this.state.dose_unitSelectedItem,
            medicationTaken: this.state.applied,
            frequency: '2',
            status: this.state.status,
            isActive: this.state.isActive,
            dateStarted: this.state.start_date,
            dateStopped: endDate,
            note: this.state.note,
            genericName: this.state.otherName,
            dataSource: this.state.dataSource,
            catagory: this.state.medicineCategorySelectedItem,
            visitId: VisitId
        };
        // const MedicationData = `id=${this.state.medicationId}&patientId=${this.state.user_id}&illness=${this.state.Illness}&drugName=${this.state.med_name}
        // &appointmentDate=${this.state.visitedDate}&reason=${this.state.reason}&dosage=${this.state.dosage}
        // &dosageUnit=${this.state.dose_unitSelectedItem}&medicationTaken=${
        //     this.state.applied}&frequency=null&status=${this.state.status}&isActive=${this.state.isActive}
        //     &dateStarted=${this.state.start_date}&dateStopped=${endDate}&note=${this.state.note}
        //     &genericName=${this.state.other_name}&catagory=${this.state.medicineCategorySelectedItem}&practiceName=${this.state.practiceName}&visitType=${this.state.VisitType
        //     }&visitId=${VisitId}&dataSource=${this.state.dataSource}&date=${this.state.encounterDate}`;
        console.log('MedicationData', MedicationData);
        fetch(UPDATE_MEDICATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
            body: JSON.stringify(MedicationData)
        }).then((response) => response.json()).then((res) => {
            console.log('updateres', res);
            if (res.statusCode == 200) {
                ToastAndroid.show(CLINICAL_DOCS_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('Medication');
                });
            }
        }).catch(err => {
            this.setState({
                isLoading: false,
            });
            const errMSg = '';// aPIStatusInfo.logError(err);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
        // } else if (Platform.OS !== 'ios') {
        //         ToastAndroid.showWithGravity(
        //             'Please enter Start date prior to End date',
        //             ToastAndroid.SHORT,
        //             ToastAndroid.CENTER,
        //         );
        //     } else {
        //         AlertIOS.alert('Please enter Start date prior to End date');
        //     }
    }
    /*...........................Delete User Record......................................................*/
    deleteMedication = (id) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async () => {
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        const data = `Id=${this.state.medicationId}`;
        fetch(DELETE_MEDICATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.access_token}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_DELETE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('Medication');
                    });
                }
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
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    /*..........................................................................................................................*/
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Medication Details....</Text>
                </View>
            );
        }
        return (
            // <CommonView customHeading='Medication'>
            <CommonView updateMedication>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4 }}>
                    <ScrollView style={{ paddingLeft: 6, paddingRight: 6 }} keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                        <View style={styles.inputField} >
                            <AntDesign size={20} style={{ marginTop: 5, marginRight: 10 }} name='medicinebox' />
                            <TextInput
                                placeholder={'Medicine Name'}
                                secureTextEntry={false}
                                fontSize={18}
                                value={this.state.med_name}
                                placeholderTextColor='#938F97'
                                onChangeText={(med_name) => this.setState({ med_name })}
                            />
                        </View>
                        <View style={{ flexDirection: "column", marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontSize: 17 }} >Status</Text>
                            {this.state.isActive == true ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeMedicalStatus('Active')}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                        <Text style={{ color: 'white' }}>Active</Text>
                                    </View></View></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeMedicalStatus('Inactive')}><View style={styles.Inactivestatus}>
                                    <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                        <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                    </View></View></TouchableOpacity>
                            </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeMedicalStatus('Active')}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                            <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.changeMedicalStatus('Inactive')}><View style={styles.activestatus}>
                                        <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                            <Text style={{ color: 'white' }}>Inactive</Text>
                                        </View></View></TouchableOpacity>
                                </View>}
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>Start Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons size={20} style={{ marginTop: 5, marginRight: 10 }} name='calendar-clock' />
                            <DatePicker
                                date={this.state.start_date}
                                mode="date"
                                placeholder="Start Date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 }
                                }}
                                onDateChange={(start_date) => { this.setState({ start_date }); }}
                            /></View>
                        {this.state.isActive == false ?
                            <View><View style={{ marginTop: 15 }}>
                                <Text style={{ marginBottom: 5, fontSize: 17}}>End Date</Text>
                            </View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingTop: 2, paddingBottom: 3 }}>
                                    <MaterialCommunityIcons size={20} style={{ marginTop: 5, marginRight: 10 }} name='calendar-clock' />
                                    <DatePicker
                                        // style={{ width: '80%', backgroundColor: 'transparent', flex: 1 }}
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
                                data={this.state.medicineCategoryData}
                                labelHeight={9}
                                textColor='#746E6E'
                                selectedItemColor='#41b4af'
                                // containerStyle={{backgroundColor :"#dfdfdf",borderWidth:0,paddingLeft:5,paddingTop:0,paddingBottom:0}}
                                // dropdownOffset={{ top: 10, left:0 }}
                                // pickerStyle={{backgroundColor : "#cacaca",borderWidth:0,marginLeft:20}}
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                value={this.state.medicineCategorySelectedItem}
                                onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.medicineCategoryData, 'MedicineCategory')}
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
                                        style={{ width: '100%', marginTop: 10, marginBottom: 5, height: 30, borderBottomWidth: 0.4, borderBottomColor: 'grey',fontSize: 18 }}
                                        value={this.state.dosage}
                                        placeholderTextColor='#938F97'
                                        // inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                        secureTextEntry={false}
                                        onChangeText={(dosage) => this.setState({ dosage })}
                                    /></View>
                            </View>
                            <View style={{ width: '4%' }}></View>
                            <View style={{ width: '48%' }}>
                                <View style={{ marginTop: 15 }}>
                                    <Text style={{ marginBottom: 10, fontSize: 17 }}>Unit</Text>
                                    <Dropdown
                                        baseColor="#000"
                                        // label='Unit'
                                        data={this.state.dose_unit}
                                        labelHeight={8}
                                        fontSize={14}
                                        textColor='#746E6E'
                                        selectedItemColor='#41b4af'
                                        value={this.state.dose_unitSelectedItem}
                                        inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                        onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.dose_unit, 'DoseUnit')}
                                    /></View></View>
                        </View>

                        <View style={styles.inputField}>
                            <AntDesign size={20} style={{ marginTop: 5, marginRight: 10 }} name='medicinebox' />
                            <TextInput
                                placeholder={'Enter Illness'}
                                secureTextEntry={false}
                                fontSize={18}
                                maxLength={100}
                                placeholderTextColor='#938F97'
                                value={this.state.Illness}
                                onChangeText={(Illness) => this.setState({ Illness })}
                            />
                        </View>
                        <View style={{ marginTop: 15, marginBottom: 10 }}>
                            <Text style={{ marginBottom: 15, fontSize: 17 }}>This Medication Based On Visit?</Text>
                            {this.state.medicationAllergy == 'Yes' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeVisitData('Yes')}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

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

                        {/* <Dropdown
                            baseColor="#000"
                            label='This Medication is based on Visit?'
                            data={data1}
                            labelHeight={12}
                            fontSize={15}
                            textColor='#746E6E'
                            selectedItemColor='#41b4af'
                            value={this.state.medicationAllergy}
                            onChangeText={(val, index, data) => this.changeVisitData(val, index, data)} /> */}

                        {this.state.medicationAllergyView == 'Yes' ?
                            <View style={{ backgroundColor: '#fff', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {Utility.IsNullOrEmpty(this.state.dropDownData) ? null : this.state.dropDownData.map(data => (
                                    <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, paddingTop: 0, marginTop: 3 }}>{data.practiceName}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4, paddingLeft: 15, paddingRight: 15 }}>

                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1 }}>
                                                <EvilIcons style={{   }} size={20} name='calendar' />
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
                                                    <View style={{ borderRadius: 12, backgroundColor: '#F7F1FF', justifyContent: 'center', alignItems: 'center'  }}><Text style={{ color: '#000' }}>Select</Text></View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            : null}
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 10,fontSize: 17 }}>Applied To / Taken for</Text>
                            <Dropdown
                                baseColor="#000"
                                // label='Applied To / Taken for'
                                data={this.state.appliedData1}
                                value={this.state.applied}
                                labelHeight={9}
                                fontSize={14}
                                textColor='#746E6E'
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                selectedItemColor='#41b4af'
                                onChangeText={(val, index) => this.setDropdownItem(val, index, this.state.appliedData, 'AppliedTo')}
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
                                onChangeText={(note) => this.setState({ note })}
                                maxLength={100}
                            /> : null}
                        {this.state.dataSource == 'Patient' ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.updateMedication(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '12%' }} />
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.deleteMedication(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            null}
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
    label_text: {
        fontSize: 14, color: 'black', fontWeight: 'bold'
    },
    boxTextCss: {
        color: '#000', marginLeft: 5, fontSize:17
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
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 4
    },
    staralign: {
        fontSize: 15, color: 'red'
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
export default MedicationDetails;