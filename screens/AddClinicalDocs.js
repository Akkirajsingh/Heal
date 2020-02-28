/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, ActivityIndicator, Button, TouchableOpacity, AsyncStorage, View, Dimensions, ToastAndroid, TextInput, NetInfo } from 'react-native';
import Moment from 'moment';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { HOSP_CLINICAL_DOCUMENT, CLINICAL_DOCUMENT } from '../constants/APIUrl';
import * as DocumentPicker from 'expo-document-picker'
import Constants from 'expo-constants';
// import {DocumentPicker} from 'react-native-document-picker';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import Utility from '../components/Utility';
import * as FileSystem from 'expo-file-system';
let CLINICAL_DOCUMENT_URL = CLINICAL_DOCUMENT;
let CONNECTION_STATUS = false;

class AddClinicalDocs extends Component {
    constructor(props) {
        super(props);
        Moment.locale('en');
        this.state = { fileName: '', FileNameEnabled: false, AccessToken: '', Userid: '', uplodFile: '', image: null, clickableImage: true, pickerResult: null, uploading: false, selectedDocument: {} };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            CLINICAL_DOCUMENT_URL = USER_DATA.ServiceURL + HOSP_CLINICAL_DOCUMENT;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
        });
        this.getPermissionAsync();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*****************************************Upload file *********************************************************/
    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }
    _pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({});
        if (!result.cancelled) {
            result.type = result.name.split('.').pop();
            this.setState({ fileName: result.name, selectedDocument: result });
        }
    }
    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    };

    /**************************************************Add ClinicalDocs Api  *****************************************************/
    addClinicalDocs = async () => {
        this.setState({ FileNameEnabled: true });
        const { fileName, image } = this.state;
        if (image === '' || fileName === '') {
            ToastAndroid.showWithGravity(
                'All Fields Are Mandatory',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            ); return;
        }
        const fl = await FileSystem.readAsStringAsync(this.state.selectedDocument.uri, { encoding: FileSystem.EncodingType.Base64 });
        const AddClinicalDocsInfo = {
            "Id": 0,
            "patientId": this.state.Userid,
            "filePath": null,
            "extension": '.' + this.state.selectedDocument.name.split('.').pop(),
            "fileName": this.state.selectedDocument.name,
            "dateUploaded": new Date(),
            "documentType": null,
            "fileContent": fl,
            "documentName": "AddEventByStaff-n",
            "dataSource": "Patient"
        }
        console.log("AddClinicalDocsInfo", AddClinicalDocsInfo);
        fetch(CLINICAL_DOCUMENT_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.state.AccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(AddClinicalDocsInfo)
        })
            .then(aPIStatusInfo.handleResponse)
            .then((response) => response.json())
            .then((res) => {
                if (res.statusCode == 400) {
                    ToastAndroid.showWithGravity(
                        'You Have Missed Some Fields',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    ); this.setState({

                    }); return;
                }
                ToastAndroid.showWithGravity(
                    'You have Successfully Added Clinical Documents',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({
                }, function () {
                    this.props.navigation.navigate('ClinicalDocuments');
                });
            })
            .catch(err => {
                console.log('ClinicalDocuments', err);
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
    /************************************************************************************************ */
    render() {
        let { image } = this.state;
        return (
            <CommonView AddClinicalDocument>
                <View style={{ flex: 1, paddingLeft: 12, paddingRight: 12 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 6, paddingBottom: 2 }}>
                            <View style={{ width: '50%', flexDirection: 'row' }}>
                                <MaterialIcons style={{  paddingTop: 7, paddingRight: 5 }} size={20} name="description" />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 7 }}>File Name:        </Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.inputData}
                                    placeholder={'File Name'}
                                    secureTextEntry={false}
                                    fontSize={17}
                                    onChangeText={(fileName) => this.setState({ fileName })}
                                    value={this.state.fileName}
                                    editable={this.state.FileNameEnabled ? true : false}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderBottomColor: '#8d9393', borderBottomWidth: 0.3, paddingTop: 4, paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row', width: '50%' }}>
                                <MaterialCommunityIcons style={{ paddingTop: 7, paddingRight: 5 }} size={20} name="file-undo" />
                                <Text style={{ color: '#000', fontSize: 17, paddingTop: 6 }}>File:        </Text>
                            </View>
                            <View>

                                <TouchableOpacity activeOpacity={.5} onPress={this._pickImage} >
                                    {/* <Button
                                        title="Choose File"
                                        color="#D1D1D1"
                                        onPress={this._pickImage}
                                    /> */}
                                    <Button
                                        title="Choose File"
                                        color="#D1D1D1"
                                        onPress={this._pickDocument}
                                    />
                                    {image &&
                                        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.addClinicalDocs()}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                    <Text
                                        style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
                                    >
                                        Save
                                </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    inputData: {
        color: '#767575',
        fontSize: 12,
        paddingBottom: 2,
        paddingRight: 5,
        paddingTop: 4
    },
    cusButtonLargeGreen1: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        fontSize: 15,
        color: 'white',
        backgroundColor: '#8dd5ee',
        elevation: 1,
        flex: 1,
        marginBottom: 40,
        marginTop: 15,
        width: (Dimensions.get('window').width) / 3,
        flexDirection: 'row'
    }
});
export default AddClinicalDocs;