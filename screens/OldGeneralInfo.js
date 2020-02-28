import React, { Component } from 'react';
import { Image, ScrollView, ActivityIndicator, StyleSheet, Button, Text, TouchableOpacity, AsyncStorage, View, Alert, Dimensions, TextInput, ToastAndroid, NetInfo } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from "react-native-material-dropdown";
import CommonView from "../components/CommonView";
import Moment from 'moment';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
// import PhotoUpload from 'react-native-photo-upload'
import aPIStatusInfo from "../components/ErrorHandler";
let data = [{
    value: 'separated',
    code: 2
}, {
    value: 'Divorced',
    code: 3
}, {
    value: 'Single',
    code: 1
}];

let data1 = [{
    value: 'A+',
    code: 'A'
},
{
    value: 'AB-',
    code: 'AB'
},
{
    value: 'B-',
    code: 'B'
}, {
    value: 'O-',
    code: 'O'
},
{
    value: 'B positive',
    code: 'B'
}, {
    value: 'O+',
    code: 'O'
},
{
    value: 'AB+',
    code: 'AB'
}];

let data2 = [{
    value: 'Female',
}, {
    value: 'Male',
}];
class GeneralInfo extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        var today = new Date();
        this.state = {
            access_token: '', general_info: '', image: null, bloodGroup: '', temperature: '', bloodPressure: '',
            presentAddr: '', pulseRate: '', permanentAddr: '', city: '', States: '', zipCode: '',
            uploading: false, datatoken: '', contact_no: '', email_id: '', gender: '', height: '', weight: '',
            isLoading: true, refreshing: false, dateOfBirth: today
        }
    };
    changeBloodGroup = (val, index, data) => {
        this.setState({ bloodGroup: data[index].code })
    }
    changeMedAllergy = (val, index, data) => {
        this.setState({ maritalStatus: data[index].code })
    }
    async componentDidMount() {
        var value = await AsyncStorage.getItem('ACCESS_TOKEN');
        var userid = await AsyncStorage.getItem('User_Id');
        // var userName = await AsyncStorage.getItem('user_name');
        // var contactNo = await AsyncStorage.getItem('contact_no');
        var emailId = await AsyncStorage.getItem('email_id');
        // var userImage = await AsyncStorage.getItem('user_image');
        console.log("value", value)
        this.setState({
            datatoken: value,
            userid: userid,
            email_id: emailId,
        });
        console.log("contact_no", this.state.contact_no);
        console.log(this.state.email_id);
        console.log(this.state.userImage);
        this.setState({ isLoading: false });
        this.GeneralInfoData();
        this.getPermissionAsync();
    }
    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
        });

        console.log(result);

        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    };
    GeneralInfoData = () => {
        GeneralArrData = [];
        var Generaldata = "id=" + this.state.userid
        fetch('https://care.patientheal.com/PatientCareServices/api/PatientSignUp/PatientProfileLoad', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            "body": Generaldata
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("generalinfo", res);
                if (res.statusCode == 409) {
                    ToastAndroid.showWithGravity(
                        'Server is down! Please Try Again',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                else {
                    if (res.responseData.length > 0) {

                        var Response = res.responseData[0];
                        this.setState({
                            general_info: Response.firstName, contact_no: Response.phone, email_id: Response.otherEmail, height: Response.height, weight: Response.weight, bloodGroup: Response.bloodGroup,
                            image: Response.profileImage, temperature: Response.temperature, bloodPressure: Response.bloodPressure, presentAddr: Response.address, pulseRate: Response.pulseRate,
                            permanentAddr: Response.address2, city: Response.city, zipCode: Response.zipCode
                        });
                    }
                }
            }).catch(err => {
                this.setState({
                    isLoading: false,
                })
                console.log("Errormsg:", err);
                let errMSg = aPIStatusInfo.logError(err);
                this.props.dispatch(ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : "An error occured! Please Try Again",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ));
                return;


            });
    }
    render() {
        const { goBack } = this.props.navigation;
        let {
            image
        } = this.state;

        // if (this.state.isLoading) {
        //     return (
        //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        //             <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
        //             <Text>Loading Problem Details....</Text>
        //         </View>
        //     );
        // } else {
        return (
            <CommonView customHeading='General Info'>
                <View style={{ flex: 1, paddingTop: 20 }}>

                    <ScrollView style={{ paddingLeft: 3, paddingRight: 6, backgroundColor: '#fff' }}>
                        <View style={{ position: 'absolute', right: 0, padding: 10 }}>
                            {/* <View style={styles.CircleShapeView}>
                                {/* <Text style={{ color: '#afeacb', fontSize: 13, paddingLeft: 20, paddingTop: 30 }}>{this.state.userImage}</Text> */}
                            {/* </View> */}
                            <View style={{ alignItems: "center", justifyContent: "center", borderRadius: 100 / 2, backgroundColor: '#f3f6fb', }}>
                                <View onPress={this._takePhoto} >
                                    <Image onPress={this._takePhoto} source={require('../assets/icons/John.png')} onPress={this._pickImage} style={{
                                        width: 90,
                                        height: 90
                                    }} />
                                </View>
                                {this._maybeRenderImage()}
                                {this._maybeRenderUploadingOverlay()}
                            </View>
                        </View>
                        {/* <View style={styles.container}>

                            <Button
                                onPress={this._pickImage}
                                title="Pick an image from camera roll"
                            />

                            <Button onPress={this._takePhoto} title="Take a photo" />

                            {/* {this._maybeRenderImage()} */}
                        {/* {this._maybeRenderUploadingOverlay()}    */}
                        {/* </View>  */}
                        <View>
                            <View style={{ flexDirection: 'row', paddingTop: 80, alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                                <Text style={{ color: '#746E70', paddingLeft: 5 }}>Name:</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={''}
                                    secureTextEntry={false}
                                    onChangeText={(general_info) => this.setState({ general_info })}
                                    placeholderTextColor="#746E70"
                                    value={this.state.general_info}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flex: 1, borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 12, paddingBottom: 8, paddingLeft: 5 }}>Contact Number:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                editable={false}
                                placeholderTextColor="#746E70"
                                onChangeText={(contact_no) => this.setState({ contact_no })}
                                value={this.state.contact_no}
                            />
                            <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 8 }} size={15} name='pluscircleo' />
                        </View>
                        <View style={{ flexDirection: 'column', color: '#746E70', justifyContent: 'flex-start', flex: 1, paddingLeft: 6 }}>
                            <Dropdown
                                baseColor="#746E70"
                                label='Marital Status'
                                data={data}
                                labelHeight={18}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                onChangeText={(val, index, data) => this.changeMedAllergy(val, index, data)}
                                value={'single'}
                                containerStyle={{}}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 12, paddingBottom: 8, paddingLeft: 5 }}>Alternate Email Address:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                editable={false}
                                placeholderTextColor="#746E70"
                                onChangeText={(email_id) => this.setState({ email_id })}
                                value={this.state.email_id}
                            />
                            <AntDesign style={{ color: 'gray', marginTop: 3, marginRight: 8 }} size={15} name='pluscircleo' />
                        </View>
                        <View style={{ flexDirection: 'column', color: '#746E70', justifyContent: 'flex-start', flex: 1, paddingLeft: 7, }}>
                            <Dropdown
                                baseColor="#746E70"
                                label='Blood Group'
                                data={data1}
                                labelHeight={18}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                onChangeText={(val, index, data) => this.changeBloodGroup(val, index, data)}
                                value={this.state.bloodGroup}
                                containerStyle={{ marginBottom: 10 }}
                            />
                        </View>
                        {/* <View style={{ flexDirection: 'column', paddingLeft: 6, color: '#746E70', justifyContent: 'flex-start', flex: 1 }}>
                            <Dropdown
                                baseColor="#746E70"
                                label='Gender'
                                data={data}
                                labelHeight={18}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                // onChangeText={(val, index, data) => this.changeGender(val, index, data)}
                                value={'Male'}
                                containerStyle={{}}
                            />
                        </View> */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: "#ececec" }}>
                            <View>
                                <Text style={{ paddingLeft: 6, color: '#746E70' }}>DOB</Text>
                                {/* <Text style={{ position: 'absolute', top: -7, paddingLeft: 23, color: 'red' }}>*</Text> */}
                            </View>
                            <DatePicker
                                style={{ width: '80%', backgroundColor: 'transparent' }}
                                date={this.state.dateOfBirth}
                                mode="date"
                                placeholder="select date"
                                format="MM/DD/YYYY"
                                maxDate={this.state.dateOfBirth}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateIcon: {
                                        right: 0,
                                        top: 0,
                                        marginLeft: 0,
                                        height: 0,
                                        opacity: 0,
                                        width: 0
                                    }, dateInput: {
                                        left: 0,
                                        borderWidth: 0,
                                        color: '#8d9393',
                                        backgroundColor: 'transparent',
                                        width: '100%',
                                        padding: 1,
                                        height: 30,
                                    },
                                    dateText: {
                                        color: 'gray',
                                        justifyContent: 'center',
                                        textAlign: 'center'
                                    }
                                }}
                                onDateChange={(dateOfBirth) => { this.setState({ dateOfBirth: dateOfBirth }) }}></DatePicker>
                            {/* <AntDesign style={{ color: 'gray', marginTop: 5, marginLeft: -20 }} size={15} name='pluscircleo' /> */}
                        </View>
                        <View style={{ backgroundColor: '#F3F6FB', padding: 10, elevation: 1 }}><Text style={{ color: '#A7AEB1', justifyContent: 'center', alignItems: 'center' }}>Vital Info</Text></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Height:</Text>
                            <TextInput
                                style={styles.inputField1}
                                placeholder={''}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                placeholderTextColor="#746E70"
                                onChangeText={(height) => this.setState({ height })}
                                value={this.state.height}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>weight:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                placeholderTextColor="#746E70"
                                onChangeText={(weight) => this.setState({ weight })}
                                value={this.state.weight}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Temperature:</Text>
                            <TextInput
                                style={styles.inputField1}
                                placeholder={''}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                placeholderTextColor="#746E70"
                                onChangeText={(temperature) => this.setState({ temperature })}
                                value={this.state.temperature}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Blood Pressure:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                placeholderTextColor="#746E70"
                                onChangeText={(bloodPressure) => this.setState({ bloodPressure })}
                                value={this.state.bloodPressure}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Pulse Rate:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                keyboardType={'numeric'}
                                secureTextEntry={false}
                                placeholderTextColor="#746E70"
                                onChangeText={(pulseRate) => this.setState({ pulseRate })}
                                value={this.state.pulseRate}
                            />
                        </View>
                        <View style={{ backgroundColor: '#F3F6FB', padding: 10, elevation: 1 }}><Text style={{ color: '#A7AEB1', justifyContent: 'center', alignItems: 'center' }}>Contact Info</Text></View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Present Address:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                placeholderTextColor="#746E70"
                                // onChangeText={(presentAddr) => this.setState({ presentAddr })}
                                // value={this.state.presentAddr}
                                onChangeText={(permanentAddr) => this.setState({ permanentAddr })}
                                value={this.state.permanentAddr}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Permenant Address:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                placeholderTextColor="#746E70"
                                onChangeText={(permanentAddr) => this.setState({ permanentAddr })}
                                value={this.state.permanentAddr}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>City:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                placeholderTextColor="#746E70"
                                onChangeText={(city) => this.setState({ city })}
                                value={this.state.city}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#8d9393', borderBottomWidth: 0.3 }}>
                            <Text style={{ color: '#746E70', paddingTop: 13, paddingBottom: 8, paddingLeft: 5 }}>Zip Code:</Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder={''}
                                secureTextEntry={false}
                                keyboardType={'numeric'}
                                placeholderTextColor="#746E70"
                                onChangeText={(zipcode) => this.setState({ zipcode })}
                                value={this.state.zipcode}
                            />
                        </View>
                        {/* <View style={{ flexDirection: 'column', paddingLeft: 6, color: '#746E70', justifyContent: 'flex-start', flex: 1 }}>
                            <Dropdown
                                baseColor="#746E70"
                                label='State'
                                data={data}
                                labelHeight={18}
                                textColor='#746E70'
                                selectedItemColor='#746E70'
                                // onChangeText={(val, index, data) => this.changeGender(val, index, data)}
                                value={this.state.States}
                                containerStyle={{}}
                            />
                        </View> */}
                       
                        <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between', elevation: 1, backgroundColor: '#3AA6CD', marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20 }}>
                            <Text style={{ color: '#fff' }} onPress={() => this.updateGeneralInfo()}>
                                Update
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
        // }
    }
    /**
* BloodGroup dropDown Data starts
*/


    /**
  * BloodGroup dropDown Data ends
  */
    updateGeneralInfo = () => {
        var GeneralUsersInfo = "id=" + this.state.userid + "&aadharCardNo=null" + "&prefixname=null" + "&firstName=" + this.state.general_info + "&middleName=null" + "&lastName=null" + "&sufixName=null" +
            "&address=" + this.state.presentAddr + "&city=" + this.state.city + "&states=null" + "&zipCode=" + this.state.zipcode + "&email=null" + "&alternateContactNumber=null" + "&address2=" + this.state.permanentAddr + "&prefLanguage=null" +
            +"&profileImage=null" + "&photoContent=null" + "&otp=null" + "&heightunit=null" + "&bloodPressure=" + this.state.bloodPressure + "&weightunit=null" + "&temperature=" + this.state.temperature + "&temperatureUnit=null" + "&pulseRate=" + this.state.pulseRate + "&pulseRateUnit=null" + "&countryCodes=101" + "&phone=" + this.state.contact_no + "&otherEmail=" + this.state.email_id + "&dateofBirth=" + Moment(new Date(this.state.dateOfBirth)).format('MM/DD/YYYY') + "&height=" + this.state.height + "&weight=" + this.state.weight + "&bloodGroup=B+";
        console.log("GeneralUsersInfo", GeneralUsersInfo);
        fetch('https://care.patientheal.com/PatientCareServices/api/PatientSignUp/PatientProfileUpdate', {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + this.state.datatoken,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            "body": GeneralUsersInfo
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                console.log("generalinfo", res);
                if (res.statusCode == 409) {
                    ToastAndroid.showWithGravity(
                        'Server is down! Please Try Again',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
                else {
                    ToastAndroid.showWithGravity(
                        'Your Record has Updated Successfully',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
            }).catch(err => {
                this.setState({
                    isLoading: false,
                })
                console.log("Errormsg:", err);
                let errMSg = aPIStatusInfo.logError(err);
                this.props.dispatch(ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : "An error occured! Please Try Again",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                ));
                return;
            });

        // let timestamp = (Date.now() / 1000 | 0).toString();
        // let api_key = '442859552564425'
        // let api_secret = 'NAhJuoBcjjfP886c0n2xwvR7jPI'
        // let cloud = 'shubhambhattacharya'
        // let hash_string = 'timestamp=' + timestamp + api_secret
        // let signature = CryptoJS.SHA1(hash_string).toString();
        // let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload'

        // let xhr = new XMLHttpRequest();
        // xhr.open('POST', upload_url);
        // xhr.onload = () => {
        //     console.log(xhr);
        // };
        // let formdata = new FormData();
        // formdata.append('file', { uri: uri, type: 'image/png', name: 'upload.png' });
        // formdata.append('timestamp', timestamp);
        // formdata.append('api_key', api_key);
        // formdata.append('signature', signature);
        // xhr.send(formdata);
    }

    toggleDrawer = () => {
        if (this.state.showMenu) {
            this.setState({
                showMenu: false
            });
        } else {
            this.setState({
                showMenu: true
            });
        }
    };
    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    };

    changeGender = (val, index, data) => {
        this.setState({
            gender: val
        })
    }
    _maybeRenderUploadingOverlay = () => {
        if (this.state.uploading) {
            return (
                <View
                    style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
                    <ActivityIndicator color="#fff" size="large" />
                </View>
            );
        }
    };

    _maybeRenderImage = () => {
        let {
            image
        } = this.state;

        if (!image) {
            return;
        }

        return (

            <View style={styles.maybeRenderImageContainer}>
                <Image source={{ uri: image }} style={{
                    width: 90,
                    height: 90
                }} />
                {/* style={styles.maybeRenderContainer}>
                <View
                    style={styles.maybeRenderImageContainer}>
                    <Image source={{ uri: image }} style={styles.maybeRenderImage} />
                </View> */}

                {/* <Text
                    onPress={this._copyToClipboard}
                    onLongPress={this._share}
                    style={styles.maybeRenderImageText}>
                    {image}
                </Text> */}
            </View>
        );
    };

    _share = () => {
        Share.share({
            message: this.state.image,
            title: 'Check out this photo',
            url: this.state.image,
        });
    };

    _copyToClipboard = () => {
        Clipboard.setString(this.state.image);
        alert('Copied image URL to clipboard');
    };

    _takePhoto = async () => {
        const {
            status: cameraPerm
        } = await Permissions.askAsync(Permissions.CAMERA);

        const {
            status: cameraRollPerm
        } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        // only if user allows permission to camera AND camera roll
        if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
            let pickerResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });

            this._handleImagePicked(pickerResult);
        }
    };

    _pickImage = async () => {
        const {
            status: cameraRollPerm
        } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        // only if user allows permission to camera roll
        if (cameraRollPerm === 'granted') {
            let pickerResult = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
            });

            this._handleImagePicked(pickerResult);
        }
    };

    _handleImagePicked = async pickerResult => {
        let uploadResponse, uploadResult;

        try {
            this.setState({
                uploading: true
            });

            if (!pickerResult.cancelled) {
                uploadResponse = await uploadImageAsync(pickerResult.uri);
                uploadResult = await uploadResponse.json();

                this.setState({
                    image: uploadResult.location
                });
            }
        } catch (e) {
            console.log({ uploadResponse });
            console.log({ uploadResult });
            console.log({ e });
            alert('Upload failed, sorry :(');
        } finally {
            this.setState({
                uploading: false
            });
        }
    };
}

