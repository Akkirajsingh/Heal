import React, { Component } from 'react';
import {
    Image, ScrollView, StyleSheet, Text, TouchableOpacity, AsyncStorage, View, Alert, Dimensions, RefreshControl, ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons, Foundation } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import url from '../constants/APIUrl';
import Utility from '../components/Utility';
import AccessRecord from '../components/AccessRecord';
import aPIStatusInfo from '../components/ErrorHandler';
let connnection_Status = false;

class CriticalCare extends Component {
    constructor(props) {
        super(props);
        let today = new Date();
        this.state = { immunizationResp: [], userid: '', todayDate: today, datatoken: '', isLoading: true, ReminderDate: '', loadingMsg: 'Loading Immunization Details', filterStat: 'All', filterData: '', originalData: [], showSearch: false, isLoading: true, medicationResp: [], showMenu: false, refreshing: false, searchText: '', userid: '', value: '' };

    }
    async componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
        NetInfo.isConnected.fetch().done((isConnected) => { connnection_Status = isConnected; });
        // this.AccessChange();\
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected; });
    }
    /***************************************************Access Record for ******************************************************/
    render() {
            return (
                <CommonView customHeading='Critical Care'>

                    <View style={{ flex: 1, alignItems:'center', justifyContent:'center' }} >
                       <Text style={{fontWeight: "bold", color:'gray'}}>Not yet Integrated</Text>
                    </View>
                </CommonView>
            );
        }
    }

export default CriticalCare;