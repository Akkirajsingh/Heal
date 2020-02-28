import React, { Component } from 'react';
import {
    ScrollView,
    Image,
    Text, Alert,
    TouchableOpacity,
    AsyncStorage, Dimensions,
    View, RefreshControl, ToastAndroid, NetInfo,
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import Moment from 'moment';
import Utility from '../components/Utility';
import { DELETE_CLINICAL_DOC, CLINICAL_DOCUMENT, HOSP_DELETE_CLINICAL_DOC, HOSP_CLINICAL_DOCUMENT, UPLOAD_URL } from '../constants/APIUrl';
import { CLINICAL_DOCS_DELETE_SUCCESS_MSG, DATA_NOT_AVAILABLE } from '../constants/Messages';
import { COMMON_ERROR } from '../constants/ErrorMessage';
import aPIStatusInfo from '../components/ErrorHandler';
import AccessRecord from '../components/AccessRecord';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
let CONNECTION_STATUS = false;

let DELETE_CLINICAL_DOC_URL = '';
let CLINICAL_DOCUMENT_URL = '';

class ClinicalDocuments extends Component {
    constructor(props) {
        super(props);
        this.state = { datatoken: '', userid: '', refreshing: false, isLoading: true, loadingMsg: 'Loading Clinical Documents.....' }
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                DELETE_CLINICAL_DOC_URL = DELETE_CLINICAL_DOC;
                CLINICAL_DOCUMENT_URL = CLINICAL_DOCUMENT;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    DELETE_CLINICAL_DOC_URL = USER_DATA.ServiceURL + HOSP_DELETE_CLINICAL_DOC;
                    CLINICAL_DOCUMENT_URL = USER_DATA.ServiceURL + HOSP_CLINICAL_DOCUMENT;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            datatoken: USER_DATA.ACCESS_TOKEN,
                            userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.clinicalDocumentsData();
                        });
                    }
                } else {
                    this.setState({
                        userid: USER_DATA.User_Id,
                        datatoken: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.clinicalDocumentsData();
                    });
                }
            }
        );
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    updateState(data) {
        this.setState({ clinicalDocsData: data.FilteredData });
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userid: value.patientId
                }, function () {
                    this.clinicalDocumentsData();
                });
            }
        }
    }
    /***************************************************Delete Clinical Documents *******************************************************/
    deleteClinicalDocs = (id) => {
        Alert.alert(
            'Confirm Delete?',
            'Are you sure you want to delete this record? ',
            [
                { text: 'Yes', onPress: () => this.deleteConfirm(id) },
                { text: 'No', onPress: () => console.log('Not Deleted'), style: 'cancel' },
            ],
            { cancelable: false },
        );
    };
    deleteConfirm = async (id) => {
        this.setState({
            loadingMsg: 'Deleting Recorded Data...',
            isLoading: true,
        });
        const data = `id=${id}`;
        fetch(DELETE_CLINICAL_DOC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
            body: data
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                if (res.statusCode == 200) {
                    ToastAndroid.show(CLINICAL_DOCS_DELETE_SUCCESS_MSG, ToastAndroid.SHORT);
                    this.setState({
                        isLoading: false,
                    }, function () {
                        this.clinicalDocumentsData();
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
    };
    /********************************************************Get Clinical Documents Data **********************************************************************************/
    clinicalDocumentsData = () => {
        fetch(`${CLINICAL_DOCUMENT_URL}?patientId=${this.state.userid}&pageNumber=1&PageSize=6`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.datatoken}`,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                console.log('res', res);
                if (Utility.IsNullOrEmpty(res) || res.responseData.clinicalDocuments.length == 0) {
                    ToastAndroid.showWithGravity(
                        DATA_NOT_AVAILABLE,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }

                this.setState({
                    isLoading: false,
                    clinicalDocsData: res.responseData.clinicalDocuments,

                });
            })
            .catch((err) => {
                this.setState({
                    isLoading: false,
                    refreshing: false
                });
                const errMSg = aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : COMMON_ERROR,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    download(data) {
        let Domain_URL = UPLOAD_URL;
        data.filePath = Domain_URL + data.filePath.substr(data.filePath.indexOf("PatientCareServices"))
        console.log(data);
        console.log("Domain_URL", Domain_URL);
        FileSystem.downloadAsync(
            data.filePath,
            // FileSystem.documentDirectory + data.fileName + data.fileExtesnion
            FileSystem.documentDirectory + data.fileName
        ).then(async ({ uri }) => {
            console.log("uri", uri);
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status === "granted") {
                const asset = await MediaLibrary.createAssetAsync(uri);
                // const albulExists = await MediaLibrary.getAlbumAsync('ClinicalDocHEAL');
                // console.log("albulExists", albulExists);
                // if (!albulExists) {
                //     await MediaLibrary.createAlbumAsync('ClinicalDocHEAL', asset, false);
                // } else {
                //     await MediaLibrary.addAssetsToAlbumAsync(asset, 'ClinicalDocHEAL', false)
                // }
                ToastAndroid.showWithGravity(
                    'You have successfully downloaded your file.',
                    // <ActivityIndicator style={{ paddingRight: 5 }} />,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
        }).catch(error => {
            console.error(error);
        });
    }
    /***********************************************************************************************************************************/
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>{this.state.loadingMsg}</Text>
                </View>
            );
        } else {
            return (
                <CommonView customHeading='Clinical Documents' updateParentState={this.updateState.bind(this)}>
                    <View style={{ flex: 1 }}>
                        <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.clinicalDocumentsData}
                            />
                        }>
                            <View style={{ flex: 1 }}>
                                <View>
                                    <Text style={{ fontSize: 17, padding: 10, fontWeight: 'bold', color: '#746e6e' }}>Recent</Text>
                                </View>
                                {this.state.clinicalDocsData.map(data => (
                                    <View style={{ paddingLeft: 15, paddingRight: 15 }}>
                                        <View style={{ flexDirection: 'row', padding: 10, elevation: 2, marginBottom: 10, borderColor: 'transparent', borderWidth: 1 }}>
                                            <View style={{ flex: 2, backgroundColor: '#F3F6FB', padding: 15, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                <FontAwesome name="calendar" size={19} color="#736F6E" style={{ position: 'absolute', top: 10, left: 10 }} />
                                                <Text style={{ fontWeight: '100', fontSize: 15, marginBottom: 2 }}>{Moment(data.dateUploaded).format('MMM')}</Text>
                                                <Text style={{ fontWeight: 'bold', fontSize: 23, marginBottom: 2 }}>{Moment(data.dateUploaded).format('DD')}</Text>
                                                <Text style={{ fontWeight: '100', fontSize: 15 }}>{Moment(data.dateUploaded).format('YYYY')}</Text>
                                            </View>
                                            <View style={{ flex: 6, padding: 25 }}>
                                                <Text style={{ fontSize: 17, fontWeight: '500', marginBottom: 5 }} onPress={(item) => { this.download(data) }}>{data.fileName}</Text>
                                            </View>
                                            <MaterialIcons name="delete" size={20} color="#736F70" onPress={() => { this.deleteClinicalDocs(data.id); }} style={{ position: 'absolute', top: 10, right: 10 }} />
                                        </View>
                                    </View>
                                ))}
                                {this.state.clinicalDocsData.length == 0 ?
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: (Dimensions.get('window').height) / 2, }} >
                                        <Text style={{ fontWeight: "bold", color: 'gray' }}>No Data Available</Text>
                                    </View>
                                    : null}
                            </View>
                        </ScrollView>
                        <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AddClinicalDocs')}>
                                <View
                                    style={{
                                        padding: 10,
                                        borderRadius: 110,
                                        width: 55,
                                        height: 55,
                                        backgroundColor: '#F7F1FF',
                                    }}
                                >
                                    <View style={{ elevation: 1, borderRadius: 90, width: 35, height: 35, borderWidth: 1, borderColor: '#gray', }}>
                                        <Ionicons
                                            style={{ fontSize: 35, fontWeight: 10, textAlign: 'center', color: '#000' }}
                                            name='ios-add'
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </CommonView>
            );
        }
    }
}

export default ClinicalDocuments;
