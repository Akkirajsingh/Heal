/* eslint-disable max-len */
import React, { Component } from 'react';
import { TextInput, ScrollView, StyleSheet, Text, KeyboardAvoidingView, View, AlertIOS, Platform, ToastAndroid, ActivityIndicator, NetInfo, Dimensions, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Dropdown } from 'react-native-material-dropdown';
import CommonView from '../components/CommonView';
import { url } from '../constants/APIUrl';
import aPIStatusInfo from '../components/ErrorHandler';

const data = [{ value: '--Select--', code: '0' }, { value: 'WebMD', code: '1' }, { value: 'Medline', code: '2' }, { value: 'eMedicine', code: '3' }];
let CONNECTION_STATUS = false;
class PatientEducation extends Component {
    constructor(props) {
        super(props);
        this.state = { UserRecordResp: [], isLoading: false, patientedu: '', patienteduVal: '' };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({ patienteduVal: '' });
            }
        );
    }
    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            CONNECTION_STATUS = connectionInfo.type != 'none';
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
        if (!CONNECTION_STATUS) { ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER); return; }
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { CONNECTION_STATUS = isConnected; });
    }
/*********************************Validating Firlds *****************************************************************/
    validate() {
        //include your validation inside if condition
        if (this.state.patientedu == '' || this.state.patienteduVal == '') {
            if (Platform.OS !== 'ios') {
            ToastAndroid.show('Please fill the required field', ToastAndroid.SHORT);
        } else {
            AlertIOS.alert('Please fill the required field');
          }
            // navigate to next screen
        } else { this.props.navigation.navigate('PatientEduSearch', { education: this.state.patientedu, eduVal: this.state.patienteduVal });
        }
    }
    render() {
        return (
            <CommonView PatientEducation = {true}>
                <ScrollView keyboardShouldPersistTaps='always'>
                    <KeyboardAvoidingView behavior="padding" enabled>
                        <View
                            style={{ flex: 1 }}
                        >
                            <View style={{ flexDirection: 'column', padding: 13 }}>
                                <Dropdown
                                    baseColor='#000'
                                    label='Patient Resource'
                                    data={data}
                                    labelHeight={12}
                                    labelFontSize={17}
                                    fontSize={16}
                                    paddingLeft={4}
                                    textColor='#746E70'
                                    selectedItemColor='#746E70'
                                    onChangeText={(val, index) => this.setState({ patientedu: index })}
                                    value={this.state.patientedu}
                                    containerStyle={{ width: '100%' }}
                                />
                                <View style={{ flexDirection: 'column', paddingTop: 10 }}>
                                    <Text style={{ color: '#000', fontSize: 17 }}>Search:</Text>
                                    <View style={{}}>
                                        <TextInput
                                            style={{
                                                fontSize: 16,
                                                paddingHorizontal: 5,
                                                borderRadius: 7,
                                                borderBottomColor: '#746E70',
                                                borderBottomWidth: 0.8,
                                                width: Dimensions.get('window').width - 18
                                            }}
                                            value={this.state.patienteduVal}
                                            placeholder={'Search...'}
                                            placeholderTextColor="gray"
                                            onChangeText={(patienteduVal) => this.setState({ patienteduVal })}
                                        />
                                        <Feather style={{ color: 'gray', fontWeight: 'bold', position: 'absolute', right: 25, top: 5 }} size={15} name='search' />
                                    </View>
                                </View>
                            </View>
                            <View style={{ margin: 18, alignItems: 'center', justifyContent: 'center' }} >
                                <TouchableOpacity style={styles.cusButtonLargeGreen1} onPress={() => this.validate()}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.isSending ? <ActivityIndicator style={{ paddingRight: 5 }} /> : undefined}
                                        <Text
                                            style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}
                                        >
                                            Search
                                </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </CommonView>
        );
    }
}
const styles = StyleSheet.create({
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
        flexDirection: 'row',
        width: (Dimensions.get('window').width / 3)
    },
});

export default PatientEducation;
