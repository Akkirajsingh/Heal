/* eslint-disable camelcase */
import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Dimensions, Platform, AlertIOS, View, NetInfo, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { ADD_ALLERGY, HOSP_ALLERGY_DATA } from '../constants/APIUrl';
import { ALLERGY_ADDED_SUCCESS_MSG } from '../constants/Messages';
import { MaterialIcons, MaterialCommunityIcons, SimpleLineIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Validation from '../components/Validation';
import Utility from '../components/Utility';

let ADD_ALLERGY_URL = '';

let CONNECTION_STATUS = false;
const today = new Date();
class AddAllergy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allergy_name: '',
            reaction: '',
            isMedicationAllergy: 'No',
            loadingMsg: '',
            user_id: '',
            accessToken: '',
            physicianName: '',
            hospitalName: '',
            medicationName: '',
            isLoading: false,
            showMenu: false,
            refreshing: false,
            dateOfBirth: today,
            todayDate: today,
            problem_name: '',
            other_name: '',
            dose: '',
            dose_unit: '',
            applied: '',
            instructions: '',
            status: '',
            reason: '',
            note: '',
            start_date: today,
            end_date: this.getDefaultEndDate(today), addNotes: false, addMedication: false, addReaction: false
        };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        ADD_ALLERGY_URL = ADD_ALLERGY;
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_ALLERGY_URL = USER_DATA.ServiceURL + HOSP_ALLERGY_DATA;
        }
        this.setState({
            accessToken: USER_DATA.ACCESS_TOKEN,
            user_id: USER_DATA.User_Id,
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    getDefaultEndDate(start_date) {
        var currentDate = new Date(start_date);
        currentDate.setDate(currentDate.getDate() + 1);
        console.log("end", new Date(currentDate))
        return new Date(currentDate);
    }
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    addMedication() {
        this.setState({
            addMedication: !this.state.addMedication
        });
    }
    addReaction() {
        this.setState({
            addReaction: !this.state.addReaction
        });
    }
    render() {
        return (
            <CommonView AddAllergy >
                <View style={{ flex: 1, paddingLeft: 11, paddingRight: 10, paddingTop: 8 }}>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>

                        <View style={{ flexDirection: 'column' }}>
                            <View style={styles.inputField}>
                                <MaterialIcons style={styles.icons} size={20} name="face" />
                                <TextInput
                                    placeholder={'Allergy Name'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    style={{width:'100%', fontSize: 17}}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(allergy_name) => this.setState({ allergy_name })}
                                />
                            </View>

                            <View style={{ flexDirection: "column", marginTop: 20, marginBottom: 10 }}>
                                <Text style={{ fontSize: 17 }} >Status</Text>
                                <View>
                                    {this.state.status == 'Active' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                        <TouchableOpacity style={{ marginRight: 15, marginLeft: 0 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.activestatus}>
                                            <View style={styles.statuscir4} ><View style={styles.statuscir2}><View style={styles.statusCir}></View></View>

                                                <Text style={{ color: 'white' }}>Active</Text>
                                            </View></View></TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.Inactivestatus}>
                                            <View style={styles.statuscir5} ><View style={styles.statuscir3}><View style={styles.statusCir1}></View></View>
                                                <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                            </View></View></TouchableOpacity>
                                    </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                            <TouchableOpacity style={{ marginRight: 15, marginLeft: 0 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.Inactivestatus}>
                                                <View style={styles.statuscir5}><View style={styles.statuscir3}><View style={styles.statusCir1}></View></View>

                                                    <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                                </View></View></TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.activestatus}>
                                                <View style={styles.statuscir4} ><View style={styles.statuscir2}><View style={styles.statusCir}></View></View>
                                                    <Text style={{ color: 'white' }}>Inactive</Text>
                                                </View></View></TouchableOpacity>
                                        </View>}
                                </View></View>
                            <View style={{ marginTop: 15, marginBottom: 10 }}>
                                <Text style={{ marginBottom: 15, fontSize: 17 }}>Is this a medication allergy?</Text>
                                {this.state.isMedicationAllergy == 'Yes' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeMedicalStatus('Yes')}><View style={styles.activestatus}>
                                        <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 3, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                            <Text style={{ color: 'white' }}>Yes</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.changeMedicalStatus('No')}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                            <Text style={{ color: '#cdcdcd' }}>No</Text>
                                        </View></View></TouchableOpacity>
                                </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                        <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.changeMedicalStatus('Yes')}><View style={styles.Inactivestatus}>
                                            <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                                <Text style={{ color: '#cdcdcd' }}>Yes</Text>
                                            </View></View></TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.changeMedicalStatus('No')}><View style={styles.activestatus}>
                                            <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                                <Text style={{ color: 'white' }}>No</Text>
                                            </View></View></TouchableOpacity>
                                    </View>}
                            </View>
                            {this.state.isMedicationAllergy == 'Yes' ?
                                <View style={{ flexDirection: 'column' }}>
                                    <View style={styles.inputField}>
                                        <MaterialCommunityIcons style={styles.icons} size={20} name="doctor" />
                                        <TextInput
                                            style={styles.inputField}
                                            placeholder={'Doctor'}
                                            style={{width:'100%', fontSize: 17}}
                                            placeholderTextColor='#938F97'
                                            onChangeText={(physicianName) => this.setState({ physicianName })}
                                        />
                                    </View>
                                    <View style={{ marginTop: 15 }} />
                                    <View style={styles.inputField}>
                                        <MaterialCommunityIcons style={styles.icons} size={20} name="hospital-building" />
                                        <TextInput
                                            style={styles.inputField}
                                            placeholder={'Hospital'}
                                            style={{width:'100%', fontSize: 17}}
                                            placeholderTextColor='#938F97'
                                            onChangeText={(hospitalName) => this.setState({ hospitalName })}
                                        />
                                    </View>

                                </View> : null}
                            <View><View style={{ marginTop: 15 }}>
                                <Text style={{ marginBottom: 5, fontSize: 17 }}>Start Date</Text>
                            </View>
                                <View style={styles.dateCss}>
                                    <MaterialCommunityIcons style={styles.icons} size={20} name="calendar-clock" />
                                    <DatePicker
                                        date={this.state.start_date}
                                        mode="date"
                                        placeholder="Start Date"
                                        format="MM/DD/YYYY"
                                        /*minDate="2016-05-01"*/
                                        maxDate={this.state.todayDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: {
                                                left: 0,
                                                borderWidth: 0,
                                                color: '#8d9393',
                                            },
                                            dateText: {
                                                color: '#746E70',
                                                justifyContent: 'flex-start',
                                                textAlign: 'left',
                                                fontSize: 17
                                            }
                                        }}
                                        onDateChange={(start_date) => { this.setState({ start_date, end_date: this.getDefaultEndDate(start_date) }); }}
                                    /></View></View>
                            {this.state.status == 'Inactive' ?
                                <View><View style={{ marginTop: 15 }}>
                                    <Text style={{ marginBottom: 5, fontSize: 17 }}>End Date</Text>
                                </View>
                                    <View style={styles.dateCss}>
                                        <FontAwesome style={styles.icons} size={20} name="calendar-check-o" />
                                        <DatePicker
                                            date={this.state.end_date}
                                            mode="date"
                                            placeholder="End Date"
                                            format="MM/DD/YYYY"
                                            minDate={this.getDefaultEndDate(this.state.start_date)}
                                            // maxDate={this.state.todayDate}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                                dateInput: {
                                                    left: 0,
                                                    borderWidth: 0,
                                                    color: '#8d9393',

                                                },
                                                dateText: {
                                                    color: '#746E70',
                                                    justifyContent: 'flex-start',
                                                    textAlign: 'left',
                                                    fontSize: 17
                                                }
                                            }}
                                            onDateChange={(end_date) => {
                                                if (new Date(end_date) <= new Date(this.state.start_date)) {
                                                    ToastAndroid.show('Date Started and Date ended cannot be same', ToastAndroid.SHORT);
                                                    return false;
                                                } this.setState({ end_date });
                                            }}
                                        /></View></View> :
                                null
                            }
                            <View style={{ marginTop: 15 }}/>
                            <View style={styles.inputField}>
                                <MaterialIcons style={styles.icons} size={20} name="face" />
                                <TextInput
                                    placeholder={'Reaction Name'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    style={{width:'100%', fontSize: 17}}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(reaction) => this.setState({ reaction })}
                                />
                            </View>
                            <TouchableOpacity onPress={() => { this.addMedication(); }} >
                                <View style={styles.notes}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <MaterialCommunityIcons style={styles.icons1} size={20} name="medical-bag" />
                                        <Text style={styles.boxTextCss}>Medications</Text>
                                    </View>
                                    {!this.state.addMedication ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                                </View></TouchableOpacity>
                            {this.state.addMedication ?
                                <TextInput
                                    // style={styles.inputField}
                                    placeholder={'Medication Name'}
                                    placeholderTextColor='#938F97'
                                    style={{width:'100%', fontSize: 17}}
                                    onChangeText={(medicationName) => this.setState({ medicationName })}
                                    maxLength={100}
                                /> : null}
                            <TouchableOpacity onPress={() => { this.addNotes(); }} >
                                <View style={styles.notes}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <SimpleLineIcons style={styles.icons1} size={15} name='note' />
                                        <Text style={styles.boxTextCss}>Notes</Text>
                                    </View>
                                    {!this.state.addNotes ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                                </View></TouchableOpacity>
                            {this.state.addNotes ?
                                <TextInput
                                style={styles.inputField}
                                    placeholder={'Note'}
                                    fontSize={17}
                                    placeholderTextColor='#938F97'
                                    onChangeText={(notes) => this.setState({ notes })}
                                    maxLength={100}
                                /> : null}
                            <View style={{ margin: 10 }} />
                            <View style={styles.allergybtn}>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.saveAllergy()} >
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={styles.addAllergybtn}
                                        >
                                            Add Allergy
                                </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </CommonView >
        );
    }

    changeMedicalStatus = (val) => {
        console.log('medvalue', val);
        this.setState({
            isMedicationAllergy: val
        });
    };
    changeAllergyStatus = (val) => {
        this.setState({
            status: val
        });
    };
    /************************************************Validation *************************************************** */
    validateAllergyInput = () => {
        const AllergyNamereg = /^.{3, 100}$/;
        let ErrorMsg = "";
        if (Utility.IsNullOrEmpty(this.state.allergy_name)) {
            ErrorMsg += "Please Enter Allergy Name.\n";
        }
        else if (AllergyNamereg.test(this.state.allergy_name) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Allergy name atleast minimum of 3 characters',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Allergy name atleast minimum of 3 characters');
            } this.setState({
                isSending: false
            }); return;
        }
        // if (Utility.IsNullOrEmpty(this.state.medicationAllergy)) {
        //     ErrorMsg += "Please select medicationAllergy.\n";
        // }
        if (Utility.IsNullOrEmpty(this.state.start_date)) {
            ErrorMsg += "Please select start_date.\n";
        }
        if (Utility.IsNullOrEmpty(this.state.reaction)) {
            ErrorMsg += "Please enter reaction.\n";
        }
        if (Utility.IsNullOrEmpty(this.state.status)) {
            ErrorMsg += "Please select status.\n";
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

    /****************************************************************************************************************************** */
    saveAllergy = () => {
        const { start_date } = this.state;
        // if (!this.validateAllergyInput()) return;
        let obj = [this.state.allergy_name, this.state.start_date, this.state.end_date, this.state.reaction];
        const { navigate } = this.props.navigation;
        let mandatoryMsg = ['Enter Allergy Name', 'select Start Date', 'select End Date', 'Enter Reaction Name'];
        let pattern = [/^.{3,100}$/, "", "", ""];
        let patternMsg = ["Allergy name should be between 3 and 100 characters", "", "", ""];
        let length = [3, "", ""];
        let lengthMsg = ["Please enter Allergy name atleast minimum of 3 characters", "", "", ""];
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
        let Allergystatus = '';
        let end_date = '';
        if (this.state.status == 'Active') {
            Allergystatus = true;
            end_date = '';
        } else {
            Allergystatus = false;
            end_date = this.state.end_date;
        }
        let medAllergy = '';
        if (this.state.isMedicationAllergy == 'Yes') {
            medAllergy = true;
        } else {
            medAllergy = false;
        }
        const allergyData = { PatientId: this.state.user_id, allergyName: this.state.allergy_name, AppointmentDate: today, IsActive: Allergystatus, MedicationAllergy: medAllergy, OnsetDate: start_date, endDate: end_date, ReactionDescription: this.state.reaction, Remarks: this.state.notes, Status: Allergystatus, physicianName: this.state.physicianName, hospitalName: this.state.hospitalName, medicationName: this.state.medicationName };
        console.log('allergyData', allergyData);
        console.log(ADD_ALLERGY_URL);
        fetch(ADD_ALLERGY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.accessToken}`,
            },
            body: JSON.stringify(allergyData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(ALLERGY_ADDED_SUCCESS_MSG, ToastAndroid.LONG);
                this.setState({
                    isLoading: false,
                    loadingMsg: 'Saving Problem....'
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
    };
}

const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        backgroundColor: '#8dd5ee',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        width: (Dimensions.get('window').width) - 20,
        borderWidth: 2,
        borderColor: '#8DD5EE',
        borderRadius: 5,
        elevation: 1,
        fontWeight: 'bold',
        flexDirection: 'row'
    },
    statusCir: {
        borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white'
    },
    statusCir1: {
        borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd'
    },
    statuscir2: {
        borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10
    },
    statuscir3: {
        borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10
    },
    statuscir4: {
        borderColor: 'white', flexDirection: "row", justifyContent: "center"
    },
    statuscir5: {
        borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center"
    },
    dateCss: {
        flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center'
    },
    addAllergybtn: {
        color: 'white', fontWeight: 'bold', fontSize: 16
    },
    allergybtn: {
        alignItems: 'center', justifyContent: 'center', paddingBottom: 15,
    },
    icons: {
        color: '#000', marginTop: 6, marginRight: 4
    },
    boxTextCss: {
        color: '#000', marginLeft: 5, fontSize: 17
    },
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 2
    },
    inputField: {
        height: 30, width: '100%', marginBottom: 10, borderBottomWidth: 0.3, borderBottomColor: 'grey', color: '#E3E2E2', flexDirection: 'row'
    },
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    plusCircleIcon: {
        color: '#000', marginTop: 3, marginRight: 5
    },
    activestatus: {
        borderRadius: 8, borderColor: 'white', backgroundColor: '#2fd473', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },
    Inactivestatus: {
        borderRadius: 6, borderColor: '#cdcdcd', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    }
});

export default AddAllergy;

