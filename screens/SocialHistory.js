/* eslint-disable global-require */
import React, { Component } from 'react';
import {
    TextInput,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    AsyncStorage,
    View,
    Dimensions, RefreshControl, ToastAndroid, NetInfo, Platform, AlertIOS
} from 'react-native';
import Moment from 'moment';
import Utility from '../components/Utility';
import { SOCIAL_HISTORY, HOSP_SOCIAL_HISTORY } from '../constants/APIUrl';
import { SOCIALHISTORY_UPDATE_SUCCESS_MSG, SOCIALHISTORY_MANDATORY_MSG } from '../constants/Messages';
import aPIStatusInfo from '../components/ErrorHandler';
import { Dropdown } from 'react-native-material-dropdown';
import AccessRecord from '../components/AccessRecord';
import CommonView from '../components/CommonView';
import RadioForm from 'react-native-simple-radio-button';
let SOCIAL_HISTORY_URL = SOCIAL_HISTORY;
const COMMON_ERROR = '';
let CONNECTION_STATUS = false;
let radio_alcoholUse = [
    { label: 'Yes', value: 'Yes', index: 0 }, { label: 'No', value: 'No', index: 1 }
];
let radio_smoke = [
    { label: 'Yes', value: 'Yes', index: 0 }, { label: 'No', value: 'No', index: 1 }, { label: 'Unknown', value: 'Unknown', index: 2 }
];
let radio_exercise = [
    { label: 'Yes', value: 'Yes', index: 0 }, { label: 'No', value: 'No', index: 1 }
];

