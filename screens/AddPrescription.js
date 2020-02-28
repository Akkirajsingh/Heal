/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, Dimensions, View, AsyncStorage, StatusBar, TouchableOpacity, ToastAndroid, ActivityIndicator, NetInfo, FlatList, Platform, AlertIOS } from 'react-native';
import { GET_PRESCRIPTION, CREATE_PRESCRIPTION, DELETE_PRESCRIPTION, GET_ALL_SPECIALITY, GET_ALL_PHYSICIAN, MEDICATION_UNITS } from '../constants/APIUrl';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import Moment from 'moment';
import Utility from '../components/Utility';
let CONNECTION_STATUS = false;
const MEDICATION_UNITS_URL = MEDICATION_UNITS;
// const physicianItem = [{ label: 'Patrick', value: '226c1787-4a23-42b7-a6bc-e5ac6ada02ba' }, { label: 'John', value: '230fe6f6-9535-4955-bae6-2fa061774854' }];
const statusItem = [{ label: 'New', value: 1 }, { label: 'Request Pharmacy', value: 2 }, { label: 'Completed', value: 3 }];
let GET_PRESCRIPTION_URL = '';
let CREATE_PRESCRIPTION_URL = '';
let GET_SPECIALITY_URL = '';
let GET_PHYSICIAN_URL = '';
let DELETE_PRESCRIPTION_URL = '';
//const PrescriptionMedicineList = [{ medicineName: 'Dolo', dosage: 1, dosageUnit: 'ml', id: 1,status:'Active' }, { medicineName: 'Dolo', dosage: 1, dosageUnit: 'ml', id: 2,status:'Active' }, { medicineName: 'Dolo', dosage: 1, dosageUnit: 'ml', id: 3,status:'Active' }];
class AddPrescription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dosageunitItems: [], //MedicineName:'',Dosage:'',DosageUnit:'',
            accessToken: '', userid: '',
            specialityItem: [],
            physicianItem: [],
            physician: '',
            status: '',
            statusItem: [],
            speciality: '',
            specialityItem: [],
            Instructions: '',
            Illness: '',
            PrescriptionMedicineList: [],
            Service_URL: '',
            LocationId: '',
            isLoading: false,
            patientuserid: '',
            user_id: '',
            prescriptionNumber: ''
            , hospitalAccessToken: '',
            EditPermission: false,
            physicianEnabled: false,
            hospLogin: false
        };
        // this.props.navigation.addListener(
        // 'didFocus',
        // async () => {
        // const { navigate } = this.props.navigation;
        // navigate('Hospital', { type: 'SignUp', Service_URL: this.state.Service_URL, HosName: this.state.HosName, LocationId: this.state.LocationId });
        // }

        // );
    }
    async componentDidMount() {
        // const Service_URL = params.Service_URL;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        console.log("USER_DATA", USER_DATA)
        GET_PRESCRIPTION_URL = GET_PRESCRIPTION;
        CREATE_PRESCRIPTION_URL = CREATE_PRESCRIPTION;
        GET_SPECIALITY_URL = GET_ALL_SPECIALITY;
        GET_PHYSICIAN_URL = GET_ALL_PHYSICIAN;
        DELETE_PRESCRIPTION_URL = DELETE_PRESCRIPTION;
        if (USER_DATA.hasOwnProperty('Hospital')) {
            CREATE_PRESCRIPTION_URL = USER_DATA.Hospital.ServiceURL + 'api/PrescriptionService/UpdatePrescription';
            GET_PRESCRIPTION_URL = USER_DATA.Hospital.ServiceURL + 'api/PrescriptionService/GetPrescription';
            GET_SPECIALITY_URL = USER_DATA.Hospital.ServiceURL + 'api/Form/GetAllMasterSpeciality';
            GET_PHYSICIAN_URL = USER_DATA.Hospital.ServiceURL + 'api/Form/GetAllPhysician';
            DELETE_PRESCRIPTION_URL = USER_DATA.Hospital.ServiceURL + 'api/PrescriptionService/DeletePrescriptionById';
            this.setState({
                hospLogin: true,
                accessToken: USER_DATA.Hospital.ACCESS_TOKEN,
                user_id: USER_DATA.Hospital.User_Id,
                LocationId: USER_DATA.Hospital.PracticeId,
                Service_URL: USER_DATA.Hospital.ServiceURL,
                PrescriptionMedicineList: this.state.PrescriptionMedicineList
            });
            console.log("PrescriptionMedicineList", this.state.PrescriptionMedicineList);
            console.log("GET_PRESCRIPTION_URL12", GET_PRESCRIPTION_URL)
        }
        else {
            this.setState({
                accessToken: USER_DATA.ACCESS_TOKEN,
                user_id: USER_DATA.User_Id,
                hospLogin: false
            });
        }
        const { params } = this.props.navigation.state;

        // if (!Utility.IsNullOrEmpty(Service_URL)) {
        // MOBILE_OTP_API_URL = `${Service_URL}api/PatientSignUp/CheckMobileOTP`;
        // SIGNUP_OTP_URL = `${Service_URL}api/PatientSignUp/OTP`;
        // PATIENT_SIGNUP_URL = `${Service_URL}api/PatientSignUp/PatientAccount`;
        // }

        /*********************************Internet Connection Status ****************************************/
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        this.dosageUnit();
        this.getSpeciality();
        if (!Utility.IsNullOrEmpty(params)) {
            this.getPrescription(params.prescriptionNumber);
        }

    }
    /***************************************************************************************************************** */
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /**********************************************************Signup OTP starts ******************************/

    /********************************************end Signup OTP ************************************************************/

    changeDosageUnit = (value, item) => {
        let PrescriptionMedicineList = this.state.PrescriptionMedicineList;
        let data = PrescriptionMedicineList.map(e => {
            if (item.id === e.id) {
                item.dosageUnit = value;
                return item;
            }
            return e;

        });
        this.setState({ PrescriptionMedicineList: data });
    }
    changeMedicineName = (value, item) => {
        let PrescriptionMedicineList = this.state.PrescriptionMedicineList;
        let data = PrescriptionMedicineList.map(e => {
            if (item.id === e.id) {
                item.medicineName = value;
                return item;
            }
            return e;

        });
        this.setState({ PrescriptionMedicineList: data });
    }
    changeDosage = (value, item) => {
        let PrescriptionMedicineList = this.state.PrescriptionMedicineList;
        let data = PrescriptionMedicineList.map(e => {
            if (item.id === e.id) {
                item.dosage = value;
                return item;
            }
            return e;

        });
        this.setState({ PrescriptionMedicineList: data });
    }
    changeStatus = (value) => {
        this.setState({
            status: value
        });
    }
    changePhysician = (value) => {
        this.setState({
            physician: value
        });
    }
    changeSpeciality = (value) => {
        this.setState({
            speciality: value,
            // physicianEnabled:true
        }, function () {
            this.getAllPhysician();
        });
    }
    fetchDropdownData(apidata) {
        const DropDownItems = [];
        let i;

        for (i = 0; i < apidata.length; i++) {
            DropDownItems.push({ value: apidata[i].id, label: apidata[i].medicationUnit });
        }
        this.setState({
            dosageunitItems: DropDownItems,
        });
    }
    removeMedicineItems = (item) => {
        console.log("removeMedicineItems", item);
        console.log("MedicineItems", this.state.PrescriptionMedicineList)
        let PrescriptionMedicineList = this.state.PrescriptionMedicineList;
        let data = PrescriptionMedicineList.filter(function (pres) {
            return pres.id != item.id
        })

        this.setState({ PrescriptionMedicineList: data });
    }
    addMedicineItems = () => {
        const medicineItem = Utility.IsNullOrEmpty(this.state.PrescriptionMedicineList) ? [] : this.state.PrescriptionMedicineList;
        medicineItem.push({ medicineName: '', dosage: '', dosageUnit: 'ml', status: 'Active', id: Utility.IsNullOrEmpty(this.state.PrescriptionMedicineList) ? 1 : this.state.PrescriptionMedicineList.length + 1 });
        this.setState({
            PrescriptionMedicineList: medicineItem
        });
    }
    dosageUnit = () => {
        fetch(MEDICATION_UNITS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then((response) => response.json()).then((res) => {
            this.fetchDropdownData(res.responseData);
        });
    }


    validatePrescriptionInput = () => {
        let ErrorMsg = "";
        if (Utility.IsNullOrEmpty(this.state.status)) {
            ErrorMsg += "Please select status.\n";
        }
        if (Utility.IsNullOrEmpty(this.state.physician) && this.state.hospLogin) {
            ErrorMsg += "Please select physician.\n";
        }
        if (Utility.IsNullOrEmpty(this.state.speciality) && this.state.hospLogin) {
            ErrorMsg += "Please select speciality.\n";
        }
        if (Utility.IsNullOrEmpty(this.state.Illness)) {
            ErrorMsg += "Please enter illness.\n";
        }
        if (this.state.PrescriptionMedicineList.length == 0) {
            ErrorMsg += "Please enter medicine details.\n";
        }
        let validMedicineItem = this.state.PrescriptionMedicineList.filter(function (item) {
            return Utility.IsNullOrEmpty(item.medicineName);

        });
        if (validMedicineItem.length > 0) {
            ErrorMsg += "Each medicine added should have name.\n";
        }
        if (!Utility.IsNullOrEmpty(ErrorMsg)) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    ErrorMsg,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert(ErrorMsg);
            }
            return false;
        }
        return true;
    }
    createPrescription = () => {

        console.log("validate", this.validatePrescriptionInput())
        if (!this.validatePrescriptionInput()) return;

        const a = new Date();
        const prescriptionData = {
            Illness: this.state.Illness,
            Instructions: this.state.Instructions,
            CreatedDate: "10/03/2019 1:00:00 PM",
            // CreatedDate: `${a.getDate()}/${a.getMonth() + 1}/${a.getFullYear()} ${a.getHours()}`,
            AutoRefill: 'false',
            FromInterface: 'false',
            Id: 0,
            MedicationId: '00000000-0000-0000-0000-000000000000',
            PatientId: this.state.user_id,
            PhysicianId: this.state.hospLogin ? this.state.physician : 'b64fcf7a-b0be-4909-9718-3a85d668de82',
            PracticeId: Utility.IsNullOrEmpty(this.state.LocationId) ? "00000000-0000-0000-0000-000000000000" : this.state.LocationId,// this.state.LocationId,
            RefilledDate: '1/1/0001 12:00:00 AM',
            SpecialityId: this.state.hospLogin ? this.state.speciality : 42,
            status: this.state.status,
            buttonType: 'insert',
            Medications: this.state.PrescriptionMedicineList
        };
        console.log("createPrescription", prescriptionData);
        console.log("this.state.accessToken", this.state.accessToken);
        fetch(`${CREATE_PRESCRIPTION_URL}`, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(prescriptionData)
        }).then((response) => response.json())
            .then((res) => {
                console.log("createPrescriptionres", res);
                if (res.hasOwnProperty("succeeded") && res.succeeded == true) {
                    // let successMsg=IsPrescriptionCreate==true?'Prescription created successfully':'Prescription updated successfully'
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            'Prescription created successfully',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                        this.props.navigation.navigate("Prescriptions");
                    } else {
                        AlertIOS.alert('Prescription created successfully');
                    }
                }
                else {

                }
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });

    }
    updatePrescription = () => {
        if (!this.validatePrescriptionInput()) return;
        const a = new Date();
        const prescriptionData = {
            Illness: this.state.Illness,
            Instructions: this.state.Instructions,
            CreatedDate: '10/03/2019 1:00:00 PM',
            AutoRefill: 'false',
            FromInterface: 'false',
            Id: this.state.prescriptionNumber,
            MedicationId: '00000000-0000-0000-0000-000000000000',
            PatientId: this.state.user_id,
            PhysicianId: this.state.hospLogin ? this.state.physician : 'b64fcf7a-b0be-4909-9718-3a85d668de82',
            PracticeId: Utility.IsNullOrEmpty(this.state.LocationId) ? "00000000-0000-0000-0000-000000000000" : this.state.LocationId,
            RefilledDate: '1/1/0001 12:00:00 AM',
            SpecialityId: this.state.hospLogin ? this.state.speciality : 42,
            status: this.state.status,
            buttonType: '',
            Medications: this.state.PrescriptionMedicineList
        };
        console.log("createPrescription", prescriptionData);
        console.log("this.state.accessToken", this.state.accessToken);
        fetch(`${CREATE_PRESCRIPTION_URL}`, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(prescriptionData)
        }).then((response) => response.json())
            .then((res) => {
                console.log("createPrescriptionres", res);
                if (res.hasOwnProperty("succeeded") && res.succeeded == true) {
                    // let successMsg=IsPrescriptionCreate==true?'Prescription updated successfully':'Prescription updated successfully'
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            'Prescription updated successfully',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                        this.props.navigation.navigate("Prescriptions");
                    } else {
                        AlertIOS.alert('Prescription updated successfully');
                    }
                }
                else {

                }
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });
    }
    deletePrescription = () => {
        const a = new Date();
        const prescriptionData = {

            id: this.state.prescriptionNumber,

        };
        console.log("delPrescription", prescriptionData);
        console.log("this.state.accessToken", this.state.accessToken);
        fetch(`${DELETE_PRESCRIPTION_URL}`, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(prescriptionData)
        }).then((response) => response.json())
            .then((res) => {
                console.log("createPrescriptionres", res);
                if (res.hasOwnProperty("succeeded") && res.succeeded == true) {
                    // let successMsg=IsPrescriptionCreate==true?'Prescription created successfully':'Prescription updated successfully'
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            'Prescription deleted successfully',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                        this.props.navigation.navigate("Prescriptions");
                    } else {
                        AlertIOS.alert('Prescription deleted successfully');
                    }
                }
                else {

                }
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });
    }
    getPrescription = (prescriptionNumber) => {
        console.log("getpres", `${GET_PRESCRIPTION_URL}?id=${prescriptionNumber}`)
        fetch(`${GET_PRESCRIPTION_URL}?id=${prescriptionNumber}`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log("getprescriptionresponseJson", responseJson)
                // const count = Object.keys(responseJson.responseData).length;
                let response = responseJson.responseData;
                let medicineData = [];
                if (response.hasOwnProperty("_MedicineList")) {
                    medicineData = response._MedicineList;
                }
                this.getAllPhysician(response.specialityId, response.physicianId);
                this.setState({
                    PrescriptionMedicineList: medicineData,
                    Illness: response.illness,
                    Instructions: response.instructions,
                    // physician: this.getAllPhysician(response.specialityId) response.physicianId,
                    speciality: response.specialityId,
                    status: response.status,
                    prescriptionNumber: prescriptionNumber,
                    EditPermission: response.dataSource == 0 ? true : false
                })
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });
    }
    getSpeciality = () => {
        console.log("GET_SPECIALITY_URL", GET_SPECIALITY_URL);
        console.log("GET_SPECIALITY_t", GET_ALL_SPECIALITY);
        fetch(`${GET_ALL_SPECIALITY}`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
            //body:JSON.stringify({"id": 10043})
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log("GET_SPECIALITY_URLresponseJson", responseJson)
                const count = Object.keys(responseJson.responseData).length;
                const specialityItems = [];
                for (let i = 0; i < count; i++) {
                    specialityItems.push({ label: responseJson.responseData[i]._speciality, value: responseJson.responseData[i]._Id });
                }
                this.setState({
                    specialityItem: specialityItems,
                    isLoading: false,
                });
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });
    }
    getAllPhysician = (specialityId, physicianId) => {
        let speciality = Utility.IsNullOrEmpty(specialityId) ? this.state.speciality : specialityId;
        console.log(`${GET_PHYSICIAN_URL}?ID=${speciality}`)
        console.log("GET_SPECIALITY_t", `${GET_PHYSICIAN_URL}?ID=${speciality}`);
        fetch(`${GET_PHYSICIAN_URL}?ID=${speciality}`, {
            method: 'GET',
            headers: {
                'content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.accessToken}`,
            },

        }).then((response) => response.json())
            .then((responseJson) => {
                const count = Object.keys(responseJson.responseData).length;
                const specialityItems = [];
                for (let i = 0; i < count; i++) {
                    specialityItems.push({ label: responseJson.responseData[i]._physician, value: responseJson.responseData[i]._Id });
                }
                console.log(specialityItems);
                this.setState({
                    physicianItem: specialityItems,
                    isLoading: false,
                    physician: Utility.IsNullOrEmpty(physicianId) ? '' : physicianId,
                    physicianEnabled: specialityItems.length > 0 > 0 ? true : false
                });
            })
            .catch(() => {
                this.setState({ isLoading: false, physician: '' });
            });
    }
    FlatListItemSeparator = () => <View style={styles.line} />;
    setMedicineName = () => {

    }
    renderItem = data => {
        return (<TouchableOpacity
            style={[styles.list, data.item.selectedClass]}
        >
            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 6, marginRight: 6, paddingTop: 7, paddingBottom: 7, backgroundColor: data.item.status == 0 ? '#c7e2f1' : '#ffffff' }}>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ width: '50%', marginRight: 10 }}>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text style={{ fontSize: 14 }}>Medicine Name</Text>
                            <TextInput
                                placeholder={'Medicine Name'}
                                secureTextEntry={false}
                                onChangeText={(medicineName) => this.changeMedicineName(medicineName, data.item)}
                                style={styles.inputField1}
                                placeholderTextColor="#746E6E"
                                value={data.item.medicineName}

                            />
                        </View>
                    </View>
                    < View style={{ width: '22%', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text style={{ fontSize: 14 }}>Dosage</Text>
                            <TextInput
                                placeholder={'Dosage'}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                onChangeText={(dosage) => this.changeDosage(dosage, data.item)}
                                style={styles.inputField1}
                                placeholderTextColor="#746E6E"
                                value={data.item.dosage}
                            />
                        </View>
                    </View>
                </View>
                {/* <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}> */}

                < View style={{ width: '20%', justifyContent: "center", alignItems: "center" }}>
                    <Dropdown
                        label='Dosage Unit'
                        data={this.state.dosageunitItems}
                        labelHeight={20}
                        labelFontSize={14}
                        fontSize={14}
                        value={data.item.dosageUnit}
                        textColor='gray'
                        selectedItemColor='#41b4af'
                        onChangeText={(val) => this.changeDosageUnit(val, data.item)}
                        containerStyle={{ width: '100%' }}
                        baseColor="#000"
                        style={{ width: '100%' }}
                    />
                </View>
                <View style={{ width: '8%', marginLeft: 8 }}>
                    <TouchableOpacity style={styles.cusButtonLargeGreen2} onPress={() => this.removeMedicineItems(data.item)}>

                        <Text
                            style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}
                        >
                            X
 </Text>

                    </TouchableOpacity>
                </View>
                {/* </View> */}
            </View>
        </TouchableOpacity>);
    }
    render() {
        return (
            <CommonView AddPrescription>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 7 }}>
                    <KeyboardAvoidingView behavior="padding" enabled>
                        <StatusBar hidden />
                        <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                            <View>
                                <View style={{ backgroundColor: '#f3f6fb', flexDirection: 'row', elevation: 1, paddingTop: 3, paddingBottom: 3 }}>
                                    <View style={{ alignItems: "flex-start" }}>
                                        <Text style={{ color: '#8b9393', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, fontWeight: 'bold', fontSize: 17 }}>Add Medicine</Text>
                                    </View>
                                    <View style={{ position: 'absolute', right: 6 }}>
                                        <TouchableOpacity style={styles.cusButtonAddbutton} onPress={() => this.addMedicineItems()}>
                                            <Text style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 14 }} >+</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <FlatList
                                        data={this.state.PrescriptionMedicineList}
                                        ItemSeparatorComponent={this.FlatListItemSeparator}
                                        renderItem={item => this.renderItem(item
                                        )}
                                        keyExtractor={item => item.id.toString()}
                                        extraData={this.state}
                                    // ListEmptyComponent={this.noItemDisplay}
                                    />
                                </View>
                                <View>
                                    <View style={{ marginTop: 3 }}>
                                        <View style={{ backgroundColor: '#f3f6fb', elevation: 1, paddingTop: 3, paddingBottom: 3 }}>
                                            <Text style={{ color: '#8b9393', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, fontWeight: 'bold', fontSize: 17 }}>General Information</Text>
                                        </View></View>
                                    <View style={{ flex: 1, flexDirection: 'column', paddingTop: 5 }}>

                                        <Dropdown
                                            label='Status'
                                            data={statusItem}
                                            labelHeight={13}
                                            labelFontSize={16}
                                            fontSize={16}
                                            value={this.state.status}
                                            textColor='gray'
                                            selectedItemColor='#41b4af'
                                            onChangeText={(val, index, data) => this.changeStatus(val, index, data)}
                                            containerStyle={{ width: '100%' }}
                                            baseColor="#000"
                                        />
                                        {this.state.hospLogin ? <Dropdown
                                            label='Speciality'
                                            data={this.state.specialityItem}
                                            labelHeight={13}
                                            labelFontSize={16}
                                            fontSize={16}
                                            value={this.state.speciality}
                                            textColor='gray'
                                            selectedItemColor='#41b4af'
                                            onChangeText={(val, index, data) => this.changeSpeciality(val, index, data)}
                                            containerStyle={{ width: '100%' }}
                                            baseColor="#000"
                                        /> : null}
                                        {this.state.hospLogin ? <Dropdown
                                            label='Physician'
                                            data={this.state.physicianItem}
                                            labelHeight={13}
                                            labelFontSize={16}
                                            fontSize={16}
                                            value={this.state.physician}
                                            textColor='gray'
                                            selectedItemColor='#41b4af'
                                            onChangeText={(val, index, data) => this.changePhysician(val, index, data)}
                                            containerStyle={{ width: '100%' }}
                                            baseColor="#000"
                                            disabled={this.state.physicianItem.length > 0 ? false : true}
                                        /> : null}
                                        < View style={{}}>
                                            <Text style={{ fontSize: 17 }}>Illness</Text>
                                            <TextInput
                                                placeholder={''}
                                                secureTextEntry={false}
                                                onChangeText={(Illness) => this.setState({ Illness })}
                                                style={styles.inputField}
                                                fontSize={16}
                                                placeholderTextColor="#746E6E"
                                                value={this.state.Illness}
                                            />
                                        </View>
                                        < View>
                                            <Text style={{ fontSize: 17 }}>Instructions</Text>

                                            <TextInput
                                                mulcreateprescriptiontiline={true}
                                                numberOfLines={5}
                                                placeholder={''}
                                                fontSize={17}
                                                secureTextEntry={false}
                                                onChangeText={(Instructions) => this.setState({ Instructions })}
                                                style={styles.inputField2}
                                                placeholderTextColor="#746E6E"
                                                value={this.state.Instructions}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 3 }} >
                                        {Utility.IsNullOrEmpty(this.state.prescriptionNumber) ?
                                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.createPrescription()}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {this.state.isLoading ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 5 }} /> : undefined}
                                                    <Text style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>Create</Text>
                                                </View>
                                            </TouchableOpacity> :
                                            this.state.EditPermission == true ?
                                                <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                                    <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.updatePrescription()}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            {this.state.isLoading ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 5 }} /> : undefined}
                                                            <Text style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>Update</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.deletePrescription()}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            {this.state.isLoading ? <ActivityIndicator color="#ffffff" style={{ paddingRight: 5 }} /> : undefined}
                                                            <Text style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>Delete</Text>
                                                        </View>
                                                    </TouchableOpacity></View> : undefined}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        width: '100%',
        color: '#8D8D8D',
        backgroundColor: '#ffffff00',
        borderBottomWidth: 0.7,
        paddingTop: 2,
        fontSize: 10,
        borderBottomColor: '#9E9A9B'
    },
    inputField1: {
        width: '100%',
        color: '#8D8D8D',
        backgroundColor: '#ffffff00',
        borderBottomWidth: 0.7,
        fontSize: 14,
        borderBottomColor: '#9E9A9B'
    },
    cusButtonLargeGreen1: {
        backgroundColor: '#3aa6cd',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        //width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        flexDirection: 'row'
    },
    cusButtonAddbutton: {
        backgroundColor: '#3aa6cd',
        paddingTop: 2,
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 5,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        //width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        flexDirection: 'row'
    },
    cusButtonLargeGreen2: {
        backgroundColor: '#3aa6cd',
        paddingTop: 2,
        paddingBottom: 3,
        paddingLeft: 2,
        paddingRight: 2,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        //width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        flexDirection: 'row'
    },
    inputField2: {
        width: '100%',
        color: '#a9a9a9',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        fontSize: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#8d9393',
        padding: 10
    },
    cusButtonLargeGreen: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 25,
        paddingRight: 25,
        textAlign: 'center',
        borderRadius: 20,
        fontSize: 13,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1
    },
});

export default AddPrescription;