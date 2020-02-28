/* eslint-disable no-undef */
import React, { Component } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Dimensions, TextInput, ToastAndroid, NetInfo, Platform, AlertIOS } from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { VISITS_VALIDATION_ERR, VISITS_ADDED_SUCCESS_MSG } from '../constants/Messages';
import { ADD_ENCOUNTER, VISIT_TYPES, HOSP_VISIT_TYPES, HOSP_ADD_ENCOUNTER } from '../constants/APIUrl';
import Moment from 'moment';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import Validation from '../components/Validation';

let ADD_ENCOUNTER_URL = '';
let VISIT_TYPES_URL = '';
let CONNECTION_STATUS = false;

class AddVisit extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = {
            datatoken: '',
            visitTypeItems: [],
            visitTypeSelectedItem: '',
            placeVisit: '',
            dischargedDate: '',
            VisitReason: '',
            FunctionalStatus: '',
            EncounterDiagnosis: '',
            Provider: '',
            CognitiveStatus: '',
            encounterDate: '',
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
        const { params } = this.props.navigation.state;
        ADD_ENCOUNTER_URL = ADD_ENCOUNTER;
        VISIT_TYPES_URL = VISIT_TYPES;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_ENCOUNTER_URL = USER_DATA.ServiceURL + HOSP_ADD_ENCOUNTER;
            VISIT_TYPES_URL = USER_DATA.ServiceURL + HOSP_VISIT_TYPES;
        }
        this.setState({
            datatoken: USER_DATA.ACCESS_TOKEN,
            userid: USER_DATA.User_Id,
            email_id: USER_DATA.userName,
        });
        // console.log('this is the data', this.state.datatoken, ',,,,,,,,,,', this.state.userid);
        this.visitTypeData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }

    /**************************************************Add Visit Api  *****************************************************/
    addVisit = () => {
        const { placeVisit, VisitReason, dischargedDate, encounterDate, visitTypeSelectedItem } = this.state;
        let obj = [placeVisit, encounterDate, dischargedDate, VisitReason, visitTypeSelectedItem ];
        let mandatoryMsg = ['Enter Place Of Visit', 'Select Visit Date', 'Select Discharge Date', 'Enter Visit Reason', 'Select Visit Type' ];
        let pattern = [/^.{3,100}$/, "", "", "", "" ];
        let patternMsg = [" Place Of Visit Name should be between 3 and 100 characters", "", "", "", "" ];
        let length = [3, "", "", "", "" ];
        let lengthMsg = ["Please enter Place Of Visit Name atleast minimum of 3 characters", "", "", "", "" ];
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

            const VisitUser = {
                id: 0,
                description: this.state.VisitReason,
                encounterDate: this.state.encounterDate,
                visitType: this.state.visitTypeSelectedItem,
                cognitiveStatus: this.state.CognitiveStatus,
                functionalStatus: this.state.FunctionalStatus,
                diagnosis: this.state.EncounterDiagnosis,
                dischargedDate: this.state.dischargedDate,
                facility: this.state.placeVisit,
                provider: this.state.Provider,
                patientId: this.state.userid
            };
            console.log("VisitUser1", VisitUser);
            fetch(ADD_ENCOUNTER_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.state.datatoken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(VisitUser)
            }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
                console.log("visistres", res);
                if (res.statusCode == 400) {
                    ToastAndroid.showWithGravity(
                        VISITS_VALIDATION_ERR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({

                    }); return;
                }
                ToastAndroid.showWithGravity(
                    VISITS_ADDED_SUCCESS_MSG,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({
                }, function () {
                    this.props.navigation.navigate('VisitDetails');
                });
            }).catch(err => {
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
    /************************************************************************************************ */
    /************************************************Visit Type API  *****************************************/
    visitTypeData = () => {
        fetch(VISIT_TYPES_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.datatoken}`,
                'Content-Type': 'application/json',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((responseJson) => {
            const drop_down_data = [];
            for (let i = 0; i < responseJson.responseData.length; i++) {
                drop_down_data.push({ label: responseJson.responseData[i].type, value: responseJson.responseData[i].id });
            }
            this.setState({
                visitTypeItems: drop_down_data,
                isLoading: false,
                dataSource: responseJson
            }, () => {
            });
        }).catch((error) => {
            this.setState({ isLoading: false });
            const errMSg = aPIStatusInfo.logError(error);
            ToastAndroid.showWithGravity(
                errMSg.length > 0 ? errMSg : COMMON_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        });
    }

    visitTypeChange = (value, index) => {
        this.setState({
            visitTypeSelectedItem: value
        });
    }
    /********************************************************************************************************************* */
    render() {
        return (
            <CommonView AddVisit>
                <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: '#fff' }} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name="hospital-building" />
                            <TextInput
                                placeholder={'Place Of Visit'}
                                // underlineColorAndroid="#0000001a"
                                secureTextEntry={false}
                                maxlength={100}
                                onChangeText={(placeVisit) => this.setState({ placeVisit })}
                                placeholderTextColor='#938F97'
                                value={this.state.placeVisit}
                                style={{width:'100%', fontSize: 17}}
                            />
                        </View>
                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>Visit Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3 }}>
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='calendar-clock' />
                            <DatePicker
                                date={this.state.encounterDate}
                                mode="date"
                                placeholder="Visit Date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                    dateText: { color: '#746E6E', paddingLeft: 6, justifyContent: 'center', alignItems: 'center', fontSize: 15, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 15, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(encounterDate) => { this.setState({ encounterDate }); }}
                            /></View>

                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}> Discharge Date</Text>
                        </View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='checkbox-multiple-blank-outline' />
                            <DatePicker
                                date={this.state.dischargedDate}
                                mode="date"
                                placeholder="Discharge Date"
                                format="MM/DD/YYYY"
                                minDate={this.state.encounterDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 17 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', alignItems: 'center', fontSize: 15, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 15, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(dischargedDate) => { this.setState({ dischargedDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <MaterialIcons style={styles.iconCss} size={20} name="description" />
                            <TextInput
                                placeholder={'Visit Reason'}
                                numberOfLines={2}
                                // underlineColorAndroid="#0000001a"
                                secureTextEntry={false}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(VisitReason) => this.setState({ VisitReason })}
                                value={this.state.VisitReason}
                                maxLength={100}
                            />
                        </View>
                        <View>
                            <Text style={{ marginBottom: 10, fontSize: 17 }}>Visit Type</Text>
                            <Dropdown
                                baseColor="#000"
                                label=''
                                value={this.state.visitTypeSelectedItem}
                                data={this.state.visitTypeItems}
                                textColor='#746E6E'
                                labelHeight={7}
                                fontSize={17}
                                paddingLeft={5}
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                selectedItemColor='#41b4af'
                                containerStyle={{ marginBottom: 5, marginTop: 5, marginLeft: 2 }}
                                onChangeText={(val, index) => this.visitTypeChange(val, index)}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <TextInput
                                placeholder={'Provider'}
                                numberOfLines={2}
                                style={{width:'100%', fontSize: 17}}
                                secureTextEntry={false}
                                placeholderTextColor='#938F97'
                                onChangeText={(Provider) => this.setState({ Provider })}
                                value={this.state.Provider}
                                maxLength={100}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <TextInput
                                placeholder={'Encounter Diagnosis'}
                                numberOfLines={2}
                                style={{width:'100%', fontSize: 17}}
                                secureTextEntry={false}
                                placeholderTextColor='#938F97'
                                onChangeText={(EncounterDiagnosis) => this.setState({ EncounterDiagnosis })}
                                value={this.state.EncounterDiagnosis}
                                maxLength={100}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <TextInput
                                placeholder={'Cognitive Status '}
                                numberOfLines={2}
                                style={{width:'100%', fontSize: 17}}
                                secureTextEntry={false}
                                placeholderTextColor='#938F97'
                                onChangeText={(CognitiveStatus) => this.setState({ CognitiveStatus })}
                                value={this.state.CognitiveStatus}
                                maxLength={100}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <TextInput
                                placeholder={'Functional Status'}
                                numberOfLines={2}
                                style={{width:'100%', fontSize: 17}}
                                secureTextEntry={false}
                                placeholderTextColor='#938F97'
                                onChangeText={(FunctionalStatus) => this.setState({ FunctionalStatus })}
                                value={this.state.FunctionalStatus}
                                maxLength={100}
                            />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.addVisit()}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}
                                    >
                                        Add Visit
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </CommonView >
        );
    }
}
const styles = StyleSheet.create({
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    iconCss: {
        marginTop: 5, marginRight: 10
    },
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#8dd5ee',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 3,
        flexDirection: 'row'
    }
});
export default AddVisit;