class SocialHistory extends Component {
    constructor(props) {
        super(props);
        this.state = { filterStat: 'All', filterData: '', lifeStyle: {}, lifeStyleId: '', socialHist: [], originalData: [], showSearch: false, isLoading: true, socialResp: [], lifeStyleResp: [], lifeStyle: null, showMenu: false, refreshing: false, searchText: '', userid: '', value: '', SocialSupportValue: [] };
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                SOCIAL_HISTORY_URL = SOCIAL_HISTORY;
                let USER_DATA = await AsyncStorage.getItem('USER_DATA');
                USER_DATA = Utility.IsNullOrEmpty(USER_DATA) ? '' : JSON.parse(USER_DATA);
                if (USER_DATA.hasOwnProperty('Hospital') && USER_DATA.Hospital.AppointmentLogin == false) {
                    USER_DATA = USER_DATA.Hospital;
                    SOCIAL_HISTORY_URL = USER_DATA.ServiceURL + HOSP_SOCIAL_HISTORY;
                }
                const access_type = await AsyncStorage.getItem('ACCESS_TYPE');
                console.log("access_type", access_type)
                if (access_type != null) {
                    const ACCESS_TYPE = JSON.parse(access_type);
                    if (ACCESS_TYPE.hasOwnProperty('accessTypeSelected')) {
                        this.setState({
                            value: USER_DATA.ACCESS_TOKEN,
                            userid: ACCESS_TYPE.patientId
                        }, function () {
                            this.getSocialHistory();
                        });
                    }
                } else {
                    this.setState({
                        userid: USER_DATA.User_Id,
                        value: USER_DATA.ACCESS_TOKEN,
                    }, function () {
                        this.getSocialHistory();
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
    setRadioExercise() {
        console.log("setRadioexerc", this.state.lifeStyle.exercise);
        if (!Utility.IsNullOrEmpty(this.state.lifeStyle) && !Utility.IsNullOrEmpty(this.state.lifeStyle.exercise)) {
            console.log("exercise1", this.state.lifeStyle.exercise);
            var exercise = this.state.lifeStyle.exercise;
            console.log("exercise", exercise)
            var tobacco = radio_exercise.filter(function (item) { return item.value == exercise });
            if (tobacco.length > 0) return tobacco[0].index;
            else return 1;
        } else return 1;
    }
    setRadioTobacco() {
        if (!Utility.IsNullOrEmpty(this.state.lifeStyle) && !Utility.IsNullOrEmpty(this.state.lifeStyle.tobaccoUse)) {
            var tobaccoUse = this.state.lifeStyle.tobaccoUse;
            var tobacco = radio_smoke.filter(function (item) { return item.value == tobaccoUse });
            if (tobacco.length > 0) return tobacco[0].index;
            else return 1;
        } else return 1;

    }
    setRadioAlcohol() {
        console.log("setRadioAlcohol", this.state.lifeStyle);

        if (!Utility.IsNullOrEmpty(this.state.lifeStyle) && !Utility.IsNullOrEmpty(this.state.lifeStyle.alcoholUse)) {
            var alcohol = this.state.lifeStyle.alcoholUse;
            console.log("setRadioAlcohol", this.state.lifeStyle);
            var tobacco = radio_alcoholUse.filter(function (item) { return item.value == alcohol });
            console.log("tobacco", tobacco)
            if (tobacco.length > 0) return tobacco[0].index;
            else return 1;
        } else return 1;

    }
    /****************************************************** Get Social History **************************************************/
    getSocialHistory = () => {
        fetch(`${SOCIAL_HISTORY_URL}?patientId=${this.state.userid}&pageNumber=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: `Bearer ${this.state.value}`,
            },

        }).then(aPIStatusInfo.handleResponse)
            .then((response) => response.json()).then((response) => {
                const SocialSupportValue = [];
                const SocialData = response.responseData.socialSupport;
                console.log("SocialData", SocialData);
                if (SocialData != null && SocialData.length > 0) {
                    for (let k = 0; k < SocialData.length; k++) {
                        const dropdown = SocialData[k].optionalAnswers.filter((item) => item.isSelected == true);
                        if (dropdown.length > 0) {
                            SocialSupportValue.push({ id: dropdown[0].questionId, answerId: dropdown[0].id });
                        }
                        else {
                            SocialSupportValue.push({ id: 0, answerId: 0 });
                        }
                    }
                }
                this.setState({
                    isLoading: false,
                    socialResp: response.responseData.socialSupport,
                    originalData: response.responseData.socialSupport,
                    lifeStyle: response.responseData.lifeStyle !== null ? response.responseData.lifeStyle : '',
                    SocialSupportValue
                }
                    , function () {
                        this.setValue(response.responseData.socialSupport);
                    }
                );
            }).catch(err => {
                console.log(err)
                const errMSg = '';// aPIStatusInfo.logError(err);
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg.length > 0 ? errMSg : COMMON_ERROR,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    AlertIOS.alert(errMSg.length > 0 ? errMSg : COMMON_ERROR);
                }
                this.setState({ refreshing: false });
                return;
            });
    }
    /*************************************Update Immunization *********************************************************/
    validateSocialSupport(SocialSupportValue) {
        let socialItemNotSelected = SocialSupportValue.filter(function (item) {
            return item.answerId == 0;
        });
        return socialItemNotSelected.length > 0 ? false : true;
    }
    updateSocialHistory = () => {

        const SocialHistory = {
            LifeStyle: {
                id: this.state.lifeStyle.id,
                alcoholUse: this.state.lifeStyle.alcoholUse,
                tobaccoUse: this.state.lifeStyle.tobaccoUse,
                exercise: this.state.lifeStyle.exercise,
                packsPerWeek: this.state.lifeStyle.packsPerWeek,
                tobaccoHabit: this.state.lifeStyle.tobaccoHabit,
                bmi: this.state.lifeStyle.bmi
            },
            SocialSupport: this.state.SocialSupportValue,
            patientId: this.state.userid
        };
        console.log(" this.state.lifeStyle.alcoholUse", this.state.lifeStyle.alcoholUse);
        if (!this.validateSocialSupport(SocialHistory.SocialSupport)) {
            let msg = SOCIALHISTORY_MANDATORY_MSG;
            if (Platform.OS !== 'ios') {
                ToastAndroid.show(msg, ToastAndroid.SHORT);
            } else {
                AlertIOS.alert(msg);
            }
            return false;
        }
        console.log("SOCIAL_HISTORY_URL", SocialHistory)
        fetch(SOCIAL_HISTORY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.state.value}`,
            },
            body: JSON.stringify(SocialHistory)
        }).then(aPIStatusInfo.handleResponse).then((response) => response.json()).then((res) => {
            if (res.statusCode == 200) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.show(SOCIALHISTORY_UPDATE_SUCCESS_MSG, ToastAndroid.SHORT);
                } else {
                    AlertIOS.alert(SOCIALHISTORY_UPDATE_SUCCESS_MSG);
                }
                this.setState({
                    isLoading: false,
                });
            }
        })
            .catch(err => {
                this.setState({
                    isLoggingIn: false,
                });
                const errMSg = '';
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

    getDropdownData = (data) => {
        const DropdownItems = [];
        for (let i = 0; i < data.length; i++) { DropdownItems.push({ label: data[i].answer, value: data[i].id, questionId: data[i].questionId, answerId: data[i].id }); }
        return DropdownItems;
    }

    SocialHistoryData = (val, index, data, loopIndex) => {
        this.setState(() => {
            const SocialSupport = Object.assign({}, this.state.SocialSupportValue);
            SocialSupport[loopIndex].answerId = val;
            SocialSupport[loopIndex].id = data[index].questionId;
            return { SocialSupport };
        });
    };
    setValue = (socialHistData) => {
        this.setState({
            socialHist: socialHistData.optionalAnswers
        });
    }
    AccessChange = async (val) => {
        if (val != null) {
            const value = JSON.parse(val);
            if (value.hasOwnProperty('accessTypeSelected')) {
                this.setState({
                    userid: value.patientId
                }, function () {
                    this.getSocialHistory();
                });
            }
        }
    }
    setLifestyle(key, value) {
        console.log(key, value)
        let lifestyle = this.state.lifeStyle;
        lifestyle[key] = value;
        this.setState({ lifeStyle: lifestyle });
    }
    render() {
        Moment.locale('en');
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
                    <Text>Loading Social History....</Text>
                </View>
            );
        }
        return (
            <CommonView SocialHistory>
                <View style={{ flex: 1 }}>
                    <AccessRecord onAccessChange={this.AccessChange.bind(this)} />
                    <ScrollView
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always'
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.getSocialHistory}
                            />
                        }
                    >
                        <View style={{ flex: 1 }}>
                            <View style={styles.socialHis}>
                                <Text style={styles.lifeStyle}>Life Style</Text>
                            </View>
                            {(this.state.lifeStyle != null) ?
                                <View key={this.state.lifeStyle.id} style={{}}>
                                    <View style={styles.card}>
                                        <View style={styles.socialHisHeading}>
                                            <View style={styles.socialHisHeading1}>
                                                <Text style={styles.lifeStyleQues}>1. Do you drink alcohol beverages?</Text>
                                            </View>
                                            <View style={styles.radiobtncss}>
                                                <RadioForm
                                                    radio_props={radio_alcoholUse}
                                                    initial={this.setRadioAlcohol()}
                                                    formHorizontal={true}
                                                    buttonSize={10}
                                                    buttonOuterSize={20}
                                                    selectedButtonColor={'#41b4af'}
                                                    selectedLabelColor={'#41b4af'}
                                                    labelStyle={styles.labelStyle}
                                                    onPress={(value, index, data) => this.setLifestyle("alcoholUse", value)}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.socialHisHeading}>
                                            <View style={styles.socialHisHeading1}>
                                                <Text style={styles.lifeStyleQues}>2. Do you smoke or have you smoked in your lifetime?</Text>
                                            </View>
                                            <View style={styles.radiobtncss}>
                                                <RadioForm
                                                    radio_props={radio_smoke}
                                                    initial={this.setRadioTobacco()}
                                                    formHorizontal={true}
                                                    buttonSize={10}
                                                    buttonOuterSize={20}
                                                    selectedButtonColor={'#41b4af'}
                                                    selectedLabelColor={'#41b4af'}
                                                    labelStyle={styles.labelStyle}
                                                    onPress={(value, index, data) => this.setLifestyle("tobaccoUse", value)}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.socialHisHeading}>
                                            <View style={styles.socialHisHeading1}>
                                                <Text style={styles.lifeStyleQues}>3. Please describe your smoking habit.</Text>
                                            </View>

