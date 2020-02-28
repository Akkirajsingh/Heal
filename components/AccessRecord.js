/* eslint-disable no-prototype-builtins */
import { Image, View, AsyncStorage, ToastAndroid } from 'react-native';
import React, { Component } from 'react';
import { Dropdown } from 'react-native-material-dropdown';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import Utility from '../components/Utility';
import aPIStatusInfo from '../components/ErrorHandler';

let accessTypeObj = {};
let ACCESS_REC_URL='';
class AccessRecord extends Component {
    constructor(props) {
        super(props);
        this.state = { RecordResp: [], AccessToken: '', accessType: '', accessTypeSelected: '' };
    }
    async componentDidMount() {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital; 
            ACCESS_REC_URL = USER_DATA.ServiceURL + "api/PatientService/Guarantees";
        }
        else  ACCESS_REC_URL ="https://care.patientheal.com/PatientCareServices/api/PatientService/Guarantees";
       
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            AccountId: USER_DATA.Id
        }, function () {
            // this.AccessForData();
        });
        // AccessForData = () => {
            fetch(ACCESS_REC_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    Authorization: `bearer ${this.state.AccessToken}`,
                    'access_token': this.state.AccessToken,
                    'token_type': 'bearer'
                },
            })
                 .then(aPIStatusInfo.handleResponse)
                .then((response) => response.json()).then(async (res) => {
                    console.log("accessres", res);
                    const response = res.responseData;
                    const AccessData = [];
                    for (let i = 0; i < response.length; i++) {
                        AccessData.push({ label: response[i].name, value: response[i].patientId, patientId: response[i].patientId, accountId: response[i].accountId });
                    }
    
                    let ACCESS_TYPE = await AsyncStorage.getItem('ACCESS_TYPE');
                    console.log('ACCESS_TYPE1', ACCESS_TYPE);
                    if (ACCESS_TYPE != null) {
                        ACCESS_TYPE = JSON.parse(ACCESS_TYPE);
                        console.log('ACCESS_TYPE2', ACCESS_TYPE);
                        if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                            this.setState({
                                accessTypeSelected: ACCESS_TYPE.accessTypeSelected
                            });
                        }
                    } else {
                        accessTypeObj = { patientId: AccessData[0].patientId, accountId: AccessData[0].accountId, accessTypeSelected: AccessData[0].patientId };
                        AsyncStorage.setItem('ACCESS_TYPE', JSON.stringify(accessTypeObj));
                        this.setState({
                            accessTypeSelected: accessTypeObj.accessTypeSelected
                        });
                    }
                    this.setState({
                        RecordResp: AccessData,
                    });
                }).catch(error => {
                    console.log('AccessErrormsg:', error);
                    const errMSg = aPIStatusInfo.logError(error);
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                });
        // };
    }

    AccessForData = () => {
        fetch(ACCESS_REC_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `bearer ${this.state.AccessToken}`,
                'access_token': this.state.AccessToken,
                'token_type': 'bearer'
            },
        })
             .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then(async (res) => {
                console.log("accessres", res);
                const response = res.responseData;
                const AccessData = [];
                for (let i = 0; i < response.length; i++) {
                    AccessData.push({ label: response[i].name, value: response[i].patientId, patientId: response[i].patientId, accountId: response[i].accountId });
                }

                let ACCESS_TYPE = await AsyncStorage.getItem('ACCESS_TYPE');
                console.log('ACCESS_TYPE1', ACCESS_TYPE);
                if (ACCESS_TYPE != null) {
                    ACCESS_TYPE = JSON.parse(ACCESS_TYPE);
                    console.log('ACCESS_TYPE2', ACCESS_TYPE);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            accessTypeSelected: ACCESS_TYPE.accessTypeSelected
                        });
                    }
                } else {
                    accessTypeObj = { patientId: AccessData[0].patientId, accountId: AccessData[0].accountId, accessTypeSelected: AccessData[0].patientId };
                    AsyncStorage.setItem('ACCESS_TYPE', JSON.stringify(accessTypeObj));
                    this.setState({
                        accessTypeSelected: accessTypeObj.accessTypeSelected
                    });
                }
                this.setState({
                    RecordResp: AccessData,
                });
            }).catch(error => {
                console.log('AccessErrormsg:', error);
                const errMSg = aPIStatusInfo.logError(error);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    };

    AccessTypeChange = async (val, index) => {
        const data = this.state.RecordResp;
        // console.log('AccessChange1_', JSON.stringify(this.state.RecordResp));
        accessTypeObj = { patientId: data[index].patientId, accountId: data[index].accountId, accessTypeSelected: data[index].patientId };

        this.setState({
            accessTypeSelected: accessTypeObj.accessTypeSelected
        });
        await AsyncStorage.setItem('ACCESS_TYPE', JSON.stringify(accessTypeObj));
        // this.props.onAccessChange(accessTypeObj);
        this.props.onAccessChange(JSON.stringify(accessTypeObj));
    }
    render() {
        return (
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', width: '100%'}}>
                <View style={{ width: '98%', paddingLeft: 7, paddingRight: 7, }}>

                    <View style={{ width: '100%' }}>
                        <Dropdown
                            style={{ width: 200 }}
                            baseColor="#000"
                            label='Access Type'
                            data={this.state.RecordResp}
                            labelHeight={7}
                            labelFontSize={17}
                            fontSize={16}
                            textColor='#746E6E'
                            selectedItemColor='#41b4af'
                            // inputContainerStyle={{ borderBottomWidth: 0, paddingLeft: 5, borderBottomColor: 'transparent', margin: 0, backgroundColor: '#dfdfdf' }}
                            value={this.state.accessTypeSelected}
                            onChangeText={(val, index) => this.AccessTypeChange(val, index
                            )}
                            animationDuration= {0}

                        />
                    </View>
                </View>
            </View>
        );
    }
}
export default AccessRecord;