/* eslint-disable import/newline-after-import */
/* eslint-disable object-property-newline */
import React, { Component } from 'react';
import { TextInput, ScrollView, ActivityIndicator, StyleSheet, Text, NetInfo, TouchableOpacity, View, Dimensions, ToastAndroid, AsyncStorage, Platform, AlertIOS } from 'react-native';
import DatePicker from 'react-native-datepicker';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, MaterialIcons, MaterialCommunityIcons, FontAwesome, Foundation, AntDesign, Entypo } from '@expo/vector-icons';
import Utility from '../components/Utility';
import { ADD_TEST_RESULT, HOSP_ADD_TEST_RESULT } from '../constants/APIUrl';
import { TEST_RESULT_ADDED_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { Dropdown } from 'react-native-material-dropdown';
import Validation from '../components/Validation';
import aPIStatusInfo from '../components/ErrorHandler';
let ADD_TEST_RESULT_URL = '';

let CONNECTION_STATUS = false;
const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class AddTestAndProcedure extends Component {
    constructor(props) {
        super(props);
        this.state = {
            AccessToken: '', Userid: '', TestName: '', addNotes: false, todayDate: new Date(), dateSubmitted: new Date(), orderedBy: '', providerName: '', resultName: '',
            resultDate: '', resultValue: '', remark: '', status: ''
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
        ADD_TEST_RESULT_URL = ADD_TEST_RESULT;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            ADD_TEST_RESULT_URL = USER_DATA.ServiceURL + HOSP_ADD_TEST_RESULT;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
        });
    }
    /********************************************************************************************************** */
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*****************************************************Add Immunization Api Call *****************************************************************/
    saveTestProc = () => {
        const { navigate } = this.props.navigation;
        const { TestName, dateSubmitted, resultDate, Status, resultName, providerName } = this.state;
        let obj = [TestName, dateSubmitted, providerName, resultName, resultDate];
        let mandatoryMsg = ['Enter Test Name', 'Select Test Date', 'Enter Provider Name', 'Enter Name Of Result', 'Select Date Of Result' ];
        let pattern = [/^.{3,100}$/, "", "", "", ""];
        let patternMsg = ["Test Name should be between 3 and 100 characters", "", "", "", ""];
        let length = [3, "", "", "", ""];
        let lengthMsg = ["Please enter Test Name atleast minimum of 3 characters", "", "", "", ""];
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
        let statusRecord = '';
        if (this.state.status == 'Active') {
            statusRecord = 'true';
        } else {
            statusRecord = 'false';
        }
        const TestProcData = {
            Id: null,
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
            Status: this.state.status
        };

        console.log(TestProcData);
        fetch(ADD_TEST_RESULT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(TestProcData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                ToastAndroid.show(TEST_RESULT_ADDED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('TestAndProcedures');
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
    changeTestStatus = (val) => {
        console.log('val', val);
        this.setState({
            status: val
        });
    };
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    /************************************************************************************************************ */
    render() {
        return (
            <CommonView AddTestOrProcedure >
                <View style={{ flex: 1, paddingLeft: 7, paddingRight: 7 }}>
                    <ScrollView style={{ paddingLeft: 10, paddingRight: 10 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='test-tube' />
                            <TextInput
                                placeholder={'Test Name'}
                                secureTextEntry={false}
                                style={{width:'100%', fontSize: 17}}
                                value={this.state.TestName}
                                placeholderTextColor='#938F97'
                                onChangeText={(TestName) => this.setState({ TestName })}
                            />
                        </View>
                        <View >
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>Test Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='calendar-clock' />
                            <DatePicker
                                date={this.state.dateSubmitted}
                                mode="date"
                                placeholder="Test Date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(dateSubmitted) => { this.setState({ dateSubmitted }); }}
                            /></View>
                        <View style={{ flexDirection: "column", marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontSize: 17 }} >Overall Status</Text>
                            {this.state.status == 'Active' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                        <Text style={{ color: 'white' }}>Active</Text>
                                    </View></View></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.Inactivestatus}>
                                    <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                        <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                    </View></View></TouchableOpacity>
                            </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ status: 'Active' })}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                            <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({ status: 'Inactive' })}><View style={styles.activestatus}>
                                        <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                            <Text style={{ color: 'white' }}>Inactive</Text>
                                        </View></View></TouchableOpacity>
                                </View>}
                        </View>
                        <View style={styles.inputField} >
                            <MaterialCommunityIcons style={styles.iconCss} size={20} name='checkbox-multiple-blank-outline' />
                            <TextInput
                                placeholder={'Ordered By'}
                                secureTextEntry={false}
                                maxLength={100}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                value={this.state.orderedBy}
                                onChangeText={(orderedBy) => this.setState({ orderedBy })}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <FontAwesome style={styles.iconCss} size={20} name='user-md' />
                            <TextInput
                                placeholder={'Provider Name'}
                                secureTextEntry={false}
                                maxLength={100}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                value={this.state.providerName}
                                onChangeText={(providerName) => this.setState({ providerName })}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <Foundation style={styles.iconCss} size={20} name='results' />
                            <TextInput
                                placeholder={'Name Of Result'}
                                secureTextEntry={false}
                                maxLength={100}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                value={this.state.resultName}
                                onChangeText={(resultName) => this.setState({ resultName })}
                            />
                        </View>
                        <View>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}>Date Of Result</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialIcons style={styles.iconCss} size={20} name='date-range' />
                            <DatePicker
                                date={this.state.resultDate}
                                mode="date"
                                placeholder="Date Of Result"
                                format="MM/DD/YYYY"
                                // maxDate={this.state.todayDate}
                                minDate={this.state.dateSubmitted}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#938F97', backgroundColor: 'transparent', width: '100%', fontSize: 15, marginBottom: 5, marginTop: 3 },
                                    dateText: { marginTop: 3 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(resultDate) => { this.setState({ resultDate }); }}
                            /></View>
                        <View style={styles.inputField} >
                            <Foundation style={styles.iconCss} size={20} name='results' />
                            <TextInput
                                placeholder={'Result Value'}
                                secureTextEntry={false}
                                maxLength={100}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                value={this.state.resultValue}
                                onChangeText={(resultValue) => this.setState({ resultValue })}
                            />
                        </View>
                        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => { this.addNotes(); }} >
                            <View style={styles.notes}>
                                <View style={{ flexDirection: 'row' }}>
                                    <SimpleLineIcons style={styles.icons1} size={19} name='note' />
                                    <Text style={styles.boxTextCss}>Notes</Text>
                                </View>
                                {!this.state.addNotes ? <AntDesign style={styles.plusCircleIcon} size={15} name='pluscircleo' /> : <AntDesign style={styles.plusCircleIcon} size={15} name='minuscircleo' />}
                            </View></TouchableOpacity>
                        {this.state.addNotes ?
                            <TextInput
                                placeholder={'Note'}
                                style={{ width: '100%', marginTop: 10, marginBottom: 5, height: 30, borderBottomWidth: 0.4, borderBottomColor: 'grey', fontSize: 17 }}
                                placeholderTextColor='#938F97'
                                value={this.state.remark}
                                fontSize={17}
                                onChangeText={(remark) => this.setState({ remark })}
                                maxLength={100}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveTestProc(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Test &amp; Procedure
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
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 4
    },
    iconCss: {
        marginTop: 5, marginRight: 10
    },
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    boxTextCss: {
        color: '#000', marginLeft: 5,
    },
    plusCircleIcon: {
        color: '#000', marginTop: 3, marginRight: 5
    },
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
    },
    activestatus: {
        borderRadius: 8, borderColor: 'white', backgroundColor: '#2fd473', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },
    Inactivestatus: {
        borderRadius: 6, borderColor: '#cdcdcd', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    }
});

export default AddTestAndProcedure;

