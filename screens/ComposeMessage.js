/* eslint-disable no-undef */
/* eslint-disable max-len */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Button, image, Platform, ActivityIndicator, AsyncStorage, View, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import CommonView from '../components/CommonView';
import { COMPOSE_MSG, GET_RECIPIENT_USERS, HOSP_COMPOSE_MSG, HOSP_GET_RECIPIENT_USERS } from '../constants/APIUrl';
import { USERS_VALIDATION_ERROR, DATA_NOT_AVAILABLE } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import AutoTags from 'react-native-tag-autocomplete';
let COMPOSE_MSG_URL = '';
let GET_RECIPIENT_USERS_URL = '';
let CONNECTION_STATUS = false;
let TotalFileCount = 0;
class ComposeMessage extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        this.state = {
            suggestions: [{ name: '' },],
            // eslint-disable-next-line object-property-newline
            HospitalLogin:false,
            tagsSelected: [], AccessToken: '', Userid: '', AccountId: '', SenderName: '', fileName: '', RecipientList: [], RecipientEmailRecord: [], RecipientIdResp: [], RecipientRecordResp: [], image: null, subjectName: '', composeMsg: '', isSending: false
        };
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
        console.log('params', params);
        let subject = ''; let body = '';
        let type = params.type;
        TotalFileCount = params.TotalFileCount;
        if (type == 'REPLY') {

            subject = params.subject;
            body = params.body;

        }
        else if (type == 'FWD') {
            subject = params.subject;
            body = params.body;
        }
        else {
            subject = '';
            body = '';
        }
        COMPOSE_MSG_URL = COMPOSE_MSG;
        GET_RECIPIENT_USERS_URL = GET_RECIPIENT_USERS;
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        let HospitalLogin=false;
        if (USER_DATA.hasOwnProperty('Hospital')) {
            HospitalLogin=true;
            USER_DATA = USER_DATA.Hospital;
            COMPOSE_MSG_URL = USER_DATA.ServiceURL + HOSP_COMPOSE_MSG;
            GET_RECIPIENT_USERS_URL = USER_DATA.ServiceURL + HOSP_GET_RECIPIENT_USERS;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            AccountId: USER_DATA.Id,
            composeMsg: body,
            subjectName: subject,
            HospitalLogin:HospitalLogin
        });
        this.getPermissionAsync();
        this.getRecipientUserRecord();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }

    /*******************************************************GetRecipientUsers ******************************************/
    handleDelete = index => {
        let tagsSelected = this.state.tagsSelected;
        tagsSelected.splice(index, 1);
        this.setState({ tagsSelected });
    }

    handleAddition = suggestion => {
        //  console.log("suggestion", suggestion)
        this.setState({ tagsSelected: this.state.tagsSelected.concat([suggestion]) });
    }
    getRecipientUserRecord = () => {
        fetch(GET_RECIPIENT_USERS_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.responseData.length == 0) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            DATA_NOT_AVAILABLE,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        AlertIOS.alert(DATA_NOT_AVAILABLE);
                    }
                    this.setState({ isSending: false, RecipientRecordResp: res.responseData });
                    return;
                }
                // const RecipientEmail = []; const RecipientId = [];
                let RecipientList = [];
                console.log("comp",res.responseData);
                console.log("HospitalLogin",this.state.HospitalLogin);
                for (let i = 0; i < res.responseData.length; i++) {
             
                    if(this.state.HospitalLogin)
                    RecipientList.push({ name: res.responseData[i].recipientEmail, id: res.responseData[i].accountId });
                    else  RecipientList.push({ name: res.responseData[i].recipientName, id: res.responseData[i].accountId });
                    // RecipientId.push(res.responseData[i].accountId);
                }
                this.setState({
                    RecipientList: RecipientList, isSending: false
                });
            })
            .catch(err => {
                console.log('recorderr', err);
                this.setState({
                    isLoading: false,
                    refreshing: false,
                    RecipientList: []
                });
                const errMSg = aPIStatusInfo.logError(err);
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
                }
            });
    }
    /*************************************** Compose Message  *******************************************/
    ComposeMessage = () => {
        this.setState({ isSending: true });
        const { composeMsg, subjectName } = this.state;
        if (composeMsg === '' || subjectName === '') {
            ToastAndroid.showWithGravity(
                USERS_VALIDATION_ERROR,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); this.setState({ isSending: false }); return;
        }

        let fileData = [];
        let fileObject = {};
        fileObject.file = this.state.image;
        fileObject.extension = this.state.fileName.split('.').pop();
        fileObject.name = this.state.fileName;
        fileData.push(fileObject);
        const composeData = {
            body: this.state.composeMsg,
            subject: this.state.subjectName,
            messageType: 1,
            totalFiles: TotalFileCount,
            recipientEmail: this.state.tagsSelected.map(a => a.name).join(),
            recipientId: this.state.tagsSelected.map(a => a.id),
            patientId: this.state.Userid,
            senderId: this.state.AccountId,
            patientStatus: 1,
            unreadMsgCount: 0,
            attachments: fileData
        };
        console.log(composeData);
        fetch(COMPOSE_MSG_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(composeData)
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.statusCode == 500 || res.statusCode == 400) {
                    ToastAndroid.showWithGravity(
                        'Server error has occured',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({
                        isSending: false
                    }); return;
                }
                ToastAndroid.showWithGravity(
                    'Message Sent Successfully  ',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({
                    isSending: false
                }, function () {
                    this.props.navigation.navigate('MessageView');
                });
            }).catch(err => {
                console.log('recordAcess', err);
                this.setState({ isSending: false });
                const errMSg = '';
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    /*******************************************Document Picker *********************************************************/
    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }
    _pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        if (!result.cancelled) {
            let DocumentPicker = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 })
            // console.log("DocumentPicker", DocumentPicker)
            this.setState({ image: DocumentPicker, fileName: result.name });
        }
    }
    /*..........................................................................................................................*/
    render() {
        return (
            <CommonView ComposeMessages>
                <View style={{ flex: 1, paddingLeft: 8, paddingRight: 8, paddingTop: 4 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        style={{ paddingLeft: 6, paddingRight: 6 }}
                    >
                        <KeyboardAvoidingView behavior="padding" enabled>
                            <View style={{ flexDirection: 'column' }}>
                                <View style={{ paddingTop: 7 }}>
                                    <Text style={styles.stylingmsg}>To </Text>
                                    <AutoTags
                                        suggestions={this.state.RecipientList}
                                        tagsSelected={this.state.tagsSelected}
                                        // style={styles.stylingcmposemsg}
                                        handleAddition={this.handleAddition}
                                        handleDelete={this.handleDelete}
                                        placeholder="Add Recipient.." />
                                </View>
                                <View style={{ paddingTop: 7 }}>
                                    <Text style={styles.stylingmsg} >Subject </Text>
                                    <AutoTags   
                                        // style={styles.stylingcmposemsg}
                                        secureTextEntry={false}
                                        onChangeText={(subjectName) => this.setState({ subjectName })}
                                        value={this.state.subjectName}
                                    />
                                </View>
                                <View style={{ flexDirection: 'column', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 4, paddingBottom: 3 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <MaterialCommunityIcons style={{ color: '#3AA6CD', paddingTop: 7, paddingRight: 5 }} size={14} name="file-undo" />
                                        <Text style={{ color: 'gray', fontSize: 17, paddingTop: 6, paddingBottom: 2 }}>Attachment:          </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: '50%' }}>

                                            <TouchableOpacity activeOpacity={0.5} >
                                                <Button
                                                    style={styles.attachFile}
                                                    title="Choose File"
                                                    color="#D1D1D1"
                                                    onPress={this._pickDocument}
                                                />
                                                {image &&
                                                    <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                                            </TouchableOpacity>


                                        </View>
                                        <View style={{ width: '50%' }}>
                                            <TextInput
                                                style={styles.inputData}
                                                numberOfLines={2}
                                                placeholder={'No File Chosen'}
                                                secureTextEntry={false}
                                                onChangeText={(fileName) => this.setState({ fileName })}
                                                value={this.state.fileName}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={{ paddingTop: 7 }} >
                                    <Text style={styles.stylingmsg}>Compose Message    </Text>
                                    <TextInput
                                        style={styles.stylingcmposemsg} numberOfLines={3}
                                        secureTextEntry={false}
                                        onChangeText={(composeMsg) => this.setState({ composeMsg })}
                                        value={this.state.composeMsg.replace('&nbsp;',' ').replace('<br>','\n').replace(/(<([^>]+)>)/ig,"")}
                                    />
                                </View>
                            </View>
                            <View style={{ margin: 10 }} />
                            <View style={{ width: '30%' }} />
                            <View style={{ width: '40%', alignItems: 'flex-start', justifyContent: 'flex-start', paddingBottom: 12 }}>
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.ComposeMessage()} >
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
                                        >
                                            Send
                                </Text>

                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '30%' }} />
                        </KeyboardAvoidingView>
                    </ScrollView>
                </View >
            </CommonView >

        );
    }
}

const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#3AA6CD',
        elevation: 1,
        flex: 1,
        flexDirection: 'row'
    },
    stylingmsg: {
        color: 'gray',
        fontSize: 17,
        paddingTop: 5,
        paddingLeft: 6,
        paddingBottom: 2
    },
    inputData: {
        color: '#767575',
        fontSize: 12,
        paddingBottom: 2,
        paddingRight: 5,
        paddingTop: 4,
        paddingLeft: 5
    },
    attachFile: {
        borderWidth: 15,
        width: '30%'
    },
    stylingcmposemsg: {
        color: '#746E6E', fontSize: 12, borderColor: '#8d9393', borderWidth: 0.3, borderRadius: 15, padding: 5
    }
});
export default ComposeMessage;