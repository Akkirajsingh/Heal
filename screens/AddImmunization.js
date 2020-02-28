import React, { Component } from 'react';
import { TextInput, Image, ScrollView, ActivityIndicator, StyleSheet, Text, NetInfo, Platform, AlertIOS, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Utility from '../components/Utility';
import { IMMUNIZATION, HOSP_IMMUNIZATION } from '../constants/APIUrl';
import { IMMUNIZATION_ADDED_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Validation from '../components/Validation';

const ReminderSet = [{ value: 'True' }, { value: 'False' }];
let IMMUNIZATION_URL = '';
let CONNECTION_STATUS = false;
class AddImmunization extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = {
            loadingMsg: 'Loading Medical Problems....', userid: '', AccessToken: '', addNotes: false, AccountId: '', emailId: '', reminderType: '', reminderDate: '', contactNo: '', description: '', reminder: false, SequenceNum: '', immunizationName: '', immunizationDate: '', isLoading: false, selectedHours: 0, selectedMinutes: 0,
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
        IMMUNIZATION_URL = IMMUNIZATION;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            IMMUNIZATION_URL = USER_DATA.ServiceURL + HOSP_IMMUNIZATION;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            AccountId: USER_DATA.Id
        });
    }
    /********************************************************************************************************** */
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*****************************************************Add Immunization Api Call *****************************************************************/
    saveImmunization = () => {
        const { navigate } = this.props.navigation;
        const { immunizationName, immunizationDate, SequenceNum } = this.state;
        let obj = [immunizationName, immunizationDate, SequenceNum ];
        let mandatoryMsg = ['Enter Immunization Name', 'Select Immmunization Date', 'Enter Sequence Number' ];
        let pattern = [/^.{3,100}$/, "", "" ];
        let patternMsg = ["Immunization Name should be between 3 and 100 characters", "", "" ];
        let length = [3, "", ""  ];
        let lengthMsg = ["Please enter Immunization Name atleast minimum of 3 characters", "", "" ];
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
        const ImmunizationData = {
            Description: this.state.description,
            ImmunizationDate: this.state.immunizationDate,
            ImmunizationName: this.state.immunizationName,
            PatientId: this.state.Userid,
            ReminderSet: this.state.reminder,
            SequenceNumber: this.state.SequenceNum,
        };
        console.log(ImmunizationData);
        fetch(IMMUNIZATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(ImmunizationData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(IMMUNIZATION_ADDED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('Immunization');
                });
            }
        })
            .catch(err => {
                console.log('errlog', err);
                this.setState({
                    isLoggingIn: false,
                });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    /************************************************************************************************************ */
    render() {
        const { selectedHours, selectedMinutes } = this.state;
        return (
            <CommonView AddImmunization={true} >
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7  }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <AntDesign style={styles.iconCss} size={20} name='medicinebox' />
                            <TextInput
                                placeholder={'Immunization Name'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(immunizationName) => this.setState({ immunizationName })}
                            />
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>Date Given</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3 }}>
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='calendar-clock' />
                            <DatePicker
                                date={this.state.immunizationDate}
                                mode="date"
                                placeholder="Date Given"
                                format="MM/DD/YYYY"
                                maxDate={this.state.start_date}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 4 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 4, marginTop: 4 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(immunizationDate) => { this.setState({ immunizationDate }); }}
                            /></View>

                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='checkbox-multiple-blank-outline' />
                            <TextInput
                                placeholder={'Number Of Sequence'}
                                secureTextEntry={false}
                                maxLength={30}
                                keyboardType={'numeric'}
                                style={{width:'100%', fontSize: 17 }}
                                placeholderTextColor='#938F97'
                                onChangeText={(SequenceNum) => this.setState({ SequenceNum })}
                            />
                        </View>

                        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => { this.addNotes(); }} >
                            <View style={styles.notes}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={styles.icons1} size={20} name='note' />
                                    <Text style={styles.boxTextCss}>Notes</Text>
                                </View>
                                {!this.state.addNotes ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                            </View></TouchableOpacity>
                        {this.state.addNotes ?
                            <TextInput
                                placeholder={'Notes'}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(description) => this.setState({ description })}
                                maxLength={100}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveImmunization(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Immunization
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
    iconCss: {
        marginTop: 5, marginRight: 10
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
});

export default AddImmunization;