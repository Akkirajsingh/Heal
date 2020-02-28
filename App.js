import React, { Component } from 'react';
import { createDrawerNavigator } from "react-navigation";
import { createStackNavigator } from 'react-navigation';
import SideBar from './src/SideBar/SideBar.js';
import Layout from './screens/Layout';
import Login from './screens/Login';
import Register1 from './screens/Register1';
import RegisterOTP from './screens/RegisterOTP';
import AddAccount from './screens/AddAccount';
import AccountUpdate from './screens/AccountUpdate';
import SecurePage from './screens/SecurePage';
import ForgotPassword1 from './screens/ForgotPassword1';
import VerifyQuestions from './screens/VerifyQuestions';
import OtpPage from './screens/OtpPage';
import Dashboard from './screens/Dashboard';
import Hospital from './screens/Hospital';
import Medication from './screens/Medication';
import AddMedication from './screens/AddMedication';
import MedicationDetails from './screens/MedicationDetails';
import Allergy from './screens/Allergy';
import AllergyDetails from './screens/AllergyDetails';
import HospitalRegister from './screens/HospitalRegister';
import FamilyHistory from './screens/FamilyHistory';
import FamilyHistoryDetails from './screens/FamilyHistoryDetails';
import Problems from './screens/Problems';
import { View, StyleSheet } from 'react-native';
import SocialHistory from "./screens/SocialHistory";
import AddProblem from "./screens/AddProblem";
import HospitalDashboard from "./screens/HospitalDashboard";
import Appointments from "./screens/Appointments";
import AddAppointment from "./screens/AddAppointment";
import AddAllergy from "./screens/AddAllergy";
import BillList from "./screens/BillList";
import CampaignList from "./screens/CampaignList";
import ProblemDetails from './screens/ProblemDetails';
import ClinicalDocuments from './screens/ClinicalDocuments';
import Immunization from './screens/Immunization';
import DischargeDetails from './screens/DischargeDetails';
import VisitDetails from './screens/VisitDetails';
import AppointmentsStatic from './screens/AppointmentsStatic';
import ResetPassword from './screens/ResetPassword';
import GeneralInfoData from './screens/GeneralInfoData';
import RecordAccess from './screens/RecordAccess';
import AddUser from './screens/AddUser';
import ClinicalInfo from './screens/ClinicalInfo';
import UpdateRecordUser from './screens/UpdateRecordUser';
import PatientEduSearch from './screens/PatientEduSearch';
import VitalsHistory from './screens/VitalsHistory';
import PatientEducation from './screens/PatientEducation';
import EmergencyCard from './screens/EmergencyCard';
import EmergencyCardData from './screens/EmergencyCardData';
import MessageView from './screens/MessageView';
import MessageDetails from './screens/MessageDetails';
import VisitsDetailsData from './screens/VisitsDetailsData';
import DischargeDetailsData from './screens/DischargeDetailsData';
import AddVisit from './screens/AddVisit';
import AddDischargeDetails from './screens/AddDischargeDetails';
import AddFamilyHistory from './screens/AddFamilyHistory';
import AddImmunization from './screens/AddImmunization';
import ImmunizationDetails from './screens/ImmunizationDetails';
import AddReminder from './screens/AddReminder';
import Reminder from './screens/Reminder';
import AddReminders from './screens/AddReminders';
import TestAndProcedures from './screens/TestAndProcedures';
import CriticalCare from './screens/CriticalCare';
import HosAppointments from './screens/HosAppointments';
import TestProcedureDetails from './screens/TestProcedureDetails';
import AddTestAndProcedure from './screens/AddTestAndProcedure';
import ChangePassword from './screens/ChangePassword';
import AddClinicalDocs from './screens/AddClinicalDocs';
import Prescriptions from './screens/Prescriptions';
import UpdatePrescription from './screens/UpdatePrescription';
import ComposeMessage from './screens/ComposeMessage';
import MedicationReminder from './screens/MedicationReminder';
import AppointmentsByProblem from './screens/AppointmentsByProblem';
import AppointmentsByAllergy from './screens/AppointmentsByAllergy';
import BillDetails from './screens/BillDetails';
import AppointmentReminder from './screens/AppointmentReminder';
import AppointmentDetails from './screens/AppointmentDetails';   
import AddPrescription from './screens/AddPrescription';   
import searchDoctors from './screens/searchDoctors';  
import HealthTracker from './screens/HealthTracker';  
import HealthTrackerListing from './screens/HealthTrackerListing';
import HealthTrackerDetailsData from './screens/HealthTrackerDetailsData';

