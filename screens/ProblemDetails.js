/* eslint-disable global-require */
/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, AlertIOS, Dimensions, TextInput, ToastAndroid, NetInfo, Platform } from 'react-native';
import { AntDesign, MaterialIcons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import Moment from 'moment';
import Utility from '../components/Utility';
import { ADD_PROBLEM, DELETE_PROBLEM, HOSP_DELETE_PROBLEM, HOSP_ADD_PROBLEM } from '../constants/APIUrl';
import { CLINICAL_DOCS_DELETE_SUCCESS_MSG, CLINICAL_DOCS_UPDATE_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
let ADD_PROBLEM_URL = '';
let DELETE_PROBLEM_URL = '';

const medicationAllergy = [{ value: 'Yes' }, { value: 'No' }];
const statusData = [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }];
class ProblemDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
        this.state = { access_token: '', user_id: '', problem: 'yes', problemName: '', dataSource: '', remarks: '', problemDescription: '', startDate: today, endDate: today, problemId: '', isLoading: true, medicationResp: [], showMenu: false, refreshing: false, medicationId: '', backPress: 1, todayDate: today, med_name: '', other_name: '', dose: '', dose_unit: '', applied: '', instructions: '', status: '', isProblemActive: false };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        ADD_PROBLEM_URL = ADD_PROBLEM;
        DELETE_PROBLEM_URL = DELETE_PROBLEM;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_PROBLEM_URL = USER_DATA.ServiceURL + HOSP_ADD_PROBLEM;
            DELETE_PROBLEM_URL = USER_DATA.ServiceURL + HOSP_DELETE_PROBLEM;
        }
        const { params } = this.props.navigation.state;
        this.setState({
            problemId: params.problemId,
            access_token: USER_DATA.ACCESS_TOKEN,
            user_id: USER_DATA.User_Id,
            dataSource: params.dataSource,
        });
        /***********************Getting Problem Data By Id *********************************************************/
        fetch(`${ADD_PROBLEM_URL}?problemId=${this.state.problemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.access_token}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                let problemData = res.responseData;
                console.log(res.responseData);
                this.setState({
                    isLoading: false,
                    problemName: problemData.problemName,
                    startDate: Moment(problemData.startDate).format('MM/DD/YYYY'),
                    endDate: Moment(problemData.endDate).format('MM/DD/YYYY'),
                    problemDescription: problemData.problemDescription,
                    remarks: problemData.remarks,
                    status: problemData.status,
                    isProblemActive: problemData.isProblemActive,
                });
            })
            .catch(err => {
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
                this.setState({ refreshing: false });
                return;
            });
    }
    /*............................................................Delete Problem Record.........................................*/
    DeleteProblemData = (problemId) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(problemId) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };

    deleteConfirm = async (problemId) => {
        let data = `problemId=${this.state.problemId}`;
        fetch(DELETE_PROBLEM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.access_token}`,
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
                        this.props.navigation.navigate('Problems');
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
    /************************************************************************************************************** */
    /***************************Upadate Problem Data  *********************************************************************/
    updateProblem = () => {
        if (this.state.problemName.length <= 0) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter problem name',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter problem name');
            }
            return;
        }
        if (Moment(this.state.endDate).isSameOrAfter(this.state.startDate)) {
            let { endDate, startDate, status, problemDescription, isProblemActive } = this.state;
            const ProblemDetilsData =
            {
                problemId: this.state.problemId,
                patientId: this.state.user_id,
                problemName: this.state.problemName,
                startDate: Moment(startDate).format('MM/DD/YYYY'),
                endDate: Moment(endDate).format('MM/DD/YYYY'),
                status: status,
                isProblemActive: isProblemActive,
                problemDescription: problemDescription,
                appointmentDate: '1/1/0001 12:00:00 AM'
            };
            fetch(ADD_PROBLEM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.state.access_token}`,
                },
                body: JSON.stringify(ProblemDetilsData)
            }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.show(CLINICAL_DOCS_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                    } else {
                        AlertIOS.alert(CLINICAL_DOCS_UPDATE_SUCCESS_MSG);
                    }
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('Problems');
                    });
                }
            }).catch(err => {
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
        } else {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Start date prior to End date',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Start date prior to End date');
            }
        }
    }
    /****************************************************************************************************** */
    changeMedicalStatus = (val, index, data) => {
        console.log(val);
        if (val == 'Active') {
            this.setState({
                status: val,
                isProblemActive: true
            });
        } else {
            this.setState({
                status: val,
                isProblemActive: false
            });
        }
    };
    /******************************************************************************************************************************* */
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Medical Problem Details....</Text>
                </View>
            );
        }
        return (
            <CommonView problemsDetails>
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10 }}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#fff' }} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <MaterialIcons style={{ color: '#000' }} size={20} name="face" />
                            <TextInput
                                style={styles.inputField}
                                placeholder={'Problem Name'}
                                secureTextEntry={false}
                                fontSize={17}
                                onChangeText={(problemName) => this.setState({ problemName })}
                                value={this.state.problemName}
                                maxLength={50}
                            />
                            <AntDesign style={{ color: 'orange', position: 'absolute', right: 0 }} size={14} name="infocirlceo" />
                        </View>
                      <View><Text style={{ marginBottom: 10,fontSize: 17 }}>Status</Text>
                        <Dropdown
                            baseColor="#000"
                            // label=''
                            value={this.state.isProblemActive == true ? 'Active' : 'Inactive'}
                            data={statusData}
                            labelHeight={14}
                            fontSize={15}
                            inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                            textColor='#746E6E'
                            selectedItemColor='#41b4af'
                            containerStyle={{}}
                            onChangeText={(val, index, data) => this.changeMedicalStatus(val, index, data)}
                        /></View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center' }}>
                            <Text style={{ color: '#000', fontSize: 17, flex: 1, textAlignVertical: 'center' }}> Date Started :</Text>
                            <DatePicker
                                style={{ flex: 1, borderBottomWidth: 0.8, borderBottomColor: 'transparent' }}
                                date={this.state.startDate}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 15 }
                                }}
                                onDateChange={(startDate) => { this.setState({ startDate }); }}
                            />
                        </View>
                        {this.state.isProblemActive == false ?
                            <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center' }}>
                                <Text style={{ color: '#000', fontSize: 17, flex: 1, textAlignVertical: 'center' }}> Date Ended :</Text>
                                <DatePicker
                                    style={{ flex: 1, borderBottomWidth: 0.8, borderBottomColor: 'transparent' }}
                                    date={this.state.endDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="MM/DD/YYYY"
                                    minDate={this.state.startDate}
                                    // maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                        dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11 },
                                        dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 15 }
                                    }}
                                    onDateChange={(endDate) => {
                                        if (new Date(endDate) <= new Date(this.state.startDate)) {
                                            ToastAndroid.show('Date Started and Date ended cannot be same', ToastAndroid.SHORT);
                                            return false;
                                        } this.setState({ endDate });
                                    }}
                                /></View> :
                            <View />
                        }
                        
                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={{ color: '#000', marginTop: 3, marginRight: 5, marginLeft: 4 }} size={20} name='note' />
                                    <Text style={{ color: '#000', marginLeft: 5, fontSize: 17 }}>Notes</Text>
                                </View>
                                {/* <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 5 }} size={15} name='pluscircleo' /> */}
                            </View>
                            <TextInput
                                style={styles.inputData1}
                                placeholder={'Notes'}
                                fontSize={17}
                                placeholderTextColor="#746E6E"
                                secureTextEntry={false}
                                underlineColorAndroid="transparent"
                                onChangeText={(problemDescription) => this.setState({ problemDescription })}
                                value={this.state.problemDescription}
                                maxLength={100}
                            />
                        </View>
                        {this.state.dataSource == 2 ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '48%' }}>
                                    <TouchableOpacity onPress={() => { this.updateProblem(); }} style={{ marginBottom: 30, marginTop: 17, padding: 8, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '4%' }} />
                                <View style={{ width: '48%' }}>
                                    <TouchableOpacity onPress={() => { this.DeleteProblemData(); }} style={{ marginBottom: 30, marginTop: 17, paddingTop: 10, padding: 8, borderRadius: 20, backgroundColor: '#f92557' }}>
                                        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Delete</Text>
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
    card: {
        elevation: 3,
        width: (Dimensions.get('window').width) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    inputData1: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        marginBottom: 4,
        paddingTop: 9,
    },
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        fontSize: 12
    },
});
export default ProblemDetails;
