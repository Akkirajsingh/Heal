/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, AsyncStorage, View, Platform, AlertIOS, Dimensions, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import { SimpleLineIcons, MaterialCommunityIcons, Foundation, FontAwesome, Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-datepicker';
import { RELATIONSHIP_DATA, FAMILY_HISTORY, DELETE_FAMILY_HISTORY, HOSP_DELETE_FAMILY_HISTORY, HOSP_RELATIONSHIP_DATA, HOSP_FAMILY_HISTORY } from '../constants/APIUrl';
import { FAMILY_HISTORY_UPDATE_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';

let RELATIONSHIP_DATA_URL = '';
let FAMILY_HISTORY_URL = '';
let DELETE_FAMILY_HISTORY_URL = '';

let CONNECTION_STATUS = false;
let today = new Date();
today.setDate(today.getDate() + 1);
let futurDate = new Date(today);
const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class FamilyHistoryDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        this.state = { AccessToken: '', Userid: '', familyHistoryId: '', RelationshipData: [], RelationShipSelectedItems: '', isLoading: true, dataSource: '', relativeFirstName: '', relativeLastName: '', relativeCondition: '', onsetDate: '', status: '', dateOfBirth: '', Relationship: '', resolution: '', note: '' };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        RELATIONSHIP_DATA_URL = RELATIONSHIP_DATA;
        FAMILY_HISTORY_URL = FAMILY_HISTORY;
        DELETE_FAMILY_HISTORY_URL = DELETE_FAMILY_HISTORY;
        const { params } = this.props.navigation.state;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            RELATIONSHIP_DATA_URL = USER_DATA.ServiceURL + HOSP_RELATIONSHIP_DATA;
            FAMILY_HISTORY_URL = USER_DATA.ServiceURL + HOSP_FAMILY_HISTORY;
            DELETE_FAMILY_HISTORY_URL = USER_DATA.ServiceURL + HOSP_DELETE_FAMILY_HISTORY;
        }
        console.log("familyparams", params);
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            familyHistoryId: params.familyHistoryId,
            relativeFirstName: params.relativeFirstName,
            relativeLastName: params.relativeLastName,
            relativeCondition: params.relativeCondition,
            onsetDate: Moment(params.onsetDate).format('MM/DD/YYYY'),
            status: params.status,
            dateOfBirth: Moment(params.dateOfBirth).format('MM/DD/YYYY'),
            RelationShipSelectedItems: params.Relationship,
            resolution: params.resolution,
            note: params.note,
            relativeDeathDate: Moment(params.relativeDeathDate).format('MM/DD/YYYY'),
            relativeCauseOfDeath: Moment(params.relativeCauseOfDeath).format('MM/DD/YYYY'),
            dataSource: params.dataSource,
            isLoading: false,
        });
        console.log("params.Relationship", params.status)
        this.relationShipData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
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
                });
            })
            .catch((err) => {
                this.setState({ isLoading: false });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    changeRelationShipStatus = (value) => {
        this.setState({
            RelationShipSelectedItems: value
        });
    }
    /*...........................................Update User Record. ...........................................................*/
    updateFamilyHistory = () => {
        const { navigate } = this.props.navigation;
        const namereg = /^.{3,100}$/;
        const { relativeFirstName, relativeCondition, relativeLastName } = this.state;
        if (relativeFirstName === '' || relativeLastName === '') {
            ToastAndroid.showWithGravity(
                'All Fields are Mandatory..',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); this.setState({
                isSending: false
            }); return;
        }
        else if (namereg.test(relativeFirstName) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please enter Name atleast minimum of 3 characters',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                AlertIOS.alert('Please enter Name atleast minimum of 3 characters');
            } this.setState({
                isSending: false
            }); return;
        }
        else if (relativeCondition === '') {
            ToastAndroid.showWithGravity(
                'Relative Condition field is Mandatory.',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); this.setState({
                isSending: false
            }); return;
        }
        if (this.state.status == 'Active' || this.state.status == true) {
            status = 'true';
        } else {
            status = 'false';
        }
        const start_date = this.state.start_date;
        const updateHistory = {
            BirthDate: this.state.dateOfBirth,
            ConditionName: this.state.relativeCondition,
            DataSource: this.state.dataSource,
            Id: this.state.familyHistoryId,
            IsActive: status,
            Note: this.state.note,
            OnsetDate: this.state.onsetDate,
            PatientId: this.state.Userid,
            Relationship: this.state.RelationShipSelectedItems,
            RelativeFirstName: this.state.relativeFirstName,
            RelativeFullName: this.state.relativeFirstName,
            RelativeLastName: this.state.relativeLastName,
            Resolution: this.state.resolution,
            Status: this.state.status,
        };
        console.log("updateHistory", updateHistory)
        fetch(FAMILY_HISTORY_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateHistory)
        })
            // .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("familylog", res)
                if (res.statusCode == 200) {
                    ToastAndroid.showWithGravity(
                        FAMILY_HISTORY_UPDATE_SUCCESS_MSG,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.props.navigation.navigate('FamilyHistory');
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
    }
    /*.....................................................................................................................*/

    /***********************************************Delete Family History *************************************/
    deleteFamilyHistory = (Id) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(Id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (Id) => {
        this.setState({
            loadingMsg: 'Deleting Recorded Users...',
            isLoading: true,
        });
        const data = `Id=${this.state.familyHistoryId}`;
        fetch(DELETE_FAMILY_HISTORY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                ToastAndroid.showWithGravity(
                    CLINICAL_DOCS_DELETE_SUCCESS_MSG,
                    ToastAndroid.LONG,
                    ToastAndroid.CENTER,
                );
                this.setState({
                    isLoading: false,
                }, function () {
                    this.props.navigation.navigate('FamilyHistory');
                });
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
    /*..........................................................................................................................*/
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Family Details....</Text>
                </View>
            );
        }
        return (
            <CommonView FamilyDetails={true} >
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        style={{ paddingLeft: 6, paddingRight: 6 }}
                    >
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <FontAwesome style={{ paddingTop: 7, paddingRight: 5 }} size={20} name="user" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 7 }}>Relative First Name :            </Text>
                            </View>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 15, marginLeft: 5, paddingTop: 4 }}
                                placeholder={'Relative First Name'}
                                secureTextEntry={false}
                                maxLength={50}
                                fontSize={14}
                                onChangeText={(relativeFirstName) => this.setState({ relativeFirstName })}
                                value={this.state.relativeFirstName}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <FontAwesome style={{ paddingTop: 7, paddingRight: 5 }} size={20} name="user" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 7 }}>Relative Last Name :            </Text>
                            </View>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 15, marginLeft: 5, paddingTop: 4  }}
                                placeholder={'Relative Last Name'}
                                secureTextEntry={false}
                                maxLength={50}
                                fontSize={14}
                                onChangeText={(relativeLastName) => this.setState({ relativeLastName })}
                                value={this.state.relativeLastName}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <Ionicons style={{ paddingTop: 7, paddingRight: 5 }} size={20} name="md-person" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 7 }}>Relative's Condition :            </Text>
                            </View>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 15, marginLeft: 5, paddingTop: 4  }}
                                placeholder={'Relative Condition'}
                                maxLength={50}
                                fontSize={14}
                                secureTextEntry={false}
                                onChangeText={(relativeCondition) => this.setState({ relativeCondition })}
                                value={this.state.relativeCondition}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar-clock" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                    Onset Date :            </Text>
                            </View>
                            <DatePicker
                                style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, flex: 1 }}
                                date={this.state.onsetDate}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', textAlign: 'left', fontSize: 11, marginBottom: 20 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'left', fontSize: 15 }
                                }}
                                onDateChange={(onsetDate) => { this.setState({ onsetDate }); }}
                            />
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}> Status</Text>
                        </View>
                        <Dropdown
                            baseColor="#000"
                            label=''
                            value={this.state.status == true ? 'Active' : 'Inactive'}
                            data={statusData}
                            textColor='#746E6E'
                            labelHeight={5}
                            fontSize={15}
                            inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                            selectedItemColor='#41b4af'
                            containerStyle={{ marginBottom: 15, marginTop: 15 }}
                            onChangeText={(val, index, data) => this.changeStatus(val, index, data)}
                        />
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                    Date of birth :        </Text>
                            </View>
                            <DatePicker
                                // style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, flex: 1, paddingBottom: 7 }}
                                date={this.state.dateOfBirth}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={new Date()}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 15 }
                                }}
                                onDateChange={(dateOfBirth) => { this.setState({ dateOfBirth }); }}
                            />
                        </View>
                        {this.state.status == 'Inactive' || this.state.status == false ?
                            <View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                        <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar-clock" />
                                        <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                            Date of death         </Text>
                                    </View>
                                    <DatePicker
                                        // style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, flex: 1, fontSize: 12, paddingBottom: 7 }}
                                        date={this.state.relativeDeathDate}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        minDate={this.state.dateOfBirth}
                                        maxDate={new Date()}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                            dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 15 }
                                        }}
                                        onDateChange={(relativeDeathDate) => { this.setState({ relativeDeathDate }); }}
                                    /></View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                        <MaterialCommunityIcons style={{ paddingTop: 6, paddingRight: 5 }} size={20} name="calendar" />
                                        <Text style={{ color: '#000', fontSize: 16, paddingTop: 5 }}>
                                            Cause of death:           </Text>
                                    </View>
                                    <DatePicker
                                        // style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, flex: 1, fontSize: 12, paddingBottom: 7 }}
                                        date={this.state.relativeCauseOfDeath}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        minDate={this.state.dateOfBirth}
                                        maxDate={new Date()}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { alignItems: 'flex-start', left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                            dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 15 }
                                        }}
                                        onDateChange={(relativeCauseOfDeath) => { this.setState({ relativeCauseOfDeath }); }}
                                    /></View></View> :
                            null
                        }
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ marginBottom: 5, fontSize: 17 }}> Relationship</Text>
                        </View>
                        <View style={{ width: '100%' }}>
                            <Dropdown
                                baseColor="#000"
                                label=''
                                value={this.state.RelationShipSelectedItems}
                                data={this.state.RelationshipData}
                                textColor='#746E6E'
                                labelHeight={6}
                                fontSize={14}
                                selectedItemColor='#41b4af'
                                inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                                containerStyle={{ marginBottom: 15, marginTop: 15 }}
                                onChangeText={(val, index, data) => this.changeRelationShipStatus(val, index, data)}
                            /></View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <Foundation style={{ paddingTop: 7, paddingRight: 5, paddingLeft: 3 }} size={20} name="clipboard-notes" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 6 }}>Resolution :            </Text>
                            </View>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 12, flex: 1 }}
                                placeholder={'Resolution'}
                                secureTextEntry={false}
                                maxLength={100}
                                fontSize={14}
                                onChangeText={(resolution) => this.setState({ resolution })}
                                value={this.state.resolution}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 2, paddingTop: 2 }}>
                            <View style={{ flexDirection: 'row', width: '50%' }}>
                                <SimpleLineIcons style={{ paddingTop: 7, paddingRight: 5, paddingLeft: 3 }} size={18} name="note" />
                                <Text style={{ color: '#000', fontSize: 16, paddingTop: 6 }}>Note :            </Text>
                            </View>
                            <TextInput
                                placeholder={'Notes'}
                                maxLength={100}
                                fontSize={14}
                                onChangeText={(note) => this.setState({ note })}
                                value={this.state.note}
                            />
                        </View>
                        {this.state.dataSource == 'Patient' ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.updateFamilyHistory(); }} style={{ marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#3AA6CD' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Update</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '12%' }} />
                                <View style={{ width: '44%' }}>
                                    <TouchableOpacity onPress={() => { this.deleteFamilyHistory(); }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, padding: 10, borderRadius: 20, backgroundColor: '#DA424C' }}>
                                        <Text style={{ color: 'white', fontSize: 13, textAlign: 'center' }}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            null}
                    </ScrollView>
                </View>
            </CommonView>

        );
    }
    changeStatus = (val, index, data) => {
        this.setState({
            status: val
        });
    };
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
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        marginBottom: 4,
        paddingTop: 8,
        paddingBottom: 15
    },
    inputField2: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        fontSize: 12,
        marginBottom: 4,
        paddingTop: 4,
        paddingBottom: 7
    },
});
export default FamilyHistoryDetails;
