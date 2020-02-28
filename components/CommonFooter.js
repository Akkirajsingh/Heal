import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { Component } from 'react';
import Drawer from 'react-native-drawer';
import { withNavigation } from 'react-navigation';
import SideBarMenu from "../components/SideBarMenu";
import { FontAwesome, Entypo, MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';

class CommonFooter extends Component {
    render() {
        const { navigate } = this.props.navigation;
        if (!this.props.Signup) {
            return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 5, paddingRight: 5, borderTopWidth: 1, borderTopColor: '#E7EAEE', bottom: 0, paddingTop: 10, paddingBottom: 10, backgroundColor: 'white' }}>
                    <TouchableOpacity onPress={() => navigate('Dashboard')}>
                        <View style={styles.bottomMenu}>
                            <AntDesign style={{ color: 'gray' }} size={22} name='home' />
                            <Text style={{ color: '#747C7E', fontSize: 10, fontWeight:'bold' }}>Home</Text> 
                        </View>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => navigate('PatientEducation')}>
                        <View style={styles.bottomMenu}>

                            <MaterialCommunityIcons style={{ color: 'gray', paddingLeft: 7 }} size={22} name='library-books' />
                            <Text style={{ color: '#747C7E', fontSize: 10, fontWeight:'bold' }}>Education</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('CampaignList')}>
                    <View style={styles.bottomMenu}>
                        <FontAwesome style={{ color: 'gray' }} size={22} name='bullhorn' />
                        <Text style={{ color: '#747C7E', fontSize: 10, fontWeight:'bold' }}>Campaigns</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('Reminder')}>
                    <View style={styles.bottomMenu}>
                        <Ionicons style={{ color: 'gray' }} size={22} name='md-alarm' />
                        <Text style={{ color: '#747C7E', fontSize: 10, fontWeight:'bold' }}>Set Reminders</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('MessageView')}>
                    <View style={styles.bottomMenu}>
                        <FontAwesome style={{ color: 'gray' }} size={22} name='envelope-o' />
                        <Text style={{ color: '#747C7E', fontSize: 10, fontWeight:'bold' }} >Messages</Text>
                    </View>
                    </TouchableOpacity >
                </View>
            );
        } else { <View></View> }
    }

}
const styles = StyleSheet.create({
    bottomMenu: {
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
        width: (Dimensions.get("window").width / 4) - 20
    }
});
export default withNavigation(CommonFooter);