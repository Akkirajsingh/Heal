/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, Alert, ScrollView, ActivityIndicator, Image, StyleSheet, Text, NetInfo, Platform, AlertIOS, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, MaterialIcons, MaterialCommunityIcons, FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import Moment from 'moment';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { IMMUNIZATION, DELETE_IMMUNIZATION, HOSP_IMMUNIZATION, HOSP_DELETE_IMMUNIZATION } from '../constants/APIUrl';
import { CLINICAL_DOCS_UPDATE_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
let IMMUNIZATION_URL = '';
let DELETE_IMMUNIZATION_URL = '';

let CONNECTION_STATUS = false;
class ImmunizationDetails extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = {
            loadingMsg: 'Loading Immunization Details....', todayDate: today, immunizationId: '', Remindervalue: '', dataSource: '', userid: '', AccessToken: '', AccountId: '', emailId: '', reminderType: 0, mobilenumber: '', reminderDate: '', contactNo: '', description: '', reminder: '', SequenceNumber: '', immunizationName: '', immunizationDate: '', reminderset: '', isLoading: false, selectedHours: 0, selectedMinutes: '',
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
        DELETE_IMMUNIZATION_URL = DELETE_IMMUNIZATION;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            IMMUNIZATION_URL = USER_DATA.ServiceURL + HOSP_IMMUNIZATION;
            DELETE_IMMUNIZATION_URL = USER_DATA.ServiceURL + HOSP_DELETE_IMMUNIZATION;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            AccountId: USER_DATA.Id,
            immunizationId: params.immunizationId,
            dataSource: params.dataSource
        });
        this.getImmunizationById();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /************************ Get ImmunizationById Api Call ************************************************************/
    getImmunizationById = () => {
        fetch(`${IMMUNIZATION_URL}?immunizationId=${this.state.immunizationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((resp) => {
                if (resp.statusCode == 200) {
                    let res = resp.responseData;
                    this.setState({
                        description: res.description,
                        immunizationDate: Moment(res.immunizationDate).format("MM/DD/YYYY"),
                        immunizationName: res.immunizationName,
                        reminderset: res.reminderSet,
                        SequenceNumber: res.sequenceNumber,
                        isLoading: false,
                    });
                }
            })
            .catch(err => {
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
    /*************************************Update Immunization *********************************************************/
    updateImmunization = () => {
        const { immunizationName, immunizationDate } = this.state;
        const { navigate } = this.props.navigation;
        if (this.state.immunizationName.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'immunization name is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('immunization name is mandatory');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.immunizationName.length <= 1) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'immunization name is not valid',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('immunization name is not valid');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.immunizationDate.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'immunization Date is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('immunization Date is mandatory');
            } this.setState({
                isSending: false
            }); return;
        } else if (this.state.SequenceNumber.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'SequenceNumber is mandatory',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('SequenceNumber is mandatory');
            } this.setState({
                isSending: false
            }); return;
        }
            const ImmunizationData = {
                id: this.state.immunizationId,
                Description: this.state.description,
                ImmunizationDate: this.state.immunizationDate,
                ImmunizationName: this.state.immunizationName,
                PatientId: this.state.Userid,
                ReminderSet: this.state.reminderset,
                SequenceNumber: this.state.SequenceNumber,
            };
            fetch(IMMUNIZATION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.state.AccessToken}`,
                },
                body: JSON.stringify(ImmunizationData)
            }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('Immunization');
                    });
                }
            })
                .catch(err => {
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
    /**********************************Delete Immunization ************************************************************************/
    deleteImmunization = (id) => {
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
    deleteConfirm = async (id) => {
        this.setState({
            isLoading: true,
        });
        const data = `id=${this.state.immunizationId}`;
        fetch(DELETE_IMMUNIZATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_DELETE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('Immunization');
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
    /************************************************************************************************************ */
    render() {
        const { selectedHours, selectedMinutes } = this.state;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        } else {
            return (
                <CommonView ImmunizationDetails={true} >
                    <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7 }}>
                        <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                            <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                                <AntDesign style={{ paddingTop: 13, paddingRight: 4 }} size={18} name='medicinebox' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 10 }}>Immunization Name :        </Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Immunization Name'}
                                    secureTextEntry={false}
                                    maxLength={50}
                                    fontSize={14}
                                    value={this.state.immunizationName}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(immunizationName) => this.setState({ immunizationName })}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3, paddingTop: 5 }}>
                                <MaterialCommunityIcons style={{  paddingRight: 4, paddingTop: 11 }} size={18} name='calendar-clock' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 8 }}>
                                    Date Given :
                                    </Text>
                                <DatePicker
                                    style={{ width: '60%', backgroundColor: 'transparent', }}
                                    date={this.state.immunizationDate}
                                    mode="date" 
                                    format="MM/DD/YYYY"
                                    placeholder="select date"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 10 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 4, marginTop: 5 }
                                    }}
                                    onDateChange={(immunizationDate) => { this.setState({ immunizationDate }); }}
                                /></View>
                            <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                                <MaterialCommunityIcons style={{ paddingRight: 4, paddingTop: 14 }} size={18} name='checkbox-multiple-blank-outline' />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 12 }}>Sequence Number :        </Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Number of Sequence'}
                                    secureTextEntry={false}
                                    keyboardType={'numeric'}
                                    maxLength={30}
                                    fontSize={14}
                                    value={this.state.SequenceNumber}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(SequenceNumber) => this.setState({ SequenceNumber })}
                                />
                            </View>
                            <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393', }}>
                                <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <SimpleLineIcons style={{ color: '#3AA6CD', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={15} name='note' />
                                        <Text style={{ color: '#000', marginLeft: 5, fontSize: 17 }}>Notes</Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.inputData1}
                                    placeholder={'Notes'}
                                    fontSize={14}
                                    maxLength={500}
                                    placeholderTextColor="#746E6E"
                                    value={this.state.description}
                                    secureTextEntry={false}
                                    onChangeText={(description) => this.setState({ description })}
                                />
                            </View>
                            {this.state.dataSource == 2 ?
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '44%' }}>
                                        <TouchableOpacity onPress={() => { this.updateImmunization(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                            <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '12%' }} />
                                    <View style={{ width: '44%' }}>
                                        <TouchableOpacity onPress={() => { this.deleteImmunization(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
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
    }
}

const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 2,
        flexDirection: 'row'
    },
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        marginBottom: 7,
        paddingTop: 6,
        fontSize: 12,
        paddingBottom: 5
    },
    inputData1: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        marginBottom: 4,
        paddingTop: 9,
    },
    reminderContainer: {
        borderWidth: 0.3,
        borderColor: '#7EE5A8',
        paddingTop: 12, paddingBottom: 7,
        paddingLeft: 7
    }
});

export default ImmunizationDetails;