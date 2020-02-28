import { Image, View, Text, AsyncStorage, TouchableOpacity, ImageBackground } from "react-native";
import React, { Component } from 'react';
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { withNavigation } from "react-navigation";
import Utility from '../components/Utility';
class CommonHeader extends Component {
    constructor(props) {
        super(props);
        this.state = { FirstName: '', ProfilePhoto: '', gender: '', UNREAD_MESSAGE_DATA: '', backBtnVisible: false, HealId: '' }
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                let backBtnVisible = false;
                let DASHBOARD_DATA = await AsyncStorage.getItem('DASHBOARD_DATA');
                DASHBOARD_DATA = Utility.IsNullOrEmpty(DASHBOARD_DATA) ? '' : JSON.parse(DASHBOARD_DATA);
                let fullName = DASHBOARD_DATA.firstName;
                const UNREAD_MESSAGE_DATA = await AsyncStorage.getItem('UNREAD_MESSAGE');
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                let HealId = USER_DATA.HealId;
                console.log(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital')) {
                    HealId = USER_DATA.Hospital.HealId;
                    //  backBtnVisible = true;
                }
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    fullName = USER_DATA.Hospital.fullName;
                    // HealId = USER_DATA.Hospital.healId;
                    backBtnVisible = true;
                }
                this.setState({
                    FirstName: fullName,
                    ProfilePhoto: DASHBOARD_DATA.ProfileImage,
                    gender: DASHBOARD_DATA.gender,
                    UNREAD_MESSAGE_DATA: UNREAD_MESSAGE_DATA,
                    backBtnVisible: backBtnVisible,
                    HealId: HealId
                });
            },
        );
    }

    async componentDidMount() {
        let backBtnVisible = false;
        let DASHBOARD_DATA = await AsyncStorage.getItem('DASHBOARD_DATA');
        DASHBOARD_DATA = Utility.IsNullOrEmpty(DASHBOARD_DATA) ? '' : JSON.parse(DASHBOARD_DATA);
        let fullName = DASHBOARD_DATA.firstName;
        const UNREAD_MESSAGE_DATA = await AsyncStorage.getItem('UNREAD_MESSAGE');
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let HealId = USER_DATA.HealId;
        console.log(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital')) {
            HealId = USER_DATA.Hospital.HealId;
            backBtnVisible = true;
        }
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            fullName = USER_DATA.Hospital.fullName;
            // HealId = USER_DATA.Hospital.healId;
            backBtnVisible = true;
        }
        this.setState({
            FirstName: fullName,
            ProfilePhoto: DASHBOARD_DATA.ProfileImage,
            gender: DASHBOARD_DATA.gender,
            UNREAD_MESSAGE_DATA: UNREAD_MESSAGE_DATA,
            backBtnVisible: backBtnVisible,
            HealId: HealId
        });
    }
    async componentWillUnmount() {
    }
    async handleBack() {
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        //  await AsyncStorage.removeItem("USER_DATA");
        console.log("handleBack", this.props.navigation)
        if (!Utility.IsNullOrEmpty(USER_DATA) && USER_DATA.hasOwnProperty('Hospital')) {
            delete USER_DATA.Hospital;
            await AsyncStorage.removeItem("ACCESS_TYPE");
            await AsyncStorage.removeItem("USER_DATA");
            await AsyncStorage.setItem('USER_DATA', JSON.stringify(USER_DATA)).then((res) => {
                this.props.navigation.navigate('Dashboard')
            });

        }
        else this.props.navigation.navigate('Dashboard')
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row' }}>
                    {this.state.backBtnVisible ? <TouchableOpacity onPress={() => this.handleBack()} style={{}}>
                        <View>
                            <FontAwesome style={{ fontSize: 20, color: '#000', marginLeft: 10, paddingTop: 5 }} name='mail-reply' />
                        </View>
                    </TouchableOpacity> : undefined}
                </View>
                <View style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
                    <View style={{ alignItems: "center", marginTop: 3 }}>
                        <Text style={{ color: '#000', fontSize: 20, justifyContent: 'flex-start', alignItems: 'flex-start', fontWeight: 'bold', marginLeft: 3 }}>Welcome,  {(this.state.FirstName).toUpperCase()} </Text>
                        <View style={{ flexDirection: 'row' }}><Entypo style={{ fontSize: 23, color: '#000', paddingTop: 4 }} name='v-card' /><Text style={{ color: '#000', fontSize: 19, fontWeight: 'normal', marginLeft: 5, paddingTop: 2 }}>{(this.state.HealId)} </Text></View>
                    </View>
                </View>
            </View>
        );
    }
}
export default withNavigation(CommonHeader)