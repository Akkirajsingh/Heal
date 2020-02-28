import React, { Component } from 'react';
import DatePicker from 'react-native-datepicker';
import { StyleSheet, Dimensions, TextInput } from 'react-native';
import PropTypes from 'prop-types';

export default class CustomSearch extends Component {
    /*Declaring  Properties and their types that will be passed from refering component if not passed it will take default value defined in render method  */
    static propTypes = {
        // style: PropTypes.style,
        // placeholder: PropTypes.string,
        onChangeText: PropTypes.func,
        onClear: PropTypes.func,
        value: PropTypes.string,
    }
    render() {
        return (<TextInput
            style={{
                fontSize: 18,
                paddingHorizontal: 5,
                backgroundColor: "white",
                borderRadius: 7,
                width: Dimensions.get("window").width - 100
            }}
            value={this.props.value}
            placeholder={"Search..."}
            placeholderTextColor="gray"
            onChangeText={this.props.onChangeText}
            onClear={() => { this.props.onClear }}
        />);

    }
}

const styles = StyleSheet.create({
    controlStyle: {
        width: '80%', backgroundColor: 'transparent'
    }
});