/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, Alert, TouchableOpacity, ActivityIndicator, Platform, AlertIOS, AsyncStorage, View, ImageBackground, Dimensions, RefreshControl, BackHandler, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { SimpleLineIcons, MaterialCommunityIcons, Foundation, FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import { RELATIONSHIP_DATA, FAMILY_HISTORY, HOSP_RELATIONSHIP_DATA, HOSP_FAMILY_HISTORY } from '../constants/APIUrl';
import { FAMILY_HISTORY_ADDED_SUCCESS_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import Validation from '../components/Validation';

let RELATIONSHIP_DATA_URL = '';
let FAMILY_HISTORY_URL = '';
let CONNECTION_STATUS = false;
const statusData = [{ value: 'Active' }, { value: 'Inactive' }];
let today = new Date();
today.setDate(today.getDate() + 1);
let futurDate = new Date(today);
class AddFamilyHistory extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        this.state = { AccessToken: '', Userid: '', FirstName: '', LastName: '', addNotes: false, RelationshipData: [], RelativeCondition: '', Status: '', DateOfBirth: '', deathDate: '', causedDeath: '', Resolution: '', RelationShipSelectedItems: '' };
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
        console.log('params', params);
        RELATIONSHIP_DATA_URL = RELATIONSHIP_DATA;
        FAMILY_HISTORY_URL = FAMILY_HISTORY;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            RELATIONSHIP_DATA_URL = USER_DATA.ServiceURL + HOSP_RELATIONSHIP_DATA;
            FAMILY_HISTORY_URL = USER_DATA.ServiceURL + HOSP_FAMILY_HISTORY;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
        });
        this.relationShipData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    changeStatus = (val, index, data) => {
        this.setState({
            Status: val
        });
    };
    changeRelationShipStatus = (value) => {
        this.setState({
            RelationShipSelectedItems: value
        });
    }
    addNotes() {
        this.setState({
            addNotes: !this.state.addNotes
        });
    }
    /******************************** RelationShip API call ***************************************************************/
    relationShipData = () => {
        fetch(RELATIONSHIP_DATA_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json())
            .then((responseJson) => {
                const count = Object.keys(responseJson.responseData).length;
                let drop_down_data = [];
                for (let i = 0; i < count; i++) {
                    drop_down_data.push({ label: responseJson.responseData[i].relationshipEN, value: responseJson.responseData[i].id });
                }
                this.setState({
                    RelationshipData: drop_down_data,
                    isLoading: false,
                }, () => {
                });
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /***********************************Add Family Hiatory *************************************************/
    saveFamilyHistory = () => {
        const { FirstName, LastName, RelativeCondition, OnsetDate, DateOfBirth, Resolution, RelationShipSelectedItems } = this.state;
        let obj = [FirstName, LastName, RelativeCondition, OnsetDate, RelationShipSelectedItems, DateOfBirth, Resolution ];
        let mandatoryMsg = ['Enter Relative First Name', 'Enter Relative Last Name', 'Enter Relative Condition', 'Select Onset Date', 'Select RelationShip', 'Select Date Of Birth', 'Enter Resolution' ];
        let pattern = [/^.{3,100}$/, "", "", "", "", "", "" ];
        let patternMsg = ["Name should be between 3 and 100 characters", "", "", "", "", "", "" ];
        let length = [3, "", "", "", "", "", "" ];
        let lengthMsg = ["Please enter Relative First Name atleast minimum of 3 characters", "", "", "", "", "", "" ];
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
        let status = '';
        if (this.state.Status == 'Active') {
            status = 'true';
            const end_date = '';
        } else {
            status = 'false';
            const end_date = this.state.end_date;
        }
        const start_date = this.state.start_date;
        const FamilyData = { BirthDate: this.state.DateOfBirth, ConditionName: this.state.RelativeCondition, DataSource: 'Patient', Id: 0, IsActive: status, Note: this.state.Note, OnsetDate: this.state.OnsetDate, PatientId: this.state.Userid, Relationship: this.state.RelationShipSelectedItems, RelativeFirstName: this.state.FirstName, RelativeFullName: this.state.FirstName, RelativeLastName: this.state.LastName, Resolution: this.state.Resolution, Status: this.state.Status };
        console.log("FamilyData", FamilyData);
        fetch(FAMILY_HISTORY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: JSON.stringify(FamilyData)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            console.log(res, FamilyData);
            if (res.statusCode == 200) {
                ToastAndroid.show(FAMILY_HISTORY_ADDED_SUCCESS_MSG, ToastAndroid.SHORT);
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('FamilyHistory');
                });
            }
        })
            .catch(err => {
                this.setState({
                    isSending: false
                });
                console.log('ProblemErrormsg:', err);
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };
    render() {
        return (
            <CommonView FamilyHistory>
                <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={styles.inputField} >
                            <FontAwesome size={20} style={styles.iconCss} name="user" />
                            <TextInput
                                placeholder={'Relative First Name:'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(FirstName) => this.setState({ FirstName })}
                                value={this.state.FirstName}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <FontAwesome size={20} style={styles.iconCss} name="user" />
                            <TextInput
                                placeholder={'Relative Last Name'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(LastName) => this.setState({ LastName })}
                                value={this.state.LastName}
                            />
                        </View>
                        <View style={styles.inputField} >
                            <Ionicons size={20} style={styles.iconCss} name="md-person" />
                            <TextInput
                                placeholder={'Relative Condition'}
                                secureTextEntry={false}
                                maxLength={50}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                onChangeText={(RelativeCondition) => this.setState({ RelativeCondition })}
                                value={this.state.RelativeCondition}
                            />
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.textFont}> Onset Date</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name='calendar-clock' />
                            <DatePicker
                                style={{ borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                date={this.state.OnsetDate}
                                mode="date"
                                fontSize={11}
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(OnsetDate) => { this.setState({ OnsetDate }); }}
                            />
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.textFont}>Relationship</Text>
                            <Dropdown
                                baseColor="#000"
                                label=''
                                value={this.state.RelationShipSelectedItems}
                                data={this.state.RelationshipData}
                                textColor='#746E6E'
                                labelHeight={6}
                                fontSize={17}
                                selectedItemColor='#41b4af'
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                containerStyle={{ marginBottom: 15, marginTop: 15 }}
                                onChangeText={(val, index, data) => this.changeRelationShipStatus(val, index, data)}
                            />
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.textFont}> Date of birth</Text>
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                            <MaterialCommunityIcons size={20} style={styles.iconCss} name='calendar-clock' />
                            <DatePicker
                                style={{ borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                date={this.state.DateOfBirth}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                    placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                }}
                                onDateChange={(DateOfBirth) => { this.setState({ DateOfBirth }); }}
                            />
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 20, marginBottom: 10 }}>
                            <Text style={{ fontSize: 17 }} >Status</Text>
                            {this.state.Status == 'Active' ? <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ Status: 'Active' })}><View style={styles.activestatus}>
                                    <View style={{ borderColor: 'white', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>

                                        <Text style={{ color: 'white' }}>Active</Text>
                                    </View></View></TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ Status: 'Inactive' })}><View style={styles.Inactivestatus}>
                                    <View style={{ borderColor: "#cdcdcd", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>
                                        <Text style={{ color: '#cdcdcd' }}>Inactive</Text>
                                    </View></View></TouchableOpacity>
                            </View> : <View style={{ marginRight: 15, flexDirection: "row", justifyContent: "center" }}>
                                    <TouchableOpacity style={{ marginRight: 15, marginLeft: 20 }} onPress={() => this.setState({ Status: 'Active' })}><View style={styles.Inactivestatus}>
                                        <View style={{ borderColor: '#cdcdcd', flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: '#cdcdcd', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: '#cdcdcd' }}></View></View>

                                            <Text style={{ color: '#cdcdcd' }}>Active</Text>
                                        </View></View></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({ Status: 'Inactive' })}><View style={styles.activestatus}>
                                        <View style={{ borderColor: "white", flexDirection: "row", justifyContent: "center" }} ><View style={{ borderRadius: 50, height: 12, width: 12, borderColor: 'white', borderWidth: 2, marginTop: 2, marginRight: 10 }}><View style={{ borderRadius: 50, height: 6, width: 6, margin: 1, backgroundColor: 'white' }}></View></View>
                                            <Text style={{ color: 'white' }}>Inactive</Text>
                                        </View></View></TouchableOpacity>
                                </View>}
                        </View>
                        <View style={styles.inputField} >
                            <Foundation size={20} style={styles.iconCss} name="clipboard-notes" />
                            <TextInput
                                placeholder={'Resolution'}
                                maxLength={100}
                                style={{width:'100%', fontSize: 17}}
                                placeholderTextColor='#938F97'
                                secureTextEntry={false}
                                onChangeText={(Resolution) => this.setState({ Resolution })}
                                value={this.state.Resolution}
                            />
                        </View>
                        {this.state.Status == 'Inactive' ?
                            <View>
                                <View style={{ marginTop: 15 }}>
                                    <Text style={styles.textFont}> Date Of Death</Text>
                                </View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                                    <MaterialCommunityIcons size={20} style={styles.iconCss} name='calendar-clock' />
                                    <DatePicker
                                        style={{ borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                        date={this.state.deathDate}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        minDate={this.state.DateOfBirth}
                                        maxDate={new Date()}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                            dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                            placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                        }}
                                        onDateChange={(deathDate) => { this.setState({ deathDate }); }}
                                    />
                                </View>

                                <View><View style={{ marginTop: 15 }}>
                                    <Text style={styles.textFont}> Cause Of Death</Text>
                                </View>
                                    <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, alignItems: 'center', paddingBottom: 3 }}>
                                        <MaterialCommunityIcons size={20} style={styles.iconCss} name='calendar-clock' />
                                        <DatePicker
                                            style={{ borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 25, paddingBottom: 5 }}
                                            date={this.state.causedDeath}
                                            mode="date"
                                            placeholder="select date"
                                            format="MM/DD/YYYY"
                                            minDate={this.state.DateOfBirth}
                                            maxDate={new Date()}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                                dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 17 },
                                                dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 },
                                                placeholderText: { color: '#938F97', justifyContent: 'center', alignItems: 'center', fontSize: 17, marginBottom: 5, marginTop: 5 }
                                            }}
                                            onDateChange={(causedDeath) => { this.setState({ causedDeath }); }}
                                        />
                                    </View></View></View>
                            : null}
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
                            style={{ width: '100%', marginTop: 10, marginBottom: 5, height: 30, borderBottomWidth: 0.4, borderBottomColor: 'grey', fontSize: 17 }}
                                placeholder={'Note'}
                                placeholderTextColor='#938F97'
                                value={this.state.Note}
                                onChangeText={(Note) => this.setState({ Note })}
                                maxLength={100}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 7, paddingBottom: 12 }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => { this.saveFamilyHistory(); }} >
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        Add Family History
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View >
            </CommonView >
        );
    }
}

const styles = StyleSheet.create({
    inputField: {
        height: 30, width: '100%', marginTop: 10, marginBottom: 5, flexDirection: 'row', borderBottomWidth: 0.4, borderBottomColor: 'grey', color: '#CBCACA'
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
    activestatus: {
        borderRadius: 8, borderColor: 'white', backgroundColor: '#2fd473', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },
    Inactivestatus: {
        borderRadius: 6, borderColor: '#cdcdcd', paddingLeft: 12, paddingRight: 12, flexDirection: "row", paddingBottom: 8, paddingTop: 8, elevation: 3
    },
    notes: {
        flexDirection: 'row', backgroundColor: '#f3f6fb', alignItems: 'center', justifyContent: 'space-between', borderColor: '#746E6E', borderWidth: 0.2, paddingTop: 4, paddingBottom: 4, marginBottom: 6
    },
    textFont: {
        marginBottom: 5, fontSize: 17
    },
    icons1: {
        color: '#000', marginRight: 4, marginLeft: 4
    },
    plusCircleIcon: {
        color: '#000', marginTop: 3, marginRight: 5
    },
});
export default AddFamilyHistory;
