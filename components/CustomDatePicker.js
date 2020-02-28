import React, { Component } from 'react';
import DatePicker from 'react-native-datepicker';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

export default class CustomDatePicker extends Component {
  /*Declaring  Properties and their types that will be passed from refering component if not passed it will take default value defined in render method  */
     static propTypes = {
    style: PropTypes.style,
    placeholder: PropTypes.string,
    onDateChange: PropTypes.func,
    cancelBtnText: PropTypes.string,
    confirmBtnText: PropTypes.string,
    format: PropTypes.string,
    mode: PropTypes.string,
    date: PropTypes.string,
  }
  render() {
    return(<DatePicker
                  style={[styles.controlStyle, this.props.style ]}
                  date={this.props.date}
                  mode={this.props.mode== null ?"date":this.props.mode}
                  placeholder={this.props.placeholder==null?"select date":this.props.placeholder}
                  format={this.props.format==null?"DD-MMM-YYYY":this.props.format}
                  maxDate={this.props.maxDate==null?new Date():this.props.maxDate}
                  confirmBtnText={this.props.confirmBtnText==null?"Confirm":this.props.confirmBtnText}
                  cancelBtnText={this.props.cancelBtnText==null?"Cancel":this.props.cancelBtnText}
                  customStyles={{
                    dateIcon: {
                      right: 0,
                      top: 0,
                      marginLeft: 0,
                      height: 0,
                      opacity: 0,
                      width: 0
                    },
                    dateInput: {
                      left: 0,
                      borderWidth: 0,
                      color: '#8d9393',
                      backgroundColor: 'transparent',
                      width: '100%',
                      padding: 1,
                      fontSize:12,
                      height: 30,
                    },
                    dateText: {
                      color: 'gray',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize:12,
                    }
                  }}
                  onDateChange={this.props.onDateChange}
                />);
  }
}

const styles = StyleSheet.create({
  controlStyle: {
 width: '80%', backgroundColor: 'transparent'
  }
});