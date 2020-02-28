import React, { Component } from 'react';
import {
    TextInput,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    Font,
    TouchableOpacity,
    View,
    ImageBackground,
    Dimensions,
    Animated,
    ToastAndroid, AsyncStorage
} from 'react-native';

import DatePicker from 'react-native-datepicker';
import { Dropdown } from "react-native-material-dropdown";
import CommonView from "../components/CommonView";
import Moment from "moment";
import url from '../constants/APIUrl';

class AddAppointment extends Component {
    constructor(props) {
        super(props);
        var today = new Date();
        this.state = {
            branchArray: [],
            dept: [],
            phys: [],
            branchId: '',
            deptId: '',
            phyId: '',
            timeSlot: '',
            showNext1: false,
            showNext2: false,
            appDate: '',
            timeArray: [],
            huserid: '',
            height1: new Animated.Value((Dimensions.get("window").height)),
            height2: new Animated.Value(0), height3: new Animated.Value(0), loadingMsg: 'Loading Medications....', user_id: '', value: '', isLoading: false, showMenu: false, refreshing: false, dateOfBirth: today, todayDate: today, med_name: '', other_name: '', dose: '', dose_unit: '', applied: '', instructions: '', status: 'Active', reason: '', note: '', start_date: '', end_date: today
        }
    }
    async componentDidMount() {
        var value = await AsyncStorage.getItem('ACCESS_TOKEN');
        var userid = await AsyncStorage.getItem('User_Id');
        var huserid = await AsyncStorage.getItem('HOSPITAL_USER_ID');
        this.setState({
            user_id: userid,
            value: value,
            huserid: huserid
        });
        return fetch(url.mUrl + 'MLocationService/Locations', {
            method: 'GET',
        }).then((response) => response.json()).then((response) => {
            var resp = response.responseData;
            var myArray = [];
            for (var i = 0; i < resp.length; i++) {
                var myObj = {};
                myObj['value'] = resp[i].locationId;
                myObj['label'] = resp[i].name;
                myArray.push(myObj);
            }
            this.setState({
                branchArray: myArray
            });
        });
    }
    _onRefresh = () => {
        this.setState({ refreshing: true });
        fetchData().then(() => {
            this.setState({ refreshing: false });
        });
    };

