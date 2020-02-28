import React, { Component, Fragment } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, RefreshControl, ToastAndroid, NetInfo, KeyboardAvoidingView, Dimensions, ScrollView } from 'react-native';
import Overlay from 'react-native-modal-overlay';
import CommonView from '../components/CommonView';
let CONNECTION_STATUS = false;
class EmergencyCard extends Component {
    state = {
        modalVisible: true, refreshing: true
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) {
            ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.LONG, ToastAndroid.CENTER); return;
        }
        this.emergencyPopup();
        this.setState({
            refreshing: false
        });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
    onClose = () => this.setState({ modalVisible: false, refreshing: false }, function () {
        this.props.navigation.navigate('Dashboard');
    });
    hideModel = () => this.setState({ modalVisible: false, refreshing: false }, function () {
        this.props.navigation.navigate('EmergencyCardData');
    });
    emergencyPopup = () => {
        return (
            // <View style={{height:'100%',position:'fixed', top:50,bottom:50}}> 
            <Overlay visible={this.state.modalVisible} onClose={this.onClose} closeOnTouchOutside={true}
                animationType="zoomIn" containerStyle={{ backgroundColor: '#7373736b' }}
                childrenWrapperStyle={{ backgroundColor: '#eee' }}
                animationDuration={500}>
                {
                    // (hideModal, overlayState) => (
                    <Fragment style={{ flex: 1, alignItems: 'center', justifyContent: 'center', elevation: 5 }}>
                        <View style={{ flexDirection: 'column', alignItems: "center", justifyContent: "center" }}>
                            <View style={{ marginTop: 0, marginBottom: 20 }}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>Terms & Conditions </Text></View>
                            <Text style={{ color: 'gray', fontSize: 13 }}>I hereby agree to all the terms and conditions mentioned below.. I take whole responsibility for providing access to my emergency profile for user(s)/person(s) having access to the mentioned URL and access code. I understand that “Healthtek Solutions” won’t in any manner be held responsible for unauthorized access/use of data. I am fully aware that the access code can be changed at any time by logging into application</Text>
                            <View style={{ flexDirection: "column", justifyContent: 'center', alignItems: "center" }}>
                                {/* <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() =>{this.setState({modalVisible:false,function(){this.props.navigation.navigate('EmergencyCardData')}}) }}> */}
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.hideModel()}>
                                    <View>
                                        <Text style={{ color: 'white', fontSize: 11 }}>I Accept</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {/* onPress={hideModal} */}
                        </View>
                    </Fragment>
                    // )
                }
            </Overlay>
            // </View>
        );
    }
    render() {
        return (
            // <CommonView EmergencyCard={true}>
            <ScrollView keyboardShouldPersistTaps='always'
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.emergencyPopup}
                    />
                }>
                <KeyboardAvoidingView behavior="padding" enabled>
                    {this.emergencyPopup()}
                </KeyboardAvoidingView>
            </ScrollView>
            // </CommonView>
        );
        // return( <CommonView1 isBackRequired={true} customHeading={'Emergency Card'} IsMenuVisible={true} IsFooterVisible = {true}  isSearchVisible ={false}>
        //            <ScrollView keyboardShouldPersistTaps='always'
        //         refreshControl={
        //             <RefreshControl
        //                 refreshing={this.state.refreshing}
        //                 onRefresh={this.emergencyPopup}
        //             />
        //         }>
        //         <KeyboardAvoidingView behavior="padding" enabled>
        //             {this.emergencyPopup()}
        //         </KeyboardAvoidingView>
        //     </ScrollView>
        //   </CommonView1>);
    }
}
const styles = StyleSheet.create({
    cusButtonLargeGreen1: {
        backgroundColor: '#3aa6cd',
        alignItems: 'center',
        // padding:9,
        marginTop: 10,
        paddingBottom: 6,
        paddingTop: 6,
        paddingLeft: 9,
        paddingRight: 9,
        justifyContent: 'center',
        fontSize: 15,
        color: 'white',
        width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        // position: 'absolute',
        // top: 40,
        flexDirection: 'row'
    },
    cusButtonLargeGreen2: {
        backgroundColor: '#3aa6cd',
        alignItems: 'center',
        marginBottom: 6,
        marginTop: 10,
        justifyContent: 'center',
        fontSize: 15,
        // padding:13,
        paddingBottom: 6,
        paddingTop: 6,
        paddingLeft: 9,
        paddingRight: 9,
        color: 'white',
        width: (Dimensions.get('window').width / 2) - 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3aa6cd',
        elevation: 5,
        fontWeight: 'bold',
        // position: 'absolute',
        // top: 40,
        flexDirection: 'row'
    }
});

export default EmergencyCard;