console.disableYellowBox = true;

export const NavigationApp = createStackNavigator({

  Login: {
    screen: Login, navigationOptions: ({ navigation }) => ({
    }),
  },
  Layout: {
    screen: Layout, navigationOptions: ({ navigation }) => ({
    }),
  },
  Register1: {
    screen: Register1, navigationOptions: ({ navigation }) => ({
    }),
  },
  RegisterOTP: {
    screen: RegisterOTP, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddAccount: {
    screen: AddAccount, navigationOptions: ({ navigation }) => ({})
  },
  AccountUpdate: {
    screen: AccountUpdate, navigationOptions: ({ navigation }) => ({})
  },
  SecurePage: {
    screen: SecurePage, navigationOptions: ({ navigation }) => ({
    }),
  },
  ForgotPassword1: {
    screen: ForgotPassword1, navigationOptions: ({ navigation }) => ({
    }),
  },
  VerifyQuestions: {
    screen: VerifyQuestions, navigationOptions: ({ navigation }) => ({
    }),
  },
  OtpPage: {
    screen: OtpPage, navigationOptions: ({ navigation }) => ({
    }),
  },
  Dashboard: {
    screen: Dashboard, navigationOptions: ({ navigation }) => ({
    }),
  },
  Hospital: {
    screen: Hospital, navigationOptions: ({ navigation }) => ({
    }),
  },
  Medication: {
    screen: Medication, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddMedication: {
    screen: AddMedication, navigationOptions: ({ navigation }) => ({
    }),
  },
  Allergy: {
    screen: Allergy, navigationOptions: ({ navigation }) => ({
    }),
  },
  AllergyDetails: {
    screen: AllergyDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  MedicationDetails: {
    screen: MedicationDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  HospitalRegister: {
    screen: HospitalRegister, navigationOptions: ({ navigation }) => ({
    }),
  },
  FamilyHistory: {
    screen: FamilyHistory, navigationOptions: ({ navigation }) => ({
    }),
  },
  FamilyHistoryDetails: {
    screen: FamilyHistoryDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  Problems: {
    screen: Problems, navigationOptions: ({ navigation }) => ({
    }),
  },
  ProblemDetails: {
    screen: ProblemDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  SocialHistory: {
    screen: SocialHistory, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddProblem: {
    screen: AddProblem, navigationOptions: ({ navigation }) => ({
    }),
  },
  HospitalDashboard: {
    screen: HospitalDashboard, navigationOptions: ({ navigation }) => ({
    }),
  },
  Appointments: {
    screen: Appointments, navigationOptions: ({ navigation }) => ({
    }),
  },
  AppointmentsStatic: {
    screen: AppointmentsStatic, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddAppointment: {
    screen: AddAppointment, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddAllergy: {
    screen: AddAllergy, navigationOptions: ({ navigation }) => ({
    }),
  },
  BillList: {
    screen: BillList, navigationOptions: ({ navigation }) => ({
    }),
  },
  CampaignList: {
    screen: CampaignList, navigationOptions: ({ navigation }) => ({
    }),
  },
  DischargeDetails: {
    screen: DischargeDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  VisitDetails: {
    screen: VisitDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  ClinicalDocuments: {
    screen: ClinicalDocuments, navigationOptions: ({ navigation }) => ({
    }),
  },
  ResetPassword: {
    screen: ResetPassword, navigationOptions: ({ navigation }) => ({
    }),
  },
  GeneralInfoData: {
    screen: GeneralInfoData, navigationOptions: ({ navigation }) => ({
    }),
  },
  Immunization: {
    screen: Immunization, navigationOptions: ({ navigation }) => ({
    }),
  },
  RecordAccess: {
    screen: RecordAccess, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddUser: {
    screen: AddUser, navigationOptions: ({ navigation }) => ({
    }),
  },
  ClinicalInfo: {
    screen: ClinicalInfo, navigationOptions: ({ navigation }) => ({
    }),
  },
  UpdateRecordUser: {
    screen: UpdateRecordUser, navigationOptions: ({ navigation }) => ({
    }),
  },
  PatientEduSearch: {
    screen: PatientEduSearch, navigationOptions: ({ navigation }) => ({
    }),
  },
  VitalsHistory: {
    screen: VitalsHistory, navigationOptions: ({ navigation }) => ({
    }),
  },
  PatientEducation: {
    screen: PatientEducation, navigationOptions: ({ navigation }) => ({
    }),
  },
  EmergencyCard: {
    screen: EmergencyCard, navigationOptions: ({ navigation }) => ({
    }),
  },
  EmergencyCardData: {
    screen: EmergencyCardData, navigationOptions: ({ navigation }) => ({
    }),
  },
  MessageView: {
    screen: MessageView, navigationOptions: ({ navigation }) => ({
    }),
  },
  MessageDetails: {
    screen: MessageDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  VisitsDetailsData: {
    screen: VisitsDetailsData, navigationOptions: ({ navigation }) => ({
    }),
  },
  DischargeDetailsData: {
    screen: DischargeDetailsData, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddVisit: {
    screen: AddVisit, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddDischargeDetails: {
    screen: AddDischargeDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddFamilyHistory: {
    screen: AddFamilyHistory, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddImmunization: {
    screen: AddImmunization, navigationOptions: ({ navigation }) => ({
    }),
  },
  ImmunizationDetails: {
    screen: ImmunizationDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddReminder: {
    screen: AddReminder, navigationOptions: ({ navigation }) => ({
    }),
  },
  Reminder: {
    screen: Reminder, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddReminders: {
    screen: AddReminders, navigationOptions: ({ navigation }) => ({
    }),
  },
  TestAndProcedures: {
    screen: TestAndProcedures, navigationOptions: ({ navigation }) => ({
    }),
  },
  CriticalCare: {
    screen: CriticalCare, navigationOptions: ({ navigation }) => ({
    }),
  },
  HosAppointments: {
    screen: HosAppointments, navigationOptions: ({ navigation }) => ({
    }),
  },
  TestProcedureDetails: {
    screen: TestProcedureDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddTestAndProcedure: {
    screen: AddTestAndProcedure, navigationOptions: ({ navigation }) => ({
    }),
  },
  ChangePassword: {
    screen: ChangePassword, navigationOptions: ({ navigation }) => ({
    }),
  },
  Prescriptions: {
    screen: Prescriptions, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddClinicalDocs: {
    screen: AddClinicalDocs, navigationOptions: ({ navigation }) => ({
    }),
  },
  UpdatePrescription: {
    screen: UpdatePrescription, navigationOptions: ({ navigation }) => ({
    }),
  },
  ComposeMessage: {
    screen: ComposeMessage, navigationOptions: ({ navigation }) => ({
    }),
  },
  MedicationReminder: {
    screen: MedicationReminder, navigationOptions: ({ navigation }) => ({
    }),
  },
  AppointmentsByProblem: {
    screen: AppointmentsByProblem, navigationOptions: ({ navigation }) => ({
    }),
  },
  AppointmentsByAllergy: {
    screen: AppointmentsByAllergy, navigationOptions: ({ navigation }) => ({
    }),
  },
  BillDetails: {
    screen: BillDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  AppointmentReminder: {
    screen: AppointmentReminder, navigationOptions: ({ navigation }) => ({
    }),
  },
  AppointmentDetails: {   
    screen: AppointmentDetails, navigationOptions: ({ navigation }) => ({
    }),
  },
  AddPrescription: {
    screen: AddPrescription, navigationOptions: ({ navigation }) => ({    
    }),
  },
  searchDoctors: {
    screen: searchDoctors, navigationOptions: ({ navigation }) => ({   
    }),
  },
  HealthTracker: {  
    screen: HealthTracker, navigationOptions: ({ navigation }) => ({
    }),
  },
  HealthTrackerListing: {
    screen: HealthTrackerListing, navigationOptions: ({ navigation }) => ({
    }),
  },
  HealthTrackerDetailsData: {
    screen: HealthTrackerDetailsData, navigationOptions: ({ navigation }) => ({
    }),
  },
}, {
  navigationOptions: ({ navigation }) => ({
    headerStyle: {
      backgroundColor: 'rgba(0,0,0,0)',
    },
    headerTitleStyle: { color: 'white' },
    headerTintColor: '#41b4af',
    header: null,
  }),

});
class App extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <NavigationApp />
      </View>

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
});
export default App