    render() {


        let reason = [
            { value: 'Well Visit' }, { value: 'Sick Visit' }, { value: 'Vaccine Only' }, { value: 'ADHD Follow Up' }, { value: 'Recheck/Follow Up' }
        ];
        const { goBack } = this.props.navigation;
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        } else {
            return (
                <CommonView customHeading='Add Appointment'>
                    <View style={{ flex: 1 }}>
                        <Animated.View style={{ height: this.state.height1, paddingLeft: 10, paddingRight: 10, paddingTop: 20 }}>

                            <ScrollView style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}>


                                <Dropdown

                                    baseColor="#40739e"
                                    label='Reason for Visit'
                                    data={reason}
                                    textColor='#40739e'
                                    selectedItemColor='#40739e'
                                    onChangeText={(val, index, data) => this.changereason(val, index, data)}

                                />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={'Notes'}
                                    onChangeText={(notes) => this.setState({ notes })}
                                />
                                <TouchableOpacity onPress={() => { this.nextScreen(1) }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#40739e' }}>
                                    <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Next</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                        {/*section 2*/}
                        <Animated.View style={{ height: this.state.height2, paddingLeft: 10, paddingRight: 10, paddingTop: 20 }}>

                            <ScrollView style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}>


                                <Dropdown

                                    baseColor="#40739e"
                                    label='Select Branch'
                                    data={this.state.branchArray}
                                    textColor='#40739e'
                                    selectedItemColor='#40739e'
                                    onChangeText={(val, index, data) => this.getServiceByLocation(val, index, data)}

                                />
                                <Dropdown

                                    baseColor="#40739e"
                                    label='Services/Department'
                                    data={this.state.dept}
                                    textColor='#40739e'
                                    selectedItemColor='#40739e'
                                    onChangeText={(val, index, data) => this.getPhysicianByDept(val, index, data)}

                                />
                                <Dropdown

                                    baseColor="#40739e"
                                    label='Physician'
                                    data={this.state.phys}
                                    textColor='#40739e'
                                    selectedItemColor='#40739e'
                                    onChangeText={(val, index, data) => this.changePhys(val, index, data)}

                                />
                                {this.state.showNext1 ?
                                    <TouchableOpacity onPress={() => { this.nextScreen(2) }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#40739e' }}>
                                        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Next</Text>
                                    </TouchableOpacity> : null}
                            </ScrollView>
                        </Animated.View>
                        {/*section 3*/}
                        <Animated.View style={{ height: this.state.height3, paddingLeft: 10, paddingRight: 10, paddingTop: 20 }}>

                            <ScrollView style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}>
                                <DatePicker
                                    style={{ width: '100%', borderBottomWidth: 0.8, borderBottomColor: '#40739e', marginBottom: 15 }}
                                    mode="date"
                                    placeholder="Appointment Date(mm/dd/yyyy)"
                                    format="MM/DD/YYYY"
                                    minDate={this.state.todayDate}
                                    date={this.state.appDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            // position: 'absolute',
                                            right: 0,
                                            top: 4,
                                            marginLeft: 0
                                        },
                                        dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#40739e',

                                        },
                                        dateText: {
                                            color: '#40739e',
                                            justifyContent: 'flex-start',
                                            textAlign: 'left'
                                        }
                                    }}
                                    onDateChange={(appDate) => { this.getTimeSlotByDate(appDate) }}
                                />

                                <Dropdown

                                    baseColor="#40739e"
                                    label='Select Time Slot'
                                    data={this.state.timeArray}
                                    textColor='#40739e'
                                    selectedItemColor='#40739e'
                                    onChangeText={(val, index, data) => this.selectTimeSlot(val, index, data)}

                                />


                                {this.state.showNext2 ?
                                    <TouchableOpacity onPress={() => { this.nextScreen(3) }} style={{ marginBottom: 40, marginTop: 15, paddingTop: 10, paddingBottom: 10, backgroundColor: '#40739e' }}>
                                        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Next</Text>
                                    </TouchableOpacity> : null}
                            </ScrollView>
                        </Animated.View>
                    </View>
                </CommonView>
            );
        }
    }


    changereason = (val, index, data) => {
        this.setState({
            reason: val
        });
    };
    getServiceByLocation = (val, index, data) => {
        this.setState({
            branchId: val,
        }, function () {
            return fetch(url.mUrl + 'PracticeService/Specialities?practiceLocationId=' + this.state.branchId, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Authorization": "Bearer " + this.state.value,
                    "token_type": "bearer",
                    "access_token": this.state.value
                },
            }).then((response) => response.json()).then((response) => {
                var myArray = [];
                var resp = response.responseData;
                this.setState({
                    dept: myArray
                });
                for (var i = 0; i < resp.length; i++) {
                    var myObj = {};
                    myObj['value'] = resp[i].id;
                    myObj['label'] = resp[i].name;
                    myArray.push(myObj);
                }
                this.setState({
                    dept: myArray
                });
            });
        });
    };
    getPhysicianByDept = (val, index, data) => {
        this.setState({
            deptId: val,
        }, function () {
            return fetch(url.mUrl + 'PhysicianService/Physicians?practiceLocationId=' + this.state.branchId + '&specialityId=' + this.state.deptId, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Authorization": "Bearer " + this.state.value,
                },
            }).then((response) => response.json()).then((response) => {
                var resp = response.responseData;
                var myArray = [];
                for (var i = 0; i < resp.length; i++) {
                    var myObj = {};
                    myObj['value'] = resp[i].id;
                    myObj['label'] = resp[i].name;
                    myArray.push(myObj);
                }
                this.setState({
                    phys: myArray,
                });
            });
        });
    };
    changePhys = (val, index, data) => {
        this.setState({
            phyId: val,
            showNext1: true
        })
    };
    getTimeSlotByDate = (date) => {
        this.setState({
            appDate: date,
        }, function () {
            return fetch(url.mUrl + 'AppointmentService/GetPhysiciansTimeSlot?practiceLocationId=' + this.state.branchId + '&physicianId=' + this.state.phyId, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Authorization": "Bearer " + this.state.value,
                },
            }).then((response) => response.json()).then((response) => {
                var resp = response.responseData[0].availableTimes;
                var myArray = [];
                for (var i = 0; i < resp.length; i++) {
                    var myObj = {};
                    myObj['value'] = Moment(resp[i].availableTime).format('hh:mm A');
                    myObj['label'] = Moment(resp[i].availableTime).format('hh:mm A');
                    myArray.push(myObj);

                }
                this.setState({
                    timeArray: myArray,

                });
            });
        });
    };
    selectTimeSlot = (val, index, data) => {
        this.setState({
            timeSlot: val,
            showNext2: true
        })
    };
    nextScreen = (flag) => {
        if (flag == 1) {
            if (this.state.notes == '' || this.state.reason == '') {
                ToastAndroid.show('Please fill all the fields', ToastAndroid.LONG);
                return false;
            } else {
                Animated.timing(                 // Animate over time
                    this.state.height1,            // The animated value to drive
                    {
                        toValue: 0,                   // Animate to opacity: 1 (opaque)
                        duration: 500,              // Make it take a while
                    }
                ).start(() => {
                    //
                    //this.youCallbackFunc();
                    Animated.timing(                 // Animate over time
                        this.state.height2,            // The animated value to drive
                        {
                            toValue: (Dimensions.get("window").height),                   // Animate to opacity: 1 (opaque)
                            duration: 500,              // Make it take a while
                        }
                    ).start();
                });
            }

        } else if (flag == 2) {
            Animated.timing(                 // Animate over time
                this.state.height2,            // The animated value to drive
                {
                    toValue: 0,                   // Animate to opacity: 1 (opaque)
                    duration: 500,              // Make it take a while
                }
            ).start(() => {
                //
                //this.youCallbackFunc();
                Animated.timing(                 // Animate over time
                    this.state.height3,            // The animated value to drive
                    {
                        toValue: (Dimensions.get("window").height),                   // Animate to opacity: 1 (opaque)
                        duration: 500,              // Make it take a while
                    }
                ).start();
            });
        } else if (flag == 3) {
            var data = "patientId=" + this.state.userid
                + "&physicianId=" + this.state.phyId
                + "&practiceId=" + this.state.phyId
                + "&appointmentDate=" + this.state.appDate
                + "&preferredDate1=" + this.state.appDate
                + "&preferredDate2=" + this.state.appDate
                + "&preferredDate3=" + this.state.appDate
                + "&serviceRequested=" + this.state.reason
                + "&department=" + this.state.deptId
                + "&x=''"
                + "&remindMeIn=''"
                + "&selectedRemindersId=''"
                + "&appointmentType=" + this.state.reason
                + "&specialityId=" + this.state.deptId;
            this.setState({
                isLoading: true,
                loadingMsg: 'Saving Appointment..'
            })
            return fetch(url.mUrl + 'AppointmentService/AppointmentCreate', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + this.state.value,
                },
                body: data
            }).then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show('Appointment Added. Pull from top to refresh', ToastAndroid.LONG);
                    this.setState({
                        isLoading: false,
                        loadingMsg: 'Saving Appointments....'
                    }, function () {
                        this.props.navigation.navigate('Appointments');
                    });
                }
            }).catch((error) => {

            });
        }

    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    boxDetails: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    card: {

        elevation: 3,
        width: (Dimensions.get("window").width / 2) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    inputField: {
        width: '100%',
        color: '#8d9393',
        borderWidth: 0,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        marginBottom: 15,
        paddingTop: 15,
        paddingBottom: 15
    },
    textTopField: {
        maxWidth: "100%",
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#41b4af",
        marginBottom: 10,
    },
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },
};
export default AddAppointment
