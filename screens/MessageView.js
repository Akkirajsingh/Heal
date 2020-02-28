import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, AsyncStorage, View, RefreshControl, TextInput, ToastAndroid, NetInfo, CheckBox } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import Moment from 'moment';
import Utility from '../components/Utility';
import { Dropdown } from 'react-native-material-dropdown';
import { MARK_READ_MSG, FOLDERS_MSGS_COUNT, FOLDER_MSGS, MOVE_MSG, HOSP_MARK_READ_MSG, HOSP_FOLDERS_MSGS_COUNT, HOSP_FOLDER_MSGS, HOSP_MOVE_MSG } from '../constants/APIUrl';
import { FlatList } from 'react-native';
let CONNECTION_STATUS = false;
let MARK_READ_MSG_URL = MARK_READ_MSG;
let FOLDERS_MSGS_COUNT_URL = FOLDERS_MSGS_COUNT;
let FOLDER_MSGS_URL = FOLDER_MSGS;
let MOVE_MSG_URL = MOVE_MSG;
import * as FileSystem from 'expo-file-system';
import AccessRecord from '../components/AccessRecord';
let FolderType: [];
let TotalFileCount: 0;
class MessageView extends Component {
    constructor(props) {
        super(props);
        this.state = { isFilterActive: false, MessageRespOriginal: [], userid: '', searchText: '', IsSearchIconVisible: true, AccountId: '', AccessToken: '', datatoken: '', MessageLoading: true, startClrChanged: '', tickicon: true, startColor: '#D3C227', filterStat: 'All', filterData: '', MessageResp: [], isLoading: false, refreshing: false, contextMenuVisible: false, selectAll: false, selectedItems: '', FolderType: [] };
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
        let USER_DATA = await AsyncStorage.getItem('USER_DATA');
        USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
         MARK_READ_MSG_URL = MARK_READ_MSG;
         FOLDERS_MSGS_COUNT_URL = FOLDERS_MSGS_COUNT;
         FOLDER_MSGS_URL = FOLDER_MSGS;
         MOVE_MSG_URL = MOVE_MSG;
        if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
            USER_DATA = USER_DATA.Hospital;
            MARK_READ_MSG_URL = USER_DATA.ServiceURL + HOSP_MARK_READ_MSG;
            FOLDERS_MSGS_COUNT_URL = USER_DATA.ServiceURL + HOSP_FOLDERS_MSGS_COUNT;
            FOLDER_MSGS_URL = USER_DATA.ServiceURL + HOSP_FOLDER_MSGS;
            MOVE_MSG_URL = USER_DATA.ServiceURL + HOSP_MOVE_MSG;
        }
        this.setState({
            AccessToken: USER_DATA.ACCESS_TOKEN,
            Userid: USER_DATA.User_Id,
            AccountId: USER_DATA.Id,
        });
        this.messageCategory();
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    onSelectedItemsChange = (val) => {
        const messageFilter = this.state.FolderType.filter((item) => {
            return item.Id == val;
        });
        this.setState({ selectedItems: val });
        if (messageFilter.length > 0) { this.messageView(messageFilter[0].Name); }
    };
    filter = (val) => {
        this.setState({ isFilterActive: val.data });
    }
    search = (val) => {
        if (Utility.IsNullOrEmpty(val)) {
            this.setState({ MessageResp: this.state.MessageRespOriginal, searchText: '' });
        } else {
            const MessageRespSearch = this.state.MessageRespOriginal.filter((item) => {
                return item.subject.toLowerCase().indexOf(val.toLowerCase()) > -1;
            });
            this.setState({ MessageResp: MessageRespSearch, searchText: val });
        }
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    AccountId: value.accountId
                }, function () {
                    this.messageCategory();
                });
            }
        }
    }
    readMessages = (messageID) => {
        if (Utility.IsNullOrEmpty(messageID)) {
            return;
        }
        let obj = {};
        obj.recipientId = this.state.AccountId;
        obj.messagesIds = messageID;
        fetch(MARK_READ_MSG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + this.state.AccessToken,
            },
            body: JSON.stringify(obj)
        })//.then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                const index = this.state.MessageResp.findIndex(
                    item => item.id == messageID
                );
                this.state.MessageResp[index].status = 5;
                this.setState({ MessageResp: this.state.MessageResp });
            }).catch(() => {
                this.setState({
                    isLoading: false,
                    refreshing: false
                });
                const errMSg = '';// aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : 'A Server error has occured! Please Try Again',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    messageCategory = () => {
        FolderType = []; TotalFileCount = 0;
        fetch(`${FOLDERS_MSGS_COUNT_URL}?accountId=${this.state.AccountId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + this.state.AccessToken
            },
        })//.then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                res.responseData.forEach((item) => {
                    TotalFileCount += item.count;
                    FolderType.push({ Id: item.folderId.toString(), Name: item.folderName.toString(), value: item.folderId.toString(), label: item.folderName.toString(), });
                });
                this.setState({ FolderType }, function () {
                    this.messageView();
                });
            }).catch(() => {
                this.setState({
                    isLoading: false,
                    refreshing: false
                });
                ToastAndroid.showWithGravity(
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    deleteMessages = () => {
        const messageIDsToBeDeleted = [];
        this.state.MessageResp.filter((item) => {
            if (item.isSelect == true) messageIDsToBeDeleted.push(item.id);
        });
        if (messageIDsToBeDeleted.length == 0) {
            ToastAndroid.showWithGravity(
                'No message to read',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            return;
        }
        const selectedItems = this.state.selectedItems;
        const messageFilter = this.state.FolderType.filter((item) => {
            return item.Id == selectedItems;
        });
        let obj = {};
        obj.messageType = 3;
        obj.folderId = this.state.selectedItems;
        obj.messagesIds = messageIDsToBeDeleted.join();
        fetch(MOVE_MSG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: 'Bearer ' + this.state.AccessToken,
            },
            body: JSON.stringify(obj)
        })//.then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((res) => {
                ToastAndroid.showWithGravity(
                    'Message deleted successfully',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({ contextMenuVisible: false, isLoading: false }, function () { this.messageView(messageFilter[0].Name); });
            }).catch(() => {
                this.setState({
                    isLoading: false,
                    refreshing: false
                });
                const errMSg = '';// aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : 'A Server error has occured! Please Try Again',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            });
    }
    messageView = async (folderName1) => {
        this.setState({ MessageLoading: true });
        const folderName = Utility.IsNullOrEmpty(folderName1) ? 'Inbox' : folderName1;
        let messageFilter = this.state.FolderType;
        const filteredType = messageFilter.filter((item) => { return item.Name == folderName; });
        if (filteredType.length > 0) messageFilter = filteredType[0];
        fetch(`${FOLDER_MSGS_URL}?folderId=${messageFilter.Id}&accountId=${this.state.AccountId}&patientId=${this.state.Userid}&folderType=${messageFilter.Name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + this.state.AccessToken,
            },
        })//.then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then(async (res) => {
                const res1 = await res.responseData.map(item => {
                    item.isSelect = false;
                    item.selectedClass = styles.list;
                    return item;
                });
                await this.setState({
                    isLoading: false,
                    MessageResp: res1,
                    MessageRespOriginal: res1,
                    filterStat: 'All',
                    searchText: '',
                    selectedItems: messageFilter.Id,
                    MessageLoading: false
                });
            })
            .catch(err => {
                const errMSg = '';// aPIStatusInfo.logError(err);
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : 'An error occured',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                this.setState({ MessageLoading: false });
                //   return;
            });
    }
    FlatListItemSeparator = () => <View style={styles.line} />;
    selectAllItem = () => {
        const selectAll = !this.state.selectAll;
        this.setState({ selectAll });
        this.setState({
            MessageResp: this.state.MessageResp.map(item => {
                item.isSelect = selectAll;
                item.selectedClass = selectAll ? styles.selected : styles.list;
                return item;
            })
        });
    };
    unselectAllItem = () => {
        this.setState({
            MessageResp: this.state.MessageResp.map(item => {
                item.isSelect = false;
                item.selectedClass = styles.list;
                return item;
            }),
            contextMenuVisible: false,
            selectAll: false
        });
    };
    selectItem = data => {
        data.item.isSelect = !data.item.isSelect;
        data.item.selectedClass = data.item.isSelect ?
            styles.selected : styles.list;
        const index = this.state.MessageResp.findIndex(
            item => data.item.id == item.id
        );
        this.state.MessageResp[index] = data.item;
        this.setState({
            MessageResp: this.state.MessageResp,
            contextMenuVisible: true
        });
    };
    renderItem = data => {
        const ItemIndex = this.state.MessageResp.findIndex(
            item => data.item.id == item.id
        );
        return (<TouchableOpacity
            style={[styles.list, data.item.selectedClass]}
            onLongPress={() => this.selectItem(data)}
            onPress={() => { this.readMessages(data.item.id); this.props.navigation.navigate('MessageDetails', { messageId: data.item.id, senderName: data.item.senderName, msgBody: data.item.body, msgsubject: data.item.subject, recipientName: data.item.recipients[0].recipientName, createdDateUtc: Moment(data.item.createdDateUtc).format('HH:MM A'), TotalFileCount, attachment: data.item.attachments, color: this.getcolor(ItemIndex) }); }} key={data.item.id}
            key={data.item.id}
        >
            <View style={{ flex: 1, flexDirection: 'row', marginLeft: 6, marginRight: 6, paddingTop: 7, paddingBottom: 7, backgroundColor: data.item.status == 0 ? '#c7e2f1' : '#ffffff' }}>

                <View style={{ width: '15%', }} >
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 50 / 2,
                            backgroundColor: this.getcolor(ItemIndex)
                        }}
                    >
                        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} >
                                {this.state.contextMenuVisible ?
                                    <CheckBox
                                        style={{ elevation: 1, alignItems: 'flex-start', height: 10, marginLeft: -12, color: '#fff' }}
                                        value={data.item.isSelect}
                                        onValueChange={() => this.selectItem(data)}
                                    />
                                    : null}
                                <Text style={{ fontWeight: 'bold', alignItems: 'center', color: '#fff', fontSize: 20 }}>{(data.item.subject.trim() == '' || data.item.subject == null) ? '?' : data.item.subject.charAt(0).toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'column', paddingLeft: 10, paddingRight: 10, width: '71%' }}>
                    <View style={{ flex: 1, paddingBottom: 2 }}>
                        <Text style={{ fontSize: 12, fontweight: '300', color: 'black', marginLeft: 10 }}>
                            {(data.item.subject.trim() == '' || data.item.subject == null || data.item.subject == undefined) ? 'No Data' : data.item.subject}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: '#746E6E', marginLeft: 10, lineHeight: 17 }}>
                            {(data.item.body.trim() == '' || data.item.body == null || data.item.body == undefined) ? 'No Data' : data.item.body.replace('&nbsp;', ' ').replace('<br>', '\n').replace(/(<([^>]+)>)/ig, "")}
                        </Text>
                    </View>
                </View>
                <View style={{ width: '14%', flexDirection: 'column' }}>
                    <Text style={{ color: '#746E6E', fontSize: 8 }}> {Moment(data.item.createdDateUtc).format('HH:MM A')}</Text>
                    {data.item.attachments.length > 0 ? <MaterialIcons style={{ fontSize: 14, color: '#3AA6CD', paddingTop: 5 }} name='attachment' /> : null}
                </View>
            </View>
        </TouchableOpacity>);
    }
    getMessageData = () => {
        this.setState({
            tickicon: false
        });
    }
    noItemDisplay = () => (<View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: 60 }}>
        <View style={{
            padding: 20,
            borderRadius: 110,
            width: 130,
            height: 130,
            backgroundColor: '#3AA6CD',
        }}>
            <FontAwesome style={{ fontSize: 80, fontWeight: '800', color: 'white', paddingLeft: 5 }} name='envelope' />
        </View>
        <Text style={{ marginTop: 20, fontSize: 20 }}>No messages yet</Text>
    </View>)
    starClicked = () => {
        this.setState({
            startClrChanged: this.state.startColor
        });
    }
    getcolor = (index) => {
        let color = ['#050f2c', '#003666', '#00aeff', '#3369e7', '#8e43e7',
            '#b84592', '#ff4f81', '#ff6c5f', '#ffc168', '#2dde98', '#1cc7d0', '#7f181b', '#990033', '#3be8b0', '#eb5424', '#6534ac', '#a626aa'];
        if (index > color.length - 1) {
            index %= color.length;
        } return color[index];
    }
    updateState(data) {
        this.setState({ MessageResp: data.FilteredData });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>

                    <Text>Loading Messages....</Text>
                </View>
            );
        }
        return (
            <CommonView messageDetails={true} >
                <View style={{ flex: 1 }}>
                <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.messageView}
                            />
                        }
                    >
                        {this.state.contextMenuVisible ? <View style={{ flex: 1, elevation: 3, flexDirection: "row", borderColor: "#cacaca", marginTop: 40, justifyContent: "flex-start", alignItems: "center" }}>
                            <View style={{ flexDirection: 'row' }}>
                                <CheckBox
                                    style={{ marginLeft: 5, elevation: 4 }}
                                    value={this.state.selectAll}
                                    //onPress={this.selectAllItem}
                                    onValueChange={() => this.selectAllItem()}
                                /><Text style={{ alignItems: "flex-start", marginTop: 7, marginRight: 20 }}>Select All</Text>
                            </View>
                            <MaterialCommunityIcons style={{ fontSize: 20, fontWeight: '300', color: '#333333', paddingTop: -15, alignItems: "flex-end" }} onPress={() => this.deleteMessages()}
                                name='delete' />

                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
                                <MaterialCommunityIcons onPress={() => this.unselectAllItem()} style={{ fontSize: 20, fontWeight: '300', marginRight: 10, color: '#333333', alignItems: "flex-end", justifyContent: "flex-end" }}
                                    name='close' /></View>
                        </View> : null}

                        <View style={{ flex: 1, marginTop: 4, width: '100%', }}>

                            <View style={{ flex: 1, flexDirection: "row", width: '100%', justifyContent: "flex-start", alignItems: "center" }}>
                                {this.state.IsSearchIconVisible ? <Dropdown

                                    baseColor="#000"
                                    label='Status'
                                    value={this.state.selectedItems}
                                    data={this.state.FolderType}
                                    textColor='#746E6E'
                                    labelHeight={7}
                                    labelFontSize={17}
                                    fontSize={16}
                                    selectedItemColor='#41b4af'
                                    containerStyle={{ marginLeft: 5, marginBottom: 10, marginTop: 5, width: '85%' }}
                                    onChangeText={(val, index) => this.onSelectedItemsChange(val, index, this.state.FolderTypeta)}
                                /> : <TextInput
                                        placeholder={'Search...'}
                                        style={styles.TextInput}
                                        fontSize={16}
                                        secureTextEntry={false}
                                        onChangeText={(searchText) => this.search(searchText)}
                                        value={this.state.searchText}
                                    />}
                                {this.state.IsSearchIconVisible ? <FontAwesome style={{ justifyContent: "flex-end", fontSize: 25, fontWeight: '500', color: '#3AA6CD', marginLeft: 10, marginRight: 10 }} name='search' onPress={() => this.setState({ IsSearchIconVisible: false })} /> : <FontAwesome style={{ justifyContent: "flex-end", fontSize: 25, fontWeight: '500', color: '#3AA6CD', marginLeft: 8, marginRight: 10 }} name='filter' onPress={() => this.setState({ IsSearchIconVisible: true })} />}
                            </View>
                            {this.state.MessageLoading ? <ActivityIndicator style={{ padding: 50 }} />
                                : <FlatList
                                    data={this.state.MessageResp}
                                    ItemSeparatorComponent={this.FlatListItemSeparator}
                                    renderItem={item => this.renderItem(item
                                    )}
                                    keyExtractor={item => item.id.toString()}
                                    extraData={this.state}
                                    ListEmptyComponent={this.noItemDisplay}
                                />}

                        </View>
                    </ScrollView>
                    <View style={{ position: 'absolute', right: 8, bottom: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ComposeMessage', { TotalFileCount: TotalFileCount, type: 'COMPOSE' })}>
                            <View style={{
                                padding: 10,
                                borderRadius: 110,
                                width: 55,
                                height: 55,
                                backgroundColor: '#3AA6CD',
                            }}>
                                <View style={{ borderRadius: 90, width: 35, height: 35, borderWidth: 1, borderColor: '#ffffff80', }}>
                                    <MaterialCommunityIcons style={{ fontSize: 28, fontWeight: '300', textAlign: 'center', color: '#fff' }}
                                        name='pencil' />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </CommonView>
        );

    }
}
const styles = StyleSheet.create({

    filterButtons: {
        borderWidth: 0.8,
        borderColor: 'white',
        borderRadius: 15,
        paddingTop: 5,
        paddingBottom: 5,
        width: 100,
    },
    filterText: {
        textAlign: 'center',
        color: 'white'
    },
    senderName: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
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
    },
    list: {
        paddingVertical: 0,
        marginBottom: 2,
        flexDirection: 'column',
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex: -1,
        borderBottomWidth: 0.2,
        borderBottomColor: '#cacaca'

    },
    selected: { backgroundColor: '#d2f8fd', borderRadius: 4 },
    TextInput: {
        width: '85%',
        borderBottomWidth: 0.2,
        borderBottomColor: '#000',
        marginLeft: 5,
        marginBottom: 10,
        marginTop: 15
    },
    line: { marginLeft: 6, marginRight: 6 }
});
export default MessageView;
