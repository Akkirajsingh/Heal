import React, { Component } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    AsyncStorage,
    View,
    StatusBar,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import Moment from 'moment';
import Utility from '../components/Utility';
import { Entypo, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

class SideBarMenu extends Component {
    constructor(props) {
        super(props);
        this.state = { isAuth: false, patientName: '', LastLogin_Date: '' };
    }
    async componentDidMount() {
        // const USER_DATA = await AsyncStorage.getItem('USER_DATA');
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let fullName = USER_DATA.fullName, lastLoginDate = USER_DATA.LastLogin_Date;

        if (USER_DATA.hasOwnProperty('Hospital')) {
            fullName = USER_DATA.Hospital.fullName, lastLoginDate = USER_DATA.Hospital.LastLogin_Date;
        }
        if (USER_DATA != null) {
            this.setState({
                isAuth: true,
                patientName: fullName,
                LastLogin_Date: lastLoginDate
            })
        } else {
            this.setState({
                isAuth: false,
            });
        }
    }
    render() {
        if (this.state.isAuth) {
            return (

                <View style={{ flex: 1, backgroundColor: '#ffffffab' }}>
                    <StatusBar hidden />
                    <View>

                        <View style={{ alignItems: 'center', backgroundColor: '#F7F1FF', marginBottom: 10 }}>
                            <Text style={{ fontSize: 15, color: '#000', paddingTop: 8, paddingBottom: 9 }}>Welcome,  {this.state.patientName}</Text>
                            <Text style={{ fontSize: 11, color: '#000', paddingTop: 2, paddingBottom: 8 }}>Last Login Date, {this.state.LastLogin_Date}</Text>
                        </View>

                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('Dashboard')} ><FontAwesome size={17} name='home' /> Home </Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('GeneralInfoData')} ><FontAwesome size={17} name='user' /> Update Profile </Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('MessageView')} ><FontAwesome size={17} name='envelope-o' /> Messages </Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('Prescriptions')} ><MaterialCommunityIcons size={17} name='pharmacy' /> Prescriptions </Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('Reminder')} ><FontAwesome size={17} name='bell' /> Reminder </Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate('ChangePassword')} ><MaterialCommunityIcons size={17} name='cellphone-lock' /> Change Password </Text>
                        </View>
                        {/* <View style={styles.menuFont}>
                            <Text style={{ fontSize: 14 }} onPress={() => this.props.navigation.navigate('Dashboard')} ><MaterialCommunityIcons size={14} name='file-document' /> Bill Pay</Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 14  }} onPress={() => this.props.navigation.navigate('Dashboard')} ><MaterialCommunityIcons size={14} name='file-document' /> Forms</Text>
                        </View>
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 14 }} onPress={() => this.props.navigation.navigate('Dashboard')} ><FontAwesome size={14} name='bullhorn' /> Campaigns</Text>
                        </View> */}
                        <View style={styles.menuFont}>
                            <Text style={{ fontSize: 17 }} onPress={() => this.logoutUser()} ><Entypo name='log-out' size={17} /> Logout</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', bottom: 0 }}>
                        <Image source={require('../assets/images/menu_bg.png')} />
                    </View>
                </View >

            );
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: '#ffffffc9' }}>
                    <StatusBar hidden />
                    <View style={{ flex: 1 }}>

                        <View style={{ alignItems: 'center', backgroundColor: '#3AA6CD', marginBottom: 10 }}>
                            <Text style={{ fontSize: 20, color: 'white', paddingTop: 15, paddingBottom: 15 }}>Patient Heal</Text>
                        </View>
                        <View>
                            <Text onPress={() => this.props.navigation.navigate('Register1')} style={styles.menuFont}><Entypo name='add-user' size={18} /> Signup</Text>
                            <Text onPress={() => this.props.navigation.navigate('Login')} style={styles.menuFont}><Entypo name='login' size={18} /> Login</Text>
                        </View>

                    </View>
                    <View style={{ flexDirection: 'row', bottom: 0 }}>
                        <Image source={require('../assets/images/menu_bg.png')} />
                    </View>
                </View>

            );
        }

    }

    async logoutUser() {
        // let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        // USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        await AsyncStorage.removeItem('USER_DATA');
        // await AsyncStorage.removeItem(USER_DATA.ACCESS_TOKEN);
        await AsyncStorage.removeItem('ACCESS_TYPE');
        // await AsyncStorage.removeItem(USER_DATA.User_Id);
        // await AsyncStorage.removeItem(USER_DATA.Id);
        await AsyncStorage.removeItem('OTP_CONFIRM');
        this.props.navigation.navigate('Login');
    }
}
const styles = StyleSheet.create({
    menuFont: {
        fontSize: 15,
        color: 'gray',
        fontWeight: 'bold',
        paddingTop: 15,
        paddingBottom: 8,
        paddingLeft: 20,
        justifyContent: 'space-between'

    },
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
});
export default withNavigation(SideBarMenu)