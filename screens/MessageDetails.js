import React, { Component } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, RefreshControl, ToastAndroid, NetInfo } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { UPLOAD_URL } from '../constants/APIUrl';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';

let CONNECTION_STATUS = false;
let TotalFileCount = 0;
class MessageView extends Component {
    constructor(props) {
        super(props);
        this.state = { MsgSub: '', MsgBody: '', SenderName: '', SenderCircle_Bg: '', attachmentLoader: false, attachment: [], recipientName: '', createdDateUtc: '', RecipientEmail: '' };
    }
    async componentDidMount() {
        const { params } = this.props.navigation.state;
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
          });
          NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
          if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
          }
        TotalFileCount = params.TotalFileCount;
        this.setState({
            MsgSub: params.msgsubject,
            MsgBody: params.msgBody,
            SenderName: params.senderName,
            recipientName: params.recipientName,
            createdDateUtc: params.createdDateUtc,
            attachment: params.attachment,
            SenderCircle_Bg: params.color
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    starClicked = () => {
        this.setState({
            startClrChanged: this.state.startColor
        });
    }
    forwardMsgContent = () => (this.state.MsgBody)
    replyMsgContent = () => (this.state.MsgBody)
    downloadAttachment(data) {
        const Domain_URL = UPLOAD_URL;
        data.filePath = Domain_URL + data.filePath.substr(data.filePath.indexOf('PatientCareServices'));
        console.log(data.filePath);
        FileSystem.downloadAsync(
            data.filePath,
            FileSystem.documentDirectory + data.fileName + data.fileExtesnion
        ).then(async ({ uri }) => {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status === 'granted') {
                const asset = await MediaLibrary.createAssetAsync(uri);
                const albulExists = await MediaLibrary.getAlbumAsync('MessageHEAL');
                if (!albulExists) {
                    await MediaLibrary.createAlbumAsync('MessageHEAL', asset, false);
                } else {
                    await MediaLibrary.addAssetsToAlbumAsync(asset, 'MessageHEAL', false);
                }
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
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Message Details....</Text>
                </View>
            );
        } 
            return (
                <CommonView messageDetails={true} >

                    <View style={{ flex: 1 }}>
                        {this.state.showMenu == true ?
                            <View style={{ paddingLeft: 10, backgroundColor: '#40739e', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 10, paddingTop: 0 }}>
                                <TouchableOpacity onPress={() => this.filerList('All')}>
                                    <View style={this.state.filterStat == 'Inactive' ? styles.filterButtons : (this.state.filterStat == 'Active' ? styles.filterButtons : styles.filterButtonsActive)}>
                                        <Text style={this.state.filterStat == 'Inactive' ? styles.filterText : (this.state.filterStat == 'Active' ? styles.filterText : styles.filterTextActive)}>All</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.filerList('Active')}>
                                    <View style={this.state.filterStat == 'Inactive' ? styles.filterButtons : (this.state.filterStat == 'Active' ? styles.filterButtonsActive2 : styles.filterButtons)}>
                                        <Text style={this.state.filterStat == 'Inactive' ? styles.filterText : (this.state.filterStat == 'Active' ? styles.filterTextActive : styles.filterText)}>Active</Text>
                                    </View>
                                </TouchableOpacity>

                            </View> : <Text />}
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.messageView}
                                />
                            }
                        >
                            <View style={{ flex: 1, padding: 15, flexDirection: 'column' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: '#D9D9D9' }}>
                                    <Text style={{ color: 'gray', fontSize: 14, paddingBottom: 5, paddingTop: 5 }}> {this.state.MsgSub} </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, paddingTop: 8, paddingBottom: 10 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: 50, borderRadius: 50 / 2, height: 50, backgroundColor: this.state.SenderCircle_Bg }}>
                                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', color: '#746E6E' }}>{this.state.SenderName.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'column', paddingLeft: 6, paddingTop: 4 }}>
                                            <Text style={{ color: '#746E70', fontSize: 12, fontWeight: 'bold' }}>{this.state.SenderName}</Text>
                                            <Text style={{ color: '#746E70', fontSize: 9 }}>to {this.state.recipientName}</Text>
                                        </View></View>
                                    <View style={{ flexDirection: 'row', paddingTop: 4 }}>
                                        {this.state.attachment.length > 0 ? <MaterialIcons style={{ fontSize: 14, color: '#3AA6CD', paddingTop: 5 }} name='attachment' onPress={() => this.downloadAttachment(this.state.attachment[0])} /> : null}
                                        <Text style={{ paddingLeft: 6, color: '#746E6E' }}>{this.state.createdDateUtc}</Text></View>
                                </View>
                                <Text style={{ color: '#746E70', fontSize: 13 }}>Hi {this.state.recipientName},</Text>
                                <Text style={{ color: '#746E70', fontSize: 11, paddingLeft: 15, paddingTop: 4,lineHeight:17 }} >{this.state.MsgBody.replace('&nbsp;',' ').replace('<br>','\n').replace(/(<([^>]+)>)/ig,"")}</Text>
                            </View>
                        </ScrollView>

                        <View style={{ position: 'absolute', right: 8, bottom: 5, elevation: 4, paddingBottom: 15 }}>
                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ComposeMessage', { TotalFileCount: TotalFileCount, type: 'REPLY', subject: 'RE: ' + this.state.MsgSub, body: this.replyMsgContent() })}>
                                    <View style={styles.cusButtonLargeGreen1}>
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                        > <FontAwesome style={{ fontSize: 20, color: '#ffffffa6', marginRight: 10, paddingRight: 10 }} name='mail-reply' />
                                            Reply
                          </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ComposeMessage', { TotalFileCount: TotalFileCount, type: 'FWD', subject: 'FW: ' + this.state.MsgSub, body: this.forwardMsgContent() })}>
                                    <View style={styles.cusButtonLargeGreen1}>
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}
                                        > <FontAwesome style={{ fontSize: 20, color: '#ffffffa6', marginRight: 10 }} name='mail-forward' />
                                            Forward
                          </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </CommonView >
            );
        
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
        width: (Dimensions.get('window').width) - 20,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    senderName: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        backgroundColor: '#03BD5A'
    },
    textTopField: {
        maxWidth: '100%',
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#41b4af',
        marginBottom: 10,
    },
    cusButtonLargeGreen1: {
        backgroundColor: '#3AA6CD',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        width: (Dimensions.get('window').width / 3) - 20,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        marginRight: 10
    },
    filterButtons: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        paddingTop: 5,
        paddingBottom: 5,
        width: 100,
    },
    allergy: {
        width: (Dimensions.get('window').width / 2) - 30,
        backgroundColor: 'transparent',
        borderRadius: 20,
        elevation: 1,
        alignItems: 'flex-start',
        padding: 10
    },
    filterText: {
        textAlign: 'center',
        color: 'white'
    },
    filterButtonsActive: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        backgroundColor: 'white',
        paddingTop: 5,
        marginRight: -26,
        zIndex: 4,
        paddingBottom: 5,
        width: 100,
    },
    innerImage: {
        width: 20,
        height: 20
    },
    filterButtonsActive2: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        backgroundColor: 'white',
        paddingTop: 5,
        marginLeft: -30,
        zIndex: 4,
        paddingBottom: 5,
        width: 100,

    },
    filterTextActive: {
        textAlign: 'center',
        color: '#40739e'
    }
});
export default MessageView;
