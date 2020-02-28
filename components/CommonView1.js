import React, { Component } from 'react';
import { Image, StyleSheet, Text, AsyncStorage, View, ImageBackground, Dimensions, StatusBar, TextInput } from 'react-native';
import { Entypo, Ionicons, Feather, MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import SideBarMenu from "../components/SideBarMenu";
import PropTypes from 'prop-types';
// import CommonFooter from "../components/CommonFooter";
import { withNavigation } from 'react-navigation';
import Drawer from 'react-native-drawer';
export default class CommonView1 extends Component {
    static propTypes = {
        containerStyle: PropTypes.style,
        style: PropTypes.style,
        IsMenuVisible: PropTypes.bool,
        isSearchVisible: PropTypes.bool,
        IsHeaderVisible: PropTypes.bool,
        IsFooterVisible: PropTypes.bool,
        isBackRequired: PropTypes.bool,
        customHeading: PropTypes.string,
    }
    constructor(props) {
        super(props);
        this.state = { msgCount: 0, loadingMsg: 'Preparing Dashboard...', targetPageName: '', gender: '', height: '', weight: '', dob: '', login_text: 'Login Securely', showMenu: false, isLoading: true, otpDialogVisible: false, showSearch: false }
    }
    async componentDidMount() {
        // var messageCount = await AsyncStorage.getItem('UNREAD_MESSAGE');
        // if (messageCount) {
        //     this.setState({
        //         msgCount: messageCount
        //     })
        // }

    };
    searchLocal = (key) => {
        this.setState({
            filterStat: 'All'
        });
        if (key.length >= 1) {
            var sortedData = [];
            for (var i = 0; i < this.state.originalData.length; i++) {
                var searchKey = key.toLowerCase();
                var targetKey = this.state.originalData[i].allergyName.toLowerCase();
                if (targetKey.indexOf(searchKey) > -1) {
                    sortedData.push(this.state.originalData[i]);
                }
            }
            this.setState({
                allergyResp: sortedData
            })
        } else if (key.length == 0) {
            this.setState({
                allergyResp: this.state.originalData
            })
        }
    };

    render() {
        const { goBack } = this.props.navigation;

        return (<Drawer
            open={this.state.showMenu}
            content={<SideBarMenu />}
            type="overlay"
            openDrawerOffset={0.3}
            closedDrawerOffset={0}
            tapToClose={true}
            onClose={() => this.closeDrawer()}
            styles={drawerStyles}
            tweenHandler={(ratio) => ({
                main: { opacity: (2 - ratio) / 2 }
            })}
            side={'right'}
            elevation={4}
        >
            <View style={{ flex: 1 }}>
                <ImageBackground source={require('../assets/images/bg.jpg')}
                    style={styles.backgroundImage}>
                    <View style={{ backgroundColor: '#40739e', paddingBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: !this.props.isDashboard ? 'space-between' : 'center', padding: 10 }}>
                            {this.props.isBackRequired || this.props.isBackRequired == undefined ?
                                <Ionicons onPress={() => goBack()}
                                    style={{
                                        fontSize: 30,
                                        textAlign: 'center',
                                        color: 'white'
                                    }}
                                    name='ios-arrow-back' />
                                :
                                null
                            }
                            {this.props.customHeading.length > 0 ?
                                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                    <Text style={styles.textTopField}>
                                        {this.props.customHeading}
                                    </Text>
                                </View>
                                :
                                null
                            }
                            {this.props.IsMenuVisible || this.props.IsMenuVisible == undefined ?

                                <Feather onPress={() => this.toggleDrawer()} style={{
                                    fontSize: 30,
                                    textAlign: 'center',
                                    color: 'white',
                                    position: 'absolute',
                                    top: 10,
                                    right: 10
                                }} name='align-left' />

                                :
                                null
                            }
                        </View>
                        {this.props.isSearchVisible ?
                            <View style={{
                                backgroundColor: "#40739e",
                                width: Dimensions.get("window").width,
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: 'row'
                            }}>
                                <View>
                                    <TextInput
                                        style={{
                                            fontSize: 14,
                                            paddingHorizontal: 5,
                                            backgroundColor: "white",
                                            borderRadius: 7,
                                            width: Dimensions.get("window").width - 100
                                        }}
                                        value={this.state.search}
                                        placeholder={"Search..."}
                                        placeholderTextColor="gray"
                                    // onChangeText={(searchText) => this.searchLocal(searchText)}
                                    // onClear={() => this.searchLocal("")}
                                    />
                                    <Feather style={{ color: 'gray', fontWeight: 'bold', position: 'absolute', right: 15, top: 5 }} size={15} name='search' />
                                </View>
                                <MaterialCommunityIcons style={{ color: 'white', marginLeft: 10 }} size={20} name='filter-variant' />
                            </View>
                            :
                            null
                        }

                    </View>
                    {this.props.children}
                    {this.props.IsFooterVisible ?
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 5, paddingRight: 5, borderTopWidth: 1, borderTopColor: '#E7EAEE', bottom: 0, paddingTop: 10, paddingBottom: 10, backgroundColor: 'white' }}>
                            <View style={styles.bottomMenu}>
                                <FontAwesome style={{ color: 'gray' }} size={20} name='bullhorn' />
                                <Text style={{ color: '#747C7E', fontSize: 8 }}>Campaigns</Text>

                            </View>
                            <View style={styles.bottomMenu}>
                                <Ionicons style={{ color: 'gray' }} size={20} name='md-alarm' />
                                <Text style={{ color: '#747C7E', fontSize: 8 }}>Reminders</Text>
                            </View>
                            <View style={styles.bottomMenu}>
                                <MaterialIcons style={{ color: 'gray' }} size={20} name='receipt' />
                                <Text style={{ color: '#747C7E', fontSize: 8 }} >Bills</Text>
                            </View>
                            <View style={styles.bottomMenu}>
                                <FontAwesome style={{ color: 'gray' }} size={20} name='wpforms' />
                                <Text style={{ color: '#747C7E', fontSize: 8 }}>Forms</Text>
                            </View>
                        </View>
                        : null}
                    {/* {<CommonFooter messageCount={this.state.msgCount} />} */}
                </ImageBackground>
            </View>
        </Drawer>);
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
    }
    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    }
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    textTopField: {
        maxWidth: "100%",
        fontSize: 19,
        alignItems: 'center',
        justifyContent: 'center',
        color: "white"
    },
    CircleShapeView: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        backgroundColor: '#f3f6fb',
    },
    bottomMenu: {
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
        width: (Dimensions.get("window").width / 4) - 20
    }
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },

};
// export default withNavigation(CommonView1)
