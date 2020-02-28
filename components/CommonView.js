/* eslint-disable max-len */
/* eslint-disable object-property-newline */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Image, StyleSheet, Text, AsyncStorage, View, ImageBackground, Dimensions, StatusBar, ToastAndroid } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import SideBarMenu from "../components/SideBarMenu";
import CommonHeader from "../components/CommonHeader";
import CommonFooter from "../components/CommonFooter";
import CustomSearch from "../components/CustomSearch";
import Drawer from 'react-native-drawer';
import { withNavigation } from 'react-navigation';
import {
    MEDICATION_LIST, GET_PRESCRIPTION_DETAILS, CLINICAL_DOCUMENT, ADD_ENCOUNTER, GET_TEST_RESULT, GET_ALL_HOSPITAL, GET_MY_HOSPITAL,
    ADD_DISCHARGE_DETAILS, FAMILY_HISTORY, IMMUNIZATION, RECORD_ACCESS_LIST, ADD_PROBLEM, GET_BILL_DETAILS, ALLERGY_DATA
} from '../constants/APIUrl';
import aPIStatusInfo from "../components/ErrorHandler";
import Utility from '../components/Utility';
const USER_RECORD_EMPTY_ERROR = "";

class CommonView extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            msgCount: 0, isFilterActive: false, loadingMsg: 'Preparing Dashboard...', FilteredData: [], MessageResp: [],
            Userid: '', AccountId: '', AccessToken: '', HOSP_USER_DATA: '', UserRecordResp: [], targetPageName: '', gender: '', height: '', weight: '', dob: '', login_text: 'Login Securely', showMenu: false, isLoading: true, otpDialogVisible: false, showSearch: false
            , AppointmentResp: []
        }
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                const messageCount = await AsyncStorage.getItem('UNREAD_MESSAGE');
                let HOSP_USER_DATA = '';
                if (USER_DATA.hasOwnProperty('Hospital')) {
                    HOSP_USER_DATA = USER_DATA.Hospital;
                }
                this._isMounted = true;
                if (this._isMounted) {
                    this.setState({
                        AccessToken: USER_DATA.ACCESS_TOKEN,
                        Userid: USER_DATA.User_Id,
                        AccountId: USER_DATA.Id,
                        msgCount: messageCount, originalData: [],
                        HOSP_USER_DATA: HOSP_USER_DATA
                    }, function () {
                        this.appointmentData();
                    });
                }
            }
        );
    }
    async componentDidMount() {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        const messageCount = await AsyncStorage.getItem('UNREAD_MESSAGE');
        let HOSP_USER_DATA = '';
        if (USER_DATA.hasOwnProperty('Hospital')) {
            HOSP_USER_DATA = USER_DATA.Hospital;
        }
        this._isMounted = true;
        if (this._isMounted) {
            this.setState({
                AccessToken: USER_DATA.ACCESS_TOKEN,
                Userid: USER_DATA.User_Id,
                AccountId: USER_DATA.Id,
                msgCount: messageCount, originalData: [],
                HOSP_USER_DATA: HOSP_USER_DATA
            }, function () {
                this.medicationData();
                this.getUserRecord();
                this.RefreshAllergyData();
                this.problemData();
                this.visitsDataRefresh();
                this.dischargeDetails();
                this.FamilyHistory();
                this.immunizationData();
                this.getHospitalData();
                this.testProcedureData();
                this.getBillList();
                this.getPrescriptionList();
                this.clinicalDocumentsData();
                this.appointmentData();
            });
        }
    }
    /******************************************************************************************************************** */
    visitsDataRefresh = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = ADD_ENCOUNTER;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/Encounter";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.setState({ visitDetails: res.responseData.encounters });
        })
            .catch(() => {
            });
    }
    /******************************************************************************************** */
    dischargeDetails = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = ADD_DISCHARGE_DETAILS;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/DischargeInstruction";
            userID = this.state.HOSP_USER_DATA.User_Id;
            accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((resp) => {
            this.setState({
                dischargeResp: resp.responseData.dischargeNotes,
            });
        })
            .catch(() => {
            });
    }
    /**************************************************************************************************************** */
    FamilyHistory = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = FAMILY_HISTORY;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/FamilyHistory";
            userID = this.state.HOSP_USER_DATA.User_Id;
            accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            }
        }).then((response) => response.json()).then((response) => {
            this.setState({
                familyResp: response.responseData.familyHistories,
                originalData: response.responseData.familyHistories
            });
        }).catch(() => {
        });
    }
    /******************************************************************************************************************** */
    immunizationData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = IMMUNIZATION;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/Immunization";
            userID = this.state.HOSP_USER_DATA.User_Id;
            accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.setState({
                immunizationResp: res.responseData.immunizations,
            });
        }).catch(() => {
        });
    }
    getUserRecord = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = RECORD_ACCESS_LIST;
            userID = this.state.AccountId,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/RecordAccessService/RecordAccessList";
            userID = this.state.HOSP_USER_DATA.Id;
            accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?AccountId=${userID}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${accessToken}`,
                'access_token': `${accessToken}`,
                'token_type': 'bearer'
            },
        })
            .then((response) => response.json())
            .then((res) => {
                this.setState({
                    UserRecordResp: res.responseData, isLoading: false, refreshing: false
                });
            }).catch(() => {
            });
    }
    /*******************************************Problem API ******************************************************/
    problemData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = ADD_PROBLEM;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/Problem";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((response) => {
            this.setState({
                probResp: response.responseData.problems,
            });
        })
            .catch(() => {
            });
    }
    /**************************************BillPay List **************************************************************/
    getBillList = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = GET_BILL_DETAILS;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/BillPayService/GetAllBillDetails";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?Id=${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((resp) => {
            this.setState({
                isLoading: false,
                refreshing: false,
                billResp: resp.responseData,
                originalData: resp.responseData
            });
        }).catch(() => {
        });
    }
    /******************************************************************************************************************** */
    medicationData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = MEDICATION_LIST;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/Medication";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.setState({
                medicationResp: res.responseData.medications,
            });
        })
            .catch(() => {
            });
    }
    /*********************************************************Clinical Documents ***************************************************/
    clinicalDocumentsData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = CLINICAL_DOCUMENT;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/ClinicalDocument";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&PageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                this.setState({
                    clinicalDocsData: res.responseData.clinicalDocuments,
                });
            })
            .catch(() => {
            });
    }
    /******************************************************************************************************************************************************************** */
    RefreshAllergyData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = ALLERGY_DATA;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/Allergy";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => response.json()).then((res) => {
                this.setState({
                    allergyResp: res.responseData.allergies,
                });
            }).catch(() => {
            });
    }
    /**************************************Hospital Data *********************************************************************/
    getHospitalData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = GET_ALL_HOSPITAL;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/LocationService/GetAllLocations";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((resp) => resp.json()).then((res) => {
            this.setState({
                myHospitals: res.responseData,
                myHospitalsId: res.responseData.locationId
            });
            let url = '', userID = '', accessToken = '';
            if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == false) {
                url1 = GET_MY_HOSPITAL;
                userID = this.state.Userid,
                    accessToken = this.state.AccessToken;
            }
            else {
                url1 = this.state.HOSP_USER_DATA.ServiceURL + "api/LocationService/Locations";
                userID = this.state.HOSP_USER_DATA.User_Id,
                    accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
            }
            fetch(`${url1}?patientId=${userID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${accessToken}`,
                },
            }).then((resp) => resp.json()).then((response) => {
                this.setState({
                    hospitalResp: response.responseData,
                });
            }).catch(() => {
            });
        }).catch(() => {
        });
    }
    /***********************Appointment API Call *************************************************************************/
    appointmentData = () => {
        let url = '', AccountId = '', accessToken = '';
        console.log("appp", this.state.HOSP_USER_DATA.ServiceURL + "api/AppointmentService/AllAppointments")
        if (this.state.HOSP_USER_DATA.hasOwnProperty("ServiceURL")) {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/AppointmentService/AllAppointments";
            AccountId = this.state.HOSP_USER_DATA.Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        } else return;
        // fetch(`${url}?accountId=${AccountId}`, {
        fetch(url, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((response) => {
            console.log("AppointmentResp", response)
            this.setState({
                AppointmentResp: response.responseData
            });
        })
            .catch(() => {
            });
    }
    /**********************************************Test & Procedure ***********************************/
    testProcedureData = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = GET_TEST_RESULT;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PatientHealthProfile/TestResult";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?patientId=${userID}&pageNumber=1&pageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.setState({
                isLoading: false,
                testProcedureResp: res.responseData.testResults,
            });
        }).catch(() => {
        });
    }
    /******************************Prescriptions ************************************************************/
    getPrescriptionList = () => {
        let url = '', userID = '', accessToken = '';
        if (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) || this.state.HOSP_USER_DATA.AppointmentLogin == true) {
            url = GET_PRESCRIPTION_DETAILS;
            userID = this.state.Userid,
                accessToken = this.state.AccessToken;
        }
        else {
            url = this.state.HOSP_USER_DATA.ServiceURL + "api/PrescriptionService/GetAllPrescription";
            userID = this.state.HOSP_USER_DATA.User_Id,
                accessToken = this.state.HOSP_USER_DATA.ACCESS_TOKEN;
        }
        fetch(`${url}?Id=${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((response) => response.json()).then((resp) => {
            this.setState({
                prescriptionResp: resp.responseData,
            });
        }).catch((error) => {
        });
    }
    updateParentState(data) {
        this.props.updateParentState(data);
    }
    searchData(data) {
        this.props.searchData(data);
    }
    /***********************************************Search Data ******************************************************/
    componentWillUnmount() {
        this._isMounted = false;
    }
    searchLocal = (key) => {
        let sortedData = [];
        const filterPage = this.props.customHeading;
        if (key.length >= 1) {

            if (filterPage == 'Record Access') {
                sortedData = this.state.UserRecordResp.filter(function (item) {
                    return item.firstName.toUpperCase().indexOf(key.toUpperCase()) > -1 || item.lastName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                })
                this.updateParentState({ FilteredData: sortedData });
            } else
                if (this.props.msgHeading == 'Message') {
                    sortedData = this.state.MessageResp.filter(function (item) {
                        return item.subject.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (filterPage == 'Record Access') {
                    sortedData = this.state.UserRecordResp.filter(function (item) {
                        return item.firstName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    });
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Allergy') {

                    sortedData = this.state.allergyResp.filter(function (item) {
                        return item.allergyName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Medical Problems') {

                    sortedData = this.state.probResp.filter(function (item) {
                        return item.problemName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Family History') {

                    sortedData = this.state.familyResp.filter(function (item) {
                        return item.relativeFirstName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Visits') {

                    sortedData = this.state.visitDetails.filter(function (item) {
                        return item.facility.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Discharge Details') {

                    sortedData = this.state.dischargeResp.filter(function (item) {
                        return item.instructions.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Immunization') {

                    sortedData = this.state.immunizationResp.filter(function (item) {
                        return item.immunizationName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Hospitals') {

                    sortedData = this.state.hospitalResp.filter(function (item) {
                        return item.name.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Hospitals') {

                    sortedData = this.state.myHospitals.filter(function (item) {
                        return item.name.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Test & Procedures') {
                    sortedData = this.state.testProcedureResp.filter(function (item) {
                        return item.nameOfTest.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Medication') {
                    sortedData = this.state.medicationResp.filter(function (item) {
                        return item.drugName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'BillPay') {
                    sortedData = this.state.billResp.filter(function (item) {
                        return item.billType.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Clinical Documents') {
                    sortedData = this.state.clinicalDocsData.filter(function (item) {
                        return item.fileName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Appointments') {
                    console.log("artt", this.props.HOSP_USER_DATA);
                    sortedData = this.props.HOSP_USER_DATA.filter(function (item) {
                        return item.physicianName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
                else if (this.props.customHeading == 'Prescriptions') {
                    sortedData = this.state.prescriptionResp.filter(function (item) {
                        return item.physicianName.toUpperCase().indexOf(key.toUpperCase()) > -1;
                    })
                    this.updateParentState({ FilteredData: sortedData });
                }
        } else if (key.length == 0) {
            if (this.props.msgHeading == 'Message') {
                this.updateParentState({ FilteredData: this.state.MessageResp });
            }
            else if (filterPage == 'Record Access') {
                this.updateParentState({ FilteredData: this.state.UserRecordResp });
            }
            else if (this.props.customHeading == 'Allergy') {
                this.updateParentState({ FilteredData: this.state.allergyResp });
            }
            else if (this.props.customHeading == 'Medication') {
                this.updateParentState({ FilteredData: this.state.medicationResp });
            }
            else if (this.props.customHeading == 'Visits') {
                this.updateParentState({ FilteredData: this.state.visitDetails });
            }
            else if (this.props.customHeading == 'Discharge Details') {
                this.updateParentState({ FilteredData: this.state.dischargeResp });
            }
            else if (this.props.customHeading == 'Test & Procedures') {
                this.updateParentState({ FilteredData: this.state.testProcedureResp });
            }
            else if (this.props.customHeading == 'Family History') {
                this.updateParentState({ FilteredData: this.state.familyResp });
            }
            else if (this.props.customHeading == 'Immunization') {
                this.updateParentState({ FilteredData: this.state.immunizationResp });
            }
            else if (this.props.customHeading == 'Medical Problems') {
                this.updateParentState({ FilteredData: this.state.probResp });
            }
            else if (this.props.customHeading == 'Hospitals') {
                this.updateParentState({ FilteredData: this.state.hospitalResp });
            }
            else if (this.props.customHeading == 'Hospitals') {
                this.updateParentState({ FilteredData: this.state.myHospitals });
            }
            else if (this.props.customHeading == 'BillPay') {
                this.updateParentState({ FilteredData: this.state.billResp });
            }
            else if (this.props.customHeading == 'Prescriptions') {
                this.updateParentState({ FilteredData: this.state.prescriptionResp });
            }
            else if (this.props.customHeading == 'Appointments') {
                this.updateParentState({ FilteredData: this.props.HOSP_USER_DATA });
            }
            else if (this.props.customHeading == 'Clinical Documents') {
                this.updateParentState({ FilteredData: this.state.clinicalDocsData });
            }
            // else
            //     if (filterPage == 'Record Access') {
            //     }
        }
    };
    /************************************************************************************************************** */
    render() {
        const { goBack } = this.props.navigation;
        if (this.props.isLoginScreen) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 20, paddingRight: 20, backgroundColor: '#3AA6CD' }}>
                    <StatusBar hidden />
                    {(this.props.showBack) ?
                        <View style={{ width: '11%', }}>
                            <MaterialCommunityIcons onPress={() =>
                                goBack()}
                                style={{
                                    fontSize: 35,
                                    top: 20,
                                    textAlign: 'center',
                                    color: 'white',
                                    position: 'absolute',
                                    left: 10,
                                }}
                                name='keyboard-backspace' /></View>
                        :
                        null
                    }
                    <Image source={require('../assets/images/Heal-logo-white.png')} style={{
                        marginLeft: (Dimensions.get("window").width / 3) - 10,
                        width: (Dimensions.get("window").width / 4) + 20,
                        height: (Dimensions.get("window").width / 4) / 2,
                    }} />

                    {this.props.children}
                </View>
            );
        } else {
            return (<Drawer
                open={this.state.showMenu}
                content={<SideBarMenu />}
                type="overlay"
                openDrawerOffset={0.3}
                closedDrawerOffset={0}
                tapToClose={true}
                onClose={() => this.closeDrawer()}
                styles={drawerStyles}
                tweenHandler={(ratio) => ({
                    main: { opacity: (2 - ratio) / 2 }
                })}
                side={'right'}
                elevation={4}
            >
                <View style={{ flex: 1 }}>
                    <ImageBackground source={require('../assets/images/BG-full.jpg')}
                        style={styles.backgroundImage}>
                        {/* <View style={{ backgroundColor: '#3AA6CD', paddingBottom: 4 }}> */}
                        <View>
                            <Image source={require('../assets/images/HospitalBGHeader.png')} style={{ width: '20%', height: '20%' }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: !this.props.isDashboard ? 'space-between' : 'center', padding: 7 }}>
                                {!this.props.isDashboard && !this.props.EmergencyCardData && this.props.customHeading != 'Appointments' ?
                                    <View style={{ width: '11%' }} >
                                        <MaterialCommunityIcons onPress={() => goBack()}
                                            style={{ fontSize: 25, textAlign: 'center', color: '#000' }}
                                            name='keyboard-backspace' /></View>
                                    :
                                    null
                                }
                                {this.props.EmergencyCardData || this.props.customHeading == 'Appointments' ?
                                    <View style={{ width: '11%' }} >
                                        <MaterialCommunityIcons onPress={() => (Utility.IsNullOrEmpty(this.state.HOSP_USER_DATA) ? this.props.navigation.navigate("Dashboard") : this.props.navigation.navigate("HospitalDashboard"))}
                                            style={{ fontSize: 25, textAlign: 'center', color: '#000' }}
                                            name='keyboard-backspace' /></View>
                                    :
                                    null
                                }
                                {!this.props.isDashboard ?
                                    <View style={{ width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 5, flexDirection: 'row' }} >
                                        <Text style={styles.textTopField}>
                                            {this.props.customHeading}
                                        </Text>
                                    </View>
                                    :
                                    this.props.isHospitalDashboard ? <View style={{ flexDirection: 'row', justifyContent: 'center', top: 3 }}>
                                        <View style={{ width: '11%' }} >
                                            <MaterialCommunityIcons onPress={() => goBack()}
                                                style={{ fontSize: 35, textAlign: 'center', color: '#000' }}
                                                name='keyboard-backspace' /></View>
                                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                            <View style={{ marginRight: 15 }}>
                                                <View style={styles.CircleShapeView} >
                                                    <Image source={require('../assets/images/narayana.png')}
                                                        style={{ marginLeft: 5, width: 40, height: 40, marginTop: 5 }} />

                                                </View>
                                            </View>
                                            <View style={{ alignItems: "center", margin: 12 }}>
                                                <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>Narayana Hospital </Text>
                                            </View>
                                        </View>
                                        <View>

                                        </View>
                                    </View> : <CommonHeader />
                                }
                                {!this.props.isDashboard ?
                                    <Feather onPress={() => this.toggleDrawer()}
                                        style={{ fontSize: 30, textAlign: 'center', color: '#000', position: 'absolute', top: 10, right: 10 }} name='align-left' />
                                    :
                                    <Feather onPress={() => this.toggleDrawer()}
                                        style={{ fontSize: 30, textAlign: 'center', color: '#000', position: 'absolute', top: 10, right: 10 }} name='align-left' />
                                }
                            </View>
                            {this.props.OtherScreen ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Signup </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.DischargeDetails ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Discharge Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.messageDetails ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Messages </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddUser ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add User </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddMedication ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Medication </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.updateMedication ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Update Medication </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.VitalsHistory ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Vital History </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.UpdateUser ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Update User </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.GeneralInfo ?
                                <View style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> General Info </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.ClinicalInfo ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Clinical Info  </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.PatientEducation ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Patient Search </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddAllergy ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Allergy </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.Allergies ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Allergies </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddProblem ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Problem </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.PatientEducationSearch ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Patient Search  </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.EmergencyCardData ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Emergency Card  </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.problemsDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Medical Problem Details  </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.VisitDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>
                                        Visit Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddVisit ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Visit </Text>
                                </View>
                                :
                                null
                            }
                            {this.state.DischargeDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Discharge Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.SearchDoctorsBook ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Search Doctors & Book </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.HealthTracker ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Health Tracker </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddHealthTracker ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Health Tracker </Text>
                                </View>
                                :
                                null
                            }
                                                        {this.props.HealthTrackerDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Health Tracker Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.FamilyHistory ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Family History </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.SocialHistory ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>Add Social History </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddImmunization ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Immunization </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.ImmunizationDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Immunization Detail </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.FamilyDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Family Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddReminder ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Add Reminder </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.EmergencyCard ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "center", alignItems: "center", flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}></Text>
                                </View>
                                :
                                null
                            }
                            {this.props.Reminder ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Reminder </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.Campaigns ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Campaigns </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.BillPayDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Payment Details </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.TestProcedure ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Test Procedure </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddTestOrProcedure ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Add Test Or Procedure </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.Appointments ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Appointments </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.changePassword ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Change Password </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddClinicalDocument ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Add Clinical Document </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.Appointments ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}>  Appointments </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.ComposeMessages ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Compose Message </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AddPrescription ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Prescriptions </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.AppointmentDetails ?
                                <View
                                    style={{ backgroundColor: "#3AA6CD", width: Dimensions.get("window").width, justifyContent: "flex-start", alignItems: "flex-start", marginLeft: 35, flexDirection: 'row' }} >
                                    <Text style={styles.SignUpHeader}> Appointment Details </Text>
                                </View>
                                :
                                null
                            }
                            {!this.props.isDashboard && !this.props.OtherScreen && !this.props.GeneralInfo && !this.props.ClinicalInfo && !this.props.EmergencyCardData && !this.props.EmergencyCard && !this.props.problemsDetails && !this.props.AddVisit && !this.props.DischargeDetails && !this.props.AddImmunization && !this.props.ImmunizationDetails && !this.props.SocialHistory && !this.props.updateMedication && !this.props.AddProblem && !this.props.Campaigns && !this.props.changePassword && !this.props.Appointments && !this.props.ComposeMessages
                                && !this.props.PatientEducation && !this.props.AddUser && !this.props.UpdateUser && !this.props.PatientEducationSearch && !this.props.VitalsHistory && !this.props.messageDetails && !this.props.VisitDetails && !this.props.DischargeDetails && !this.props.FamilyHistory && !this.props.FamilyDetails && !this.props.AddReminder && !this.props.AddMedication && !this.props.AddAllergy && !this.props.Allergies && !this.props.TestProcedure && !this.props.AddTestOrProcedure && !this.props.AddClinicalDocument
                                && !this.props.Reminder && !this.props.BillPayDetails && !this.props.AddPrescription && !this.props.AppointmentDetails && !this.props.AccountUpdate && !this.props.SearchDoctorsBook && !this.props.HealthTracker && !this.props.AddHealthTracker && !this.props.HealthTrackerDetails
                                ?
                                <View style={{ backgroundColor: "#F7F1FF", width: Dimensions.get("window").width, justifyContent: "center", paddingLeft: 5, alignItems: "center", flexDirection: 'row' }}>
                                    <View>
                                        <CustomSearch
                                            value={this.state.search}
                                            onChangeText={(searchText) => this.searchLocal(searchText)}
                                            onClear={() => this.searchLocal("")}
                                        />
                                        <Feather style={{ color: 'gray', fontWeight: 'bold', position: 'absolute', right: 15, top: 5 }} size={15} name='search' />
                                    </View>
                                    {/* <MaterialCommunityIcons onPress={() => this.props.filter({ 'data': this.state.isFilterActive == true ? false : true }, this.setState({ isFilterActive: !this.state.isFilterActive }))} style={{ color: 'white', marginLeft: 10 }} size={20} name='filter-variant' /> */}
                                </View>
                                :
                                null
                            }
                        </View>
                        {this.props.children}
                        {!this.props.OtherScreen && !this.props.PatientEducationSearch ? <CommonFooter /> : null}
                        {/* <CommonFooter messageCount={this.state.msgCount} /> */}
                    </ImageBackground>
                </View>
            </Drawer>);
        }
    };
    toggleDrawer = () => {
        if (this.state.showMenu) {
            this.setState({
                showMenu: false
            });
        } else {
            this.setState({
                showMenu: true
            });
        }
    }
    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    }
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    textTopField: {
        maxWidth: "100%",
        fontSize: 25,
        textAlign: 'center',
        color: "#000",
    },
    SignUpHeader: {
        maxWidth: "100%",
        fontSize: 25,
        textAlign: 'center',
        color: "#000",
        position: 'absolute',
        bottom: 0,
        marginBottom: 7,
    },
    CircleShapeView: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        backgroundColor: '#f3f6fb',
    },
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },

};
export default withNavigation(CommonView);