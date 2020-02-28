/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Alert, Text, TouchableOpacity, AsyncStorage, View, Dimensions, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import DatePicker from 'react-native-datepicker';
import url from '../constants/APIUrl';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';

let CONNECTION_STATUS = false;

const statusData = [
    { value: 'Active' }, { value: 'Inactive' }
];
class FamilyHistoryDetails extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        const today = new Date();
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
        const { params } = this.props.navigation.state;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            familyHistoryId: params.familyHistoryId,
            relativeFirstName: params.relativeFirstName,
            relativeLastName: params.relativeLastName,
            relativeCondition: params.relativeCondition,
            onsetDate: params.onsetDate,
            status: params.status,
            dateOfBirth: params.dateOfBirth,
            Relationship: params.Relationship,
            resolution: params.resolution,
            note: params.note,
            relativeDeathDate: params.relativeDeathDate,
            relativeCauseOfDeath: params.relativeCauseOfDeath,
            dataSource: params.dataSource,
            isLoading: false,
        });
        this.relationShipData();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /******************************** RelationShip API call ***************************************************************/
    relationShipData = () => {
        fetch('https://care.patientheal.com/PatientCareServices/api/MasterService/Relationships', {
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
                    drop_down_data.push({label:responseJson.responseData[i].relationshipEN, value: responseJson.responseData[i].id });
                }
                this.setState({
                    RelationshipData: drop_down_data,
                    isLoading: false,
                }, () => {
                    // if(this.state.dataSource.map(function(value, index, arr){
                    //     return value;
                    // })
                    // In this block you can do something with new state.
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
    changeRelationShipStatus = (value) => {
        this.setState({
            RelationShipSelectedItems: value
        });
    }
    /*...........................................Update User Record. ...........................................................*/
    updateFamilyHistory = () => {
        const { navigate } = this.props.navigation;
        const { recordEmail } = this.state;
        const REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (this.state.status == 'Active') {
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
            IsActive: this.state.status,
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
        fetch('https://care.patientheal.com/PatientCareServices/api/PatientHealthProfile/FamilyHistory', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateHistory)
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.showWithGravity(
                        'Your Family History is successfully Updated',
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
        fetch('https://care.patientheal.com/PatientCareServices/api/PatientHealthProfile/DeleteFamilyHistory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.AccessToken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                ToastAndroid.showWithGravity(
                    'Deleted Successfully',
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
            <CommonView FamilyDetails>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        style={{ paddingLeft: 6, paddingRight: 6 }}
                    >
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Relative First Name:         </Text>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 12 }}
                                placeholder={'Medication Name'}
                                secureTextEntry={false}
                                onChangeText={(relativeFirstName) => this.setState({ relativeFirstName })}
                                value={this.state.relativeFirstName}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Relative Last Name :         </Text>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 12 }}
                                placeholder={'Other Name'}
                                secureTextEntry={false}
                                onChangeText={(relativeLastName) => this.setState({ relativeLastName })}
                                value={this.state.relativeLastName}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 11, paddingBottom: 3 }}>
                            <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Relative's Condition :         </Text>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 12 }}
                                placeholder={'Other Name'}
                                secureTextEntry={false}
                                onChangeText={(relativeCondition) => this.setState({ relativeCondition })}
                                value={this.state.relativeCondition}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                            <Text style={{ color: '#000', fontSize: 12 }}>
                                Onset Date :
 </Text>
                            <DatePicker
                                style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30 }}
                                date={this.state.onsetDate}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11 }
                                }}
                                onDateChange={(onsetDate) => { this.setState({ onsetDate }); }}
                            />
                        </View>
                        <Dropdown

                            baseColor="#000"
                            label='Status'
                            value={this.state.status == true ? 'Active' : 'Inactive'}
                            data={statusData}
                            textColor='#746E6E'
                            labelHeight={5}
                            fontSize={12}
                            selectedItemColor='#41b4af'
                            containerStyle={{ marginBottom: 15, marginTop: 15 }}
                            onChangeText={(val, index, data) => this.changeStatus(val, index, data)}
                        />
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                            <Text style={{ color: '#000', fontSize: 12 }}>
                                Date of birth  :
 </Text>
                            <DatePicker
                                style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, fontSize: 12, paddingBottom: 7 }}
                                date={this.state.dateOfBirth}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.todayDate}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                    dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                    dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11}
                                }}
                                onDateChange={(dateOfBirth) => { this.setState({ dateOfBirth }); }}
                            />
                        </View>
                        {this.state.status == 'Inactive' ?
                            <View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                                    <Text style={{ color: '#000', fontSize: 12, paddingTop: 8 }}>
                                        Date of death :
                                </Text>
                                    <DatePicker
                                        style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, fontSize: 12, paddingBottom: 7 }}
                                        date={this.state.relativeDeathDate}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        maxDate={this.state.todayDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                            dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11 }
                                        }}
                                        onDateChange={(relativeDeathDate) => { this.setState({ relativeDeathDate }); }}
                                    /></View>
                                <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 8 }}>
                                    <Text style={{ color: '#000', fontSize: 12, paddingTop: 8 }}>
                                        Cause of death :
                                </Text>
                                    <DatePicker
                                        style={{ width: '50%', borderBottomWidth: 0.8, borderBottomColor: 'transparent', height: 30, fontSize: 12, paddingBottom: 7 }}
                                        date={this.state.relativeCauseOfDeath}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        maxDate={this.state.todayDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: { right: 0, top: 0, marginLeft: 0, height: 0, opacity: 0, width: 0 },
                                            dateInput: { left: 0, borderWidth: 0, color: '#746E6E', backgroundColor: 'transparent', width: '100%', fontSize: 11, marginBottom: 20 },
                                            dateText: { color: '#746E6E', justifyContent: 'center', textAlign: 'center', fontSize: 11 }
                                        }}
                                        onDateChange={(relativeCauseOfDeath) => { this.setState({ relativeCauseOfDeath }); }}
                                    /></View></View> :
                            null
                        }
                        <View style={{ width: '100%' }}>
                            <Dropdown
                                baseColor="#000"
                                label='Relationship'
                                value={this.state.RelationShipSelectedItems}
                                data={this.state.RelationshipData}
                                textColor='#746E6E'
                                labelHeight={6}
                                fontSize={12}
                                selectedItemColor='#41b4af'
                                containerStyle={{ marginBottom: 15, marginTop: 15 }}
                                onChangeText={(val, index, data) => this.changeRelationShipStatus(val, index, data)}
                            /></View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 3 }}>
                            <Text style={{ color: '#000', fontSize: 12, paddingTop: 6 }}>Resolution:         </Text>
                            <TextInput
                                style={{ color: '#746E6E', fontSize: 12 }}
                                placeholder={'Illness'}
                                secureTextEntry={false}
                                onChangeText={(resolution) => this.setState({ resolution })}
                                value={this.state.resolution}
                            />
                            {/* <AntDesign style={{ color: "orange", marginLeft: 5, marginBottom: 8 }} size={12} name="infocirlceo" /> */}
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingBottom: 2, paddingTop: 2 }}>
                            <Text style={{ color: '#000', fontSize: 12, paddingTop: 9 }}>Note:         </Text>
                            <TextInput
                                style={styles.inputField2}
                                placeholder={'Notes'}
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
