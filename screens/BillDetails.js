import React, { Component } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Dimensions,
    ToastAndroid, NetInfo
} from 'react-native';
import Moment from 'moment';
import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';
import Utility from '../components/Utility';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;

class BillDetails extends Component {
    constructor(props) {
        super(props);
        this.state = { AccessToken: '', Userid: '', totalAmount: '', balanceAmount: '', paidStatus:'', isLoading: true };
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
        this.setState({
            billId: params.billId,
            totalAmount: params.totalAmount,
            paidStatus: params.paidStatus,
            balanceAmount: params.balanceAmount,
            isLoading: false
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    /*****************************************Get BillList **************************************************************/
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Billpay Details....</Text>
                </View>
            );
        }
        return (
            <CommonView BillPayDetails>
                <View style={{ flex: 1 }}>
                    <ScrollView>
                        <View style={{ flex: 1, marginTop:70 }}>
                                <View style={styles.card} >
                                        <View style={{ flexDirection: 'row', alignItems:'center', justifyContent:'center', marginTop:9 }}>
                                            <Ionicons style={{ color: "#1ec208", marginTop: 3 }} size={20} name="md-list-box" />
                                            <Text style={{ color: '#767575', fontSize: 15, paddingLeft: 15, fontWeight: 'bold' }}>Amount To Pay</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 20, paddingLeft: 15, paddingRight: 15 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' />  Total Amount: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(this.state.totalAmount) ? '' : this.state.totalAmount}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop:15 }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <FontAwesome style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='money' /> Balance Amount: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(this.state.balanceAmount) ? '' : this.state.balanceAmount}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop:15 }}>
                                                <Text style={{ color: '#767575', fontSize: 12 }}> <AntDesign style={{ color: '#3AA6CD', marginTop: 3 }} size={12} name='infocirlceo' />  Status: </Text>
                                                <Text style={{ fontSize: 12, color: '#B3B0B0', marginLeft: 10 }}>
                                                    {Utility.IsNullOrEmpty(this.state.paidStatus) ? '' : this.state.paidStatus}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                    </ScrollView>
                </View>
            </CommonView>
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
        width: ((Dimensions.get('window').width)) - 20,
        height:((Dimensions.get('window').height)/3) - 20,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 12,
        marginBottom: 15,
        paddingTop: 5,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomWidth: 0.5,
        borderBottomColor: '#40739e',
        borderRadius: 10,
        shadowColor: '#0000007a',
        shadowOpacity: 0.3,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    textTopField: {
        maxWidth: '100%',
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#41b4af',
        marginBottom: 10,
    },
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
    }
});
export default BillDetails;

