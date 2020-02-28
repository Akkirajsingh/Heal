/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import { Image, ScrollView, Text, AsyncStorage, View, TouchableOpacity, Clipboard, Linking, ToastAndroid, NetInfo } from 'react-native';
import CommonView from '../components/CommonView';
import { EMERGENCY_CARD_DATA, HOSP_EMERGENCY_CARD_DATA } from '../constants/APIUrl';
import { EMERGENCY_CARD_DATA_EMPTY_ERROR } from '../constants/Messages';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';
import { COMMON_ERROR } from '../constants/ErrorMessage';
let EMERGENCY_CARD_DATA_URL = '';
let CONNECTION_STATUS = false;

class EmergencyCardData extends Component {
    constructor(props) {
        super(props);
        this.state = { userid: '', datatoken: '', EmergencyCardDetails: [], isLoading: true, clipboardText: '', textInputText: '' };
    }
    /********************************************************************************************************** */
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
          });
          NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
          if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
          }
          EMERGENCY_CARD_DATA_URL = EMERGENCY_CARD_DATA;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) { 
            USER_DATA = USER_DATA.Hospital;
            EMERGENCY_CARD_DATA_URL = USER_DATA.ServiceURL + HOSP_EMERGENCY_CARD_DATA;
        }
        this.setState({
            datatoken: USER_DATA.ACCESS_TOKEN,
            userid: USER_DATA.User_Id,
        });
        this.emergencyDetails();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /******************************************************************************************************** */
    get_Text_From_Clipboard = async () => {
        let textHolder = await Clipboard.getString();
        this.setState({
            clipboardText: textHolder
        });
    }
    set_Text_Into_Clipboard = async () => {
        await Clipboard.setString(this.state.textInputText);
    }
    /**************************************Emergency Details **********************************************************/
    emergencyDetails = () => {
        fetch(`${EMERGENCY_CARD_DATA_URL}?patientId=${this.state.userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.responseData.length == 0) {
                    ToastAndroid.showWithGravity(
                        EMERGENCY_CARD_DATA_EMPTY_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    console.log('emergy', res);
                    this.setState({
                        isLoading: false,
                        EmergencyCardDetails: res.responseData,
                        textInputText: res.responseData.accessCode
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
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Emergency Card Details....</Text>
                </View>
            );
        }
        return (
            <CommonView EmergencyCardData >
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, padding: 10, fontWeight: 'bold', color: '#746e6e' }}>Emergency Medical Information </Text>
                    </View>
                    <View style={{ paddingLeft: 15, paddingRight: 15, flex: 1 }}>
                        <View
                            style={{
                                flexDirection: 'column',
                                padding: 10,
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,
                                elevation: 3,
                                backgroundColor: '#F3F6FB',
                                marginBottom: 10,
                                borderColor: 'transparent',
                                borderWidth: 1
                            }}
                        >
                            <View style={{ flexDirection: 'row', paddingBottom: 7, paddingTop: 7 }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#746e6e' }}>Name:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 12, color: '#746E6E', }}>{this.state.EmergencyCardDetails.firstName}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', paddingBottom: 7, paddingTop: 7 }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#746e6e' }}>DOB:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 12, color: '#746E6E', }}>{this.state.EmergencyCardDetails.dateOfBirth}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', paddingBottom: 7, paddingTop: 7 }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#746e6e' }}>Blood Group:</Text>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 12, color: '#746E6E', }}>{this.state.EmergencyCardDetails.bloodGroup}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '50%' }}>
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#746e6e' }}>More Info:</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ fontSize: 12, color: '#64c5f1' }} onPress={() => Linking.openURL('https://care.patientheal.com/PatientCareWeb/Patient/AccessCode')}>{this.state.EmergencyCardDetails.accessURL}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>

                            <View style={{ width: '50%' }}>
                                <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: 'bold', color: '#746e6e' }}>Access Code</Text>
                            </View>
                            <View style={{width:'50%'}}>
                            <TouchableOpacity onPress={this.set_Text_Into_Clipboard} activeOpacity={0.8} >
                                <View >
                                    <Text style={{ fontSize: 12, color: '#746E6E' }}>{this.state.textInputText}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{position:'absolute', right:2, borderRadius: 20, backgroundColor: '#3AA6CD' }} onPress={this.set_Text_Into_Clipboard}>
                                <View>
                                    <Text style={{ color: 'white', fontSize: 11, textAlign: 'center',padding:1 }} > Copy</Text>
                                </View>
                            </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </CommonView>
        );
    }
}
export default EmergencyCardData;

