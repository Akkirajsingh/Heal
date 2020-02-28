import React, { Component } from 'react';
import { View, Image, Text, WebView } from 'react-native';
import CommonView from '../components/CommonView';

let educationDropDownValue = '';
let educationTextValue = '';
let url = '';
class PatientEduSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { url: '', loadingMsg: 'Loading Data...', isLoading: true };
    const { params } = this.props.navigation.state;
     educationDropDownValue = params.education;
     educationTextValue = params.eduVal;
     if (educationDropDownValue == 1) {
      url = `https://www.webmd.com/search/search_results/default.aspx?query=${educationTextValue}&sourceType=undefined`;
    }
    if (educationDropDownValue == 2) {
      url = `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&query=${educationTextValue}&x=12&y=15`;
    }
    if (educationDropDownValue == 3) {
      url = `http://search.medscape.com/reference-search?newSearchHeader=1&queryText=${educationTextValue}`;
    }
  }
 
ActivityIndicatorLoadingView() {
   //making a view to show to while loading the webpage
   return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <Image source={require('../assets/images/loader.gif')} style={{ width: 80, height: 80 }} />
    <Text style={{ color: 'gray' }}>Loading....</Text>
  </View>
   );
}
  render() {
      return (
        <CommonView PatientEducationSearch={true}>
          <WebView
            source={{ uri: url }}
            style={{ marginTop: 20 }}
            renderLoading={this.ActivityIndicatorLoadingView}
            startInLoadingState
          />
        </CommonView>

      );
    // }
  }
}
export default PatientEduSearch;
