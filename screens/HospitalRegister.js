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
    ToastAndroid
} from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import {  Entypo } from '@expo/vector-icons';
import SideBarMenu from "../components/SideBarMenu";
import Drawer from 'react-native-drawer';
import DatePicker from 'react-native-datepicker';
import {Dropdown} from "react-native-material-dropdown";
import CommonHeader from "../components/CommonHeader";
import CommonFooter from "../components/CommonFooter";
import CommonView from "../components/CommonView";

class HospitalRegister extends Component {
    constructor(props){
        super(props);
        var today = new Date();
        this.state ={ isLoading:false,showMenu:false,refreshing: false,dateOfBirth: today,todayDate: today,med_name:'',other_name:'',dose:'',dose_unit:'',applied:'',instructions:'',status:'Active',reason:'',note:'',start_date:today,end_date:today}
    }
    async componentDidMount(){

    }
    _onRefresh = () => {
        this.setState({refreshing: true});
        fetchData().then(() => {
            this.setState({refreshing: false});
        });
    };

    render() {
        let genderData = [
            {value:1,label:'Female'},{value:2,label:'Male'},{value:3,label:'Other'}
        ];
        const { goBack } = this.props.navigation;
        if(this.state.isLoading){
            return (
                <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
                    <Image source={require('../assets/images/loader.gif')} style={{width:80,height:80}}/>
                    <Text>Loading....</Text>
                </View>
            );
        }else{
            return (
                <CommonView customHeading='Register'>

                <View style={{flex:1,paddingLeft:10,paddingRight:10,paddingTop:20}}>

                                <ScrollView style={{paddingLeft:10,paddingRight:10,backgroundColor:'#f1f2f6'}}>

                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={'Aadhar Card Number'}
                                        secureTextEntry={false}
                                        onChangeText={(med_name) => this.setState({med_name})}
                                    />
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={'First Name'}
                                        secureTextEntry={false}
                                        onChangeText={(other_name) => this.setState({other_name})}
                                    />
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={'Last Name'}
                                        secureTextEntry={false}
                                        keyboardType={'numeric'}
                                        maxLength={10}
                                        onChangeText={(dose) => this.setState({dose})}
                                    />



                                    <TextInput
                                        style={styles.inputField}
                                        placeholder={'Email Address'}
                                        onChangeText={(reason) => this.setState({reason})}
                                    />
                                    <Text style={{color: '#8d9393'}}>
                                        Date of Birth* :
                                    </Text>
                                    <DatePicker
                                        style={{width: '100%',borderBottomWidth: 0.8,borderBottomColor:'#8d9393',marginBottom:15}}
                                        date={this.state.start_date}
                                        mode="date"
                                        placeholder="select date"
                                        format="MM/DD/YYYY"
                                        /*minDate="2016-05-01"*/
                                        maxDate= {this.state.todayDate}
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
                                                borderWidth:0,
                                                color:'#8d9393',

                                            },
                                            dateText:{
                                                color: '#8d9393',
                                                justifyContent: 'flex-start',
                                                textAlign:'left'
                                            }
                                        }}
                                        onDateChange={(start_date) => {this.setState({start_date: start_date})}}
                                    />

                                    <Dropdown

                                        baseColor="#8d9393"
                                        label='Select Gender'
                                        data={genderData}
                                        textColor='#8d9393'
                                        selectedItemColor='#41b4af'
                                        containerStyle={{marginBottom:15}}
                                        onChangeText={(val,index,data)=>this.changeGender(val,index,data)}

                                    />
                                    <TouchableOpacity onPress={()=>{this.saveHospital()}} style={{marginBottom:40, marginTop:15,paddingTop:10,paddingBottom:10,backgroundColor:'#40739e'}}>
                                        <Text style={{color:'white',fontSize:18,textAlign:'center'}}>Add Hospital</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                </CommonView>
            );
        }
    }




    saveMedication = () =>{
        var medicine_name= this.state.med_name;
        var other_name = this.state.other_name;
        var dose = this.state.dose;
        var dose_unit = this.state.dose_unit;
        var applied_to = this.state.applied;
        var status = '';
        if(this.state.status == 'Active'){
            status = true;
            var end_date = '';
        }else{
            status = false;
            var end_date = this.state.end_date;
        }
        var reason = this.state.reason;
        var start_date = this.state.start_date;
        var notes = this.state.note;
        console.log('end_date',end_date);
        console.log('start_date',start_date);


        return fetch('http://13.127.179.212/PatientCareServices/api/PatientHealthProfile/Medication',{
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": "Bearer "+this.state.access_token,
            },
            body: 'patientId='+this.state.user_id+'&drugName='+medicine_name+'&reason='+reason+'&dosage='+dose+'&dosageUnit='+dose_unit+'&medicationTaken='+applied_to+'&frequency=&isActive='+status+'&dateStarted='+start_date+'&note='+notes+'&genericName='+other_name
        }).then((response) => {
            console.log(response);
            //response.json()
        }).then((res) => {
            console.log(res);
        }).catch((error) => {
            console.error('error---',error);
        });
    };
    saveHospital = () =>{
        console.log('Saving Hospital')
    };
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
    card :{

        elevation         : 3,
        width             : (Dimensions.get("window").width / 2) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    inputField:{
        width:'100%',
        color:'#8d9393',
        borderWidth:0,
        borderBottomColor: '#8d9393',
        borderBottomWidth: 0.3,
        marginBottom:15,
        paddingTop:15,
        paddingBottom:15
    },
    textTopField: {
        maxWidth: "100%",
        fontSize: 35,
        fontWeight:'bold',
        textAlign: 'center',
        color: "#41b4af",
        marginBottom: 10,
    },
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3},
};
export default HospitalRegister