                                            <View style={styles.lifeStylecss}>
                                                <TextInput
                                                    style={styles.inputField}
                                                    // placeholder={' Tobacco Habit?'}
                                                    placeholderTextColor="#746E6E"
                                                    value={this.state.lifeStyle.tobaccoHabit}
                                                    onChangeText={(tobaccoHabit) => this.setLifestyle("tobaccoHabit", tobaccoHabit)}
                                                />
                                            </View></View>
                                        <View style={styles.socialHisHeading}>
                                            <View style={styles.socialHisHeading1}>
                                                <Text style={styles.lifeStyleQues}>4. Do you exercise?</Text>
                                            </View>

                                            <View style={styles.radiobtncss}>
                                                <RadioForm
                                                    radio_props={radio_alcoholUse}
                                                    initial={this.setRadioExercise()}
                                                    formHorizontal={true}
                                                    buttonSize={10}
                                                    buttonOuterSize={20}
                                                    selectedButtonColor={'#41b4af'}
                                                    selectedLabelColor={'#41b4af'}
                                                    labelStyle={styles.labelStyle}
                                                    onPress={(value, index, data) => this.setLifestyle("exercise", value)}
                                                />
                                            </View></View>
                                        <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                                            <Text style={styles.lifeStyleQues}>5. How many times per week?</Text>
                                            <TextInput
                                                style={styles.inputField}
                                                keyboardType={'numeric'}
                                                placeholderTextColor="#746E6E"
                                                // value={this.state.lifeStyle.packsPerWeek.toString()}
                                                value={this.state.lifeStyle.packsPerWeek}
                                                onChangeText={(packsPerWeek) => this.setLifestyle("packsPerWeek", packsPerWeek)}
                                            />
                                        </View>
                                        <View style={styles.socialHisHeading}>
                                            <View style={styles.socialHisHeading1}>
                                                <Text style={styles.lifeStyleQues}>6.Body Mass Index</Text>
                                            </View>
                                            <View style={styles.lifeStylecss}>
                                                <TextInput
                                                    style={styles.inputField}
                                                    keyboardType={'numeric'}
                                                    placeholderTextColor="#746E6E"
                                                    value={this.state.lifeStyle.bmi}
                                                    onChangeText={(bmi) => this.setLifestyle("bmi", bmi)}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'center', backgroundColor: '#f3f6fb' }} />
                                    </View>
                                </View>
                                : <Text />}
                            <View style={styles.socialSupportHeading}>
                                <Text style={styles.lifeStyle}>Social Support</Text>
                            </View>
                            <View style={{ paddingTop: 10 }} />
                            {this.state.socialResp.map((data, loopIndex) => (
                                <View key={data.id} style={{ marginRight: 5, flex: 1 }}>
                                    <View style={styles.card1} >
                                        <View style={{ flexDirection: 'column', justifyContent: 'flex-start', flex: 1 }}>
                                            <Text style={styles.socialSupportQues}>{data.question}</Text>
                                            <Dropdown
                                                baseColor="#000"
                                                // label={data.question}
                                                data={this.getDropdownData(data.optionalAnswers)}
                                                textColor='#8d9393'
                                                labelHeight={5}
                                                fontSize={14}
                                                selectedItemColor='#41b4af'
                                                onChangeText={(val, index, data) => this.SocialHistoryData(val, index, data, loopIndex)}
                                                value={((this.state.SocialSupportValue != null && this.state.SocialSupportValue.length > 0 && this.state.SocialSupportValue[loopIndex].answerId != 0) ? this.state.SocialSupportValue[loopIndex].answerId : 'Select Any one')}

                                            />
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingLeft: 15, paddingRight: 15 }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={styles.updatebtn}>
                            <View style={{ width: '20%' }} />
                            <View style={{ width: '60%' }}>
                                <TouchableOpacity onPress={() => { this.updateSocialHistory(); }} style={styles.updateSocialHistory}>
                                    <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>Add Social History</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '20%' }} />
                        </View>
                    </ScrollView>

                </View>
            </CommonView>
        );
    }
}