async function uploadImageAsync(uri) {
    let apiUrl = 'https://file-upload-example-backend-dkhqoilqqn.now.sh/upload';

    // Note:
    // Uncomment this if you want to experiment with local server
    //
    // if (Constants.isDevice) {
    //   apiUrl = `https://your-ngrok-subdomain.ngrok.io/upload`;
    // } else {
    //   apiUrl = `http://localhost:3000/upload`
    // }

    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('photo', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
    });

    let options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
    };

    return fetch(apiUrl, options);
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    icons_footer: {
        color: 'black',
        justifyContent: 'flex-end',
        paddingRight: 12, paddingBottom: 12, paddingTop: 8,
        fontSize: 16,
        borderRadius: 50,
    },
    maybeRenderUploading: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
    },
    maybeRenderContainer: {
        borderRadius: 3,
        elevation: 2,
        marginTop: 30,
        shadowColor: 'rgba(0,0,0,1)',
        shadowOpacity: 0.2,
        shadowOffset: {
            height: 4,
            width: 4,
        },
        shadowRadius: 5,
        width: 250,
    },
    maybeRenderImageContainer: {
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        overflow: 'hidden',
    },
    maybeRenderImage: {
        height: 50,
        width: 50,
        borderRadius: 20
    },
    maybeRenderImageText: {
        paddingHorizontal: 10,
        paddingVertical: 10,
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
        width: (Dimensions.get("window").width) - 10,
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#41b4afa6',
    },
    detailsText: {
        fontSize: 14,
        paddingBottom: 5,
        color: '#ffffff'
    },
    inputField: {
        width: '100%',
        color: 'gray',
        borderWidth: 0,
        paddingTop: 11,
        paddingBottom: 8,
        paddingLeft: 5
    },
    inputField1: {
        width: '100%',
        color: 'gray',
        borderWidth: 0,
        paddingBottom: 5,
        paddingTop: 7,
        paddingLeft: 5
    },
    blockCard: {
        width: (Dimensions.get("window").width / 3) - 20,
        backgroundColor: 'white',
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        height: (Dimensions.get("window").width / 3),
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    innerImage: {
        width: 20,
        height: 20,
        marginLeft: 8

    },
    CircleShapeView: {
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        backgroundColor: '#f3f6fb',

    },
});
export default GeneralInfo;