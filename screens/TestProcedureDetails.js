/* eslint-disable object-property-newline */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, Alert, ScrollView, ActivityIndicator, Platform, Image, StyleSheet, Text, NetInfo, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage, AlertIOS } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, MaterialIcons, MaterialCommunityIcons, FontAwesome, Foundation, AntDesign, Entypo } from '@expo/vector-icons';
import Moment from 'moment';
import Utility from '../components/Utility';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { Dropdown } from 'react-native-material-dropdown';
import { GET_TEST_RESULT, DELETE_TEST_RESULT, HOSP_DELETE_TEST_RESULT, HOSP_ADD_TEST_RESULT } from '../constants/APIUrl';
import { UPDATE_TEST_PROCEDURE, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
let GET_TEST_RESULT_URL = GET_TEST_RESULT;
let DELETE_TEST_RESULT_URL = DELETE_TEST_RESULT;
let CONNECTION_STATUS = false;
const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class TestProcedureDetails extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        this.state = {
            testProcId: '', AccessToken: '', Userid: '', TestName: '', dateSubmitted: '', orderedBy: '', providerName: '', resultName: '',
            resultDate: '', resultValue: '', remark: '', isLoading: true, dataSource: '', status: '', loadingMsg: 'Loading Test And Procedure Details...'
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
        GET_TEST_RESULT_URL = GET_TEST_RESULT;
        DELETE_TEST_RESULT_URL = DELETE_TEST_RESULT;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        console.log("USER_DATA", USER_DATA)
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            GET_TEST_RESULT_URL = USER_DATA.ServiceURL + HOSP_ADD_TEST_RESULT;
            DELETE_TEST_RESULT_URL = USER_DATA.ServiceURL + HOSP_DELETE_TEST_RESULT;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            testProcId: params.testProcId,
            dataSource: params.dataSource
        });
        this.getTestProcedureById();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /************************ Get ImmunizationById Api Call ************************************************************/
    getTestProcedureById = () => {
        fetch(`${GET_TEST_RESULT_URL}?testResultId=${this.state.testProcId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `bearer ${this.state.AccessToken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((resp) => {
                console.log("test", resp);
                if (resp.statusCode == 200) {
                    const res = resp.responseData;
                    this.setState({
                        TestName: res.nameOfTest,
                        dateSubmitted: Moment(res.dateSubmitted).format('MM/DD/YYYY'),
                        status: res.isActive,
                        orderedBy: res.orderedBy,
                        providerName: res.providerName,
                        resultName: res.resultName,
                        resultDate: Moment(res.resultDate).format('MM/DD/YYYY'),
                        resultValue: res.resultValue,
                        remark: res.remark,
                        isLoading: false,
                    });
                }
            })
            .catch(err => {
                this.setState({
                    isLoading: false,
                });
                const errMSg = '';
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
                }
            });
    }
    /*************************************Update Immunization *********************************************************/
    updateTestProc = () => {
        const TestProcreg = /^.{3,100}$/;
        const { navigate } = this.props.navigation;
        const { TestName, dateSubmitted, resultDate, remark, resultValue, resultName, providerName, orderedBy } = this.state;
        if (TestName === '' || dateSubmitted === '' || resultDate === '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'All Fields are Mandatory..',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('All Fields are Mandatory..');
            } this.setState({
                isSending: false
            }); return;
        } else if (TestProcreg.test(TestName) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter TestName atleast minimum of 3 characters',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter TestName atleast minimum of 3 characters');
            } this.setState({
                isSending: false
            }); return;
        }
        let statusRecord = '';
        let statusPos = '';
        if (this.state.status == 'Active' || this.state.status == true) {
            statusRecord = true;
            statusPos = 'Active';
        } else {
            statusRecord = false;
            statusPos = 'Inactive';
        }
        const TestProcData = {
            Id: this.state.testProcId,
            DateSubmitted: this.state.dateSubmitted,
            IsActive: statusRecord,
            NameOfTest: this.state.TestName,
            OrderedBy: this.state.orderedBy,
            PatientId: this.state.Userid,
            ProviderName: this.state.providerName,
            Remark: this.state.remark,
            ResultDate: this.state.resultDate,
            ResultName: this.state.resultName,
            ResultValue: this.state.resultValue,
            Status: statusPos,
        };
        console.log("TestProcData", TestProcData);
        fetch(GET_TEST_RESULT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(TestProcData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.show(UPDATE_TEST_PROCEDURE, ToastAndroid.SHORT);
                } else {
                    AlertIOS.alert(UPDATE_TEST_PROCEDURE);
                }
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('TestAndProcedures');
                });
            }
        })
            .catch(err => {
                this.setState({
                    isLoggingIn: false,
                });
                const errMSg = '';
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
                }
            });
    }
    /**********************************Delete Immunization ************************************************************************/
    deleteTestProc = (id) => {
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
        const data = `id=${this.state.testProcId}`;
        fetch(DELETE_TEST_RESULT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.show(CLINICAL_DOCS_DELETE_SUCCESS_MSG, ToastAndroid.SHORT);
                    } else {
                        AlertIOS.alert(CLINICAL_DOCS_DELETE_SUCCESS_MSG);
                    }
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('TestAndProcedures');
                    });
                }
            })
            .catch(err => {
                this.setState({
                    isLoading: false,
                });
                const errMSg = aPIStatusInfo.logError(err);
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
                }
            });
    };
    /************************************************************************************************************ */
    changeTestStatus = (val) => {
        this.setState({
            status: val
        });
    };

    render() {
        const { selectedHours, selectedMinutes } = this.state;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        }
        return (
            <CommonView TestProcedure >
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 10, paddingRight: 4 }} size={20} name='test-tube' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Test Name : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Test Name'}
                                    secureTextEntry={false}
                                    fontSize={14}
                                    value={this.state.TestName}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(TestName) => this.setState({ TestName })}
                                />
                            </View></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#746E6E', borderBottomWidth: 0.3, paddingTop: 5 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingRight: 4, paddingTop: 8 }} size={20} name='calendar-clock' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 8 }}>
                                    Date :
 </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <DatePicker
                                    // style={{ width: '40%', backgroundColor: 'transparent', }}
                                    date={this.state.dateSubmitted}
                                    mode="date"
                                    format="MM/DD/YYYY"
                                    placeholder="Test date"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 10 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 4, marginTop: 5 }
                                    }}
                                    onDateChange={(dateSubmitted) => { this.setState({ dateSubmitted }); }}
                                /></View></View>
                            <View><Text style={{ marginBottom: 10, fontSize: 17 }}>Overall Status</Text>
                        <Dropdown
                            baseColor="#000"
                            label=''
                            value={this.state.status == true ? 'Active' : 'Inactive'}
                            data={statusData}
                            textColor='#746E6E'
                            labelHeight={7}
                            fontSize={14}
                            inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                            selectedItemColor='#41b4af'
                            containerStyle={{ paddingLeft: 5, marginTop: 10 }}
                            onChangeText={(val, index, data) => this.changeTestStatus(val, index, data)}
                        /></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialCommunityIcons style={{ paddingRight: 4, paddingTop: 9 }} size={20} name='checkbox-multiple-blank-outline' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Ordered By : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'orderedBy'}
                                    secureTextEntry={false}
                                    maxLength={100}
                                    fontSize={14}
                                    value={this.state.orderedBy}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(orderedBy) => this.setState({ orderedBy })}
                                />
                            </View></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <FontAwesome style={{ paddingRight: 4, paddingTop: 9 }} size={20} name='user-md' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Provider Name : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Provider Name'}
                                    secureTextEntry={false}
                                    maxLength={100}
                                    fontSize={14}
                                    value={this.state.providerName}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(providerName) => this.setState({ providerName })}
                                />
                            </View></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <Foundation style={{ paddingRight: 4, paddingTop: 9 }} size={20} name='results' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Name of Result : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Result Name'}
                                    secureTextEntry={false}
                                    maxLength={100}
                                    fontSize={14}
                                    value={this.state.resultName}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(resultName) => this.setState({ resultName })}
                                />
                            </View></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '49%', flexDirection: 'row' }}>
                                <MaterialIcons style={{  paddingRight: 4, paddingTop: 9 }} size={20} name='date-range' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Date of Result : </Text>
                            </View>
                            <View style={{ width: '51%' }}>
                                <DatePicker
                                    // style={{ width: '38%', backgroundColor: 'transparent', }}
                                    date={this.state.resultDate}
                                    mode="date"
                                    format="MM/DD/YYYY"
                                    placeholder="select date"
                                    minDate={this.state.dateSubmitted}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 10 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 14, marginBottom: 4, marginTop: 5 }
                                    }}
                                    onDateChange={(resultDate) => { this.setState({ resultDate }); }}
                                />
                            </View></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <Foundation style={{ paddingRight: 4, paddingTop: 9 }} size={20} name='results' />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 10 }}>Result Value : </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Result Value'}
                                    secureTextEntry={false}
                                    maxLength={100}
                                    fontSize={14}
                                    value={this.state.resultValue}
                                    placeholderTextColor="#746E6E"
                                    onChangeText={(resultValue) => this.setState({ resultValue })}
                                />
                            </View></View>
                        <View style={{ borderBottomWidth: 0.8, borderBottomColor: '#8d9393' }}>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={{  marginTop: 3, marginRight: 5, marginLeft: 4 }} size={20} name='note' />
                                    <Text style={{ color: '#000', marginLeft: 5, fontSize: 16 }}>Notes</Text>
                                </View>
                            </View>
                            <TextInput
                                style={styles.inputData1}
                                placeholder={'Note'}
                                maxLength={500}
                                fontSize={14}
                                placeholderTextColor="#746E6E"
                                value={this.state.remark}
                                secureTextEntry={false}
                                onChangeText={(remark) => this.setState({ remark })}
                            />
                        </View>
                        {this.state.dataSource == 2 ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.updateTestProc(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '12%' }} />
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.deleteTestProc(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
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
        marginBottom: 4,
        paddingTop: 6,
        fontSize: 12,
        paddingBottom: 3
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
        paddingTop: 12,
        paddingBottom: 7,
        paddingLeft: 7
    }
});

export default TestProcedureDetails;