const styles = StyleSheet.create({
    inputField: {
        width: '100%',
        color: '#746E6E',
        borderWidth: 0,
        borderBottomColor: '#746E6E',
        borderBottomWidth: 0.3,
        paddingTop: 2,
        paddingLeft: 9,
        paddingBottom: 6,
        fontSize: 12,
    },
    updateSocialHistory:{
        marginBottom: 40, marginTop: 15, padding: 10, borderRadius: 20, backgroundColor: '#8dd5ee'
    },
    socialHisHeading: {
        flexDirection: 'column', justifyContent: 'space-between'
    },
    socialHisHeading1: {
        flexDirection: 'row', justifyContent: 'flex-start'
    },
    socialSupportQues: {
        fontSize: 15
    },
    lifeStylecss: {
        flexDirection: 'row', justifyContent: 'flex-start'
    },
    radiobtncss: {
        flexDirection: 'row', justifyContent: 'flex-start', paddingTop: 10, paddingBottom: 10, paddingLeft: 15
    },
    socialHis: {
        backgroundColor: '#f3f6fb', elevation: 1, paddingTop: 3, paddingBottom: 3
    },
    socialSupportHeading: {
        backgroundColor: '#f3f6fb', elevation: 1, paddingTop: 3, paddingBottom: 3
    },
    lifeStyle: {
        color: '#8b9393', padding: 8, fontWeight: 'bold', fontSize: 17
    },
    lifeStyleQues: {
        color: '#000', fontSize: 15, paddingTop: 0, marginTop: 0
    },
    card: {
        width: (Dimensions.get('window').width) - 10,
        paddingTop: 4,
        paddingBottom: 3,
        paddingLeft: 6,
        paddingRight: 6,
        marginBottom: 15,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderBottomColor: '#746E6E',
        borderBottomWidth: 0.3,
    },
    card1: {
        width: (Dimensions.get('window').width) - 20,
        paddingTop: 4,
        paddingBottom: 3,
        paddingLeft: 6,
        paddingRight: 6,
        marginBottom: 15,
        marginLeft: 10,
        flexDirection: 'column',
        flexWrap: 'wrap',
    },
    labelStyle: {
        fontSize: 12, paddingRight: 20, marginTop: -3
    },
    updatebtn: {
        flexDirection: 'row', paddingRight: 5, paddingLeft: 5
    }
});

export default SocialHistory;