const BASE_URL = 'https://care.patientheal.com/PatientCareServices/api/';
const LOGIN_TOKEN = 'https://care.patientheal.com/PatientCareServices/';
const BASEM_URL = 'https://care.patientheal.com/PatientCareMServices/api/';

/***************************************Login ***********************************************************/
const LOGIN_TOKEN_URL = `${LOGIN_TOKEN}Token`;
const USER_PROFILE = `${BASE_URL}PatientSignUp/PatientProfileLoad`;

/*************************************Dashboard ***********************************************************/
const DASHBOARD = `${BASE_URL}PatientService/Dashboard`;

/************************************* GeneralInfoData ***********************************************************/
const GENERAL_PATIENT_INFO = `${BASE_URL}PatientSignUp/PatientProfileLoad`;
const GENERAL_PATIENT_INFO_UPDATE = `${BASE_URL}PatientSignUp/PatientProfileUpdate`;
const GET_STATE_DATA = `${BASE_URL}Form/GetState`;

/************************************************ Record Access ****************************************************/
const RECORD_ACCESS_LIST = `${BASE_URL}RecordAccessService/RecordAccessList`;

/*******************************************AddUser ****************************************************/
const GET_RELATIONSHIP = `${BASE_URL}RecordAccessService/GetRelationship`;
const INSERT_RECORD_ACCESS = `${BASE_URL}RecordAccessService/InsertRecordAccess`;

/*******************************************UpdateRecordUser ****************************************************/
const UPDATE_RECORD_ACCESS = `${BASE_URL}RecordAccessService/UpdateRecordAccess`;
const DELETE_RECORD_ACCESS = `${BASE_URL}RecordAccessService/DeleteRecordAccessUser`;
const GET_RECORD_ACCESS_USER_BY_ID = `${BASE_URL}RecordAccessService/GetRecordAccessUserbyid`;

/******************************************* EmergencyCardData****************************************************/
const EMERGENCY_CARD_DATA = `${BASE_URL}EmergencyProfileService//GenerateEmergencyCard`;

/***********************************************Medication *****************************************************/
const MEDICATION_LIST = `${BASE_URL}PatientHealthProfile/Medication`;

/***********************************************AddMedication *****************************************************/
const INSERT_MEDICATION = `${BASE_URL}PatientHealthProfile/Medication`;
const GET_VISIT = `${BASE_URL}PatientHealthProfile/GetVisit`;
const TREATMENT_CATEGORIES = `${BASE_URL}PatientHealthProfile/GetAllTeartmentCategories`;
const MEDICATION_METHODS = `${BASE_URL}MasterService/MedicationMethods`;
const MEDICATION_UNITS = `${BASE_URL}MasterService/medicationUnits`;

/***********************************************MedicationDetails *****************************************************/
const GET_MEDICATION_BY_ID = `${BASE_URL}PatientHealthProfile/GetMedicationById`;
const UPDATE_MEDICATION = `${BASE_URL}PatientHealthProfile/UpdateMedication`;
const DELETE_MEDICATION = `${BASE_URL}PatientHealthProfile/DeleteMedication`;

/***********************************************Allergy *****************************************************/
const ALLERGY_DATA = `${BASE_URL}PatientHealthProfile/Allergy`;

/***********************************************Allergy Details *****************************************************/
const DELETE_ALLERGY = `${BASE_URL}PatientHealthProfile/DeleteAllergy`;

/***********************************************Add Allergy *****************************************************/
const ADD_ALLERGY = `${BASE_URL}PatientHealthProfile/Allergy`;

/***********************************************Add Problem *****************************************************/
const ADD_PROBLEM = `${BASE_URL}PatientHealthProfile/Problem`;
const DELETE_PROBLEM = `${BASE_URL}PatientHealthProfile/DeleteProblem`;

/***********************************************Add Visits *****************************************************/
const ADD_ENCOUNTER = `${BASE_URL}PatientHealthProfile/Encounter`;
const VISIT_TYPES = `${BASE_URL}MasterService/VisitTypes`;

/***********************************************Add Discharge Details *****************************************************/
const ADD_DISCHARGE_DETAILS = `${BASE_URL}PatientHealthProfile/DischargeInstruction`;

/***********************************************Add Family History *****************************************************/
const RELATIONSHIP_DATA = `${BASE_URL}MasterService/Relationships`;
const FAMILY_HISTORY = `${BASE_URL}PatientHealthProfile/FamilyHistory`;
const DELETE_FAMILY_HISTORY = `${BASE_URL}PatientHealthProfile/DeleteFamilyHistory`;

/***********************************************Add Reminder*****************************************************/
const SET_REMINDER = `${BASE_URL}ReminderService/Reminder`;
const REMOVE_REMINDER = `${BASE_URL}ReminderService/RemoveReminder`;

/***********************************************Add Reminder(Immunization) *****************************************************/
const REMINDER_SERVICE = `${BASE_URL}ReminderService/ReminderTransaction`;

/***********************************************Immunization *****************************************************/
const IMMUNIZATION = `${BASE_URL}PatientHealthProfile/Immunization`;
const DELETE_IMMUNIZATION = `${BASE_URL}PatientHealthProfile/DeleteImmunization`;

/***********************************************Test Result *****************************************************/
const ADD_TEST_RESULT = `${BASE_URL}PatientHealthProfile/TestResult`;

/***********************************************Campaign List *****************************************************/
const CAMPAIGN_LIST = `${BASE_URL}CampaignService/CampaignList`;

/***********************************************Clinical Documents *****************************************************/
const CLINICAL_DOCUMENT = `${BASE_URL}PatientHealthProfile/ClinicalDocument`;
const DELETE_CLINICAL_DOC = `${BASE_URL}PatientHealthProfile/DeleteClinicalDocument`;

/***********************************************Discharge Details *****************************************************/
const DISCHARGE_DETAILS_LIST = `${BASE_URL}PatientHealthProfile/DischargeInstruction`;

/***********************************************Discharge Details Data*****************************************************/
const DISCHARGE_DETAILS_DELETE = `${BASE_URL}PatientHealthProfile/DeleteDischargeInstruction`;

/***********************************************Message View*****************************************************/
const MARK_READ_MSG = `${BASE_URL}CommunicationService/MarkMessageAsRead`;
const FOLDERS_MSGS_COUNT = `${BASE_URL}CommunicationService/GetFoldersMessagesCount`;
const FOLDER_MSGS = `${BASE_URL}CommunicationService/MessagesOfFolder`;
const MOVE_MSG = `${BASE_URL}CommunicationService/MoveMessage`;

/***********************************************Compose Message*****************************************************/
const COMPOSE_MSG = `${BASE_URL}CommunicationService/ComposeMessage`;
const GET_RECIPIENT_USERS = `${BASE_URL}CommunicationService/GetRecipientUsers`;

/***********************************************Register*****************************************************/
const SEQURITY_QUESTION = `${BASE_URL}MasterService/GetAllSecurityQuestions`;
const GENDER_LIST = `${BASE_URL}MasterService/AllGenderList`;
const PATIENTS_SIGNUP = `${BASE_URL}PatientSignUp/MobSignup`;

/***********************************************Forgot Password ***********R******************************************/
const FORGOT_PASSWORD = `${BASE_URL}PatientSignUp/ForgotPassword`;

/***********************************************RegisterOTP *****************************************************/
const MOBILE_OTP_API = `${BASE_URL}PatientSignUp/CheckMobileOTP`;
const RESEND_OTP_API = `${BASE_URL}PatientSignUp/ResendSignUpMobileOTP`
const SIGNUP_OTP = `${BASE_URL}PatientSignUp/OTP`;
const PATIENT_SIGNUP = `${BASE_URL}PatientSignUp/PatientAccount`;

/***********************************************OTPPage *****************************************************/
const VERIFY_QUESTIONS = `${BASE_URL}PatientSignUp/VerifyQuestions`;
const FORGOT_PASS_OTP = `${BASE_URL}PatientSignUp/ForgotPwdOTP`;
const FORGOT_PASS_MOBILE_OTP = `${BASE_URL}PatientSignUp/ForgotPwdMobOTP`;
const RESEND_OTP = `${BASE_URL}PatientSignUp/ResendOTP`;
const FORGOT_PASS_RESEND_OTP = `${BASE_URL}PatientSignUp/ResendForgotPWDMobileOTP`;
const GET_SECURITY_QUESTION = `${BASE_URL}PatientSignUp/GetSecurityQuestion`;
/***********************************************RegisterOTP *****************************************************/
const IS_USERNAME_EXISTS_API = `${BASE_URL}PatientSignUp/IsUserNameExist`;
const ADD_ACCOUNT_API = `${BASE_URL}PatientSignUp/PatientAccount`;
const UPDATE_ACCOUNT_API = `${BASE_URL}PatientSignUp/PatientAccountUpdate`;
const GET_PIN_API = `${BASE_URL}PatientSignUp/GetPin`;
const SET_PIN_API = `${BASE_URL}PatientSignUp/PatientCreatePin`;
const VERIFY_PIN_API = `${BASE_URL}PatientSignUp/VerifyPIN`;
const UPDATE_PIN_API = `${BASE_URL}PatientSignUp/PatientUpdatePin`;

/***********************************************Reset Password *****************************************************/
const RESET_PASSWORD = `${BASE_URL}PatientSignUp/ResetPassword`;

/***********************************************Vital History *****************************************************/
const VITAL_HISTORY = `${BASE_URL}VitalHistoryService/GetVitalHistoryDetails`;

/***********************************************Test & Procedure *****************************************************/
const GET_TEST_RESULT = `${BASE_URL}PatientHealthProfile/TestResult`;
const DELETE_TEST_RESULT = `${BASE_URL}PatientHealthProfile/DeleteTestResult`;

/***********************************************Visits Details Data *****************************************************/
const GET_VISITS_DATA = `${BASE_URL}PatientHealthProfile/Encounter`;
const DELETE_ENCOUNTER = `${BASE_URL}PatientHealthProfile/DeleteEncounter`;

/***********************************************Hospital *****************************************************/
const GET_ALL_HOSPITAL = `${BASE_URL}LocationService/GetAllLocations`;
const GET_MY_HOSPITAL = `${BASE_URL}LocationService/Locations`;
const ADD_MY_HOSPITAL = `${BASE_URL}LocationService/AddMyHospital`;
const DELETE_MY_HOSPITAL = `${BASE_URL}LocationService/DeleteMyHospital`;

/***********************************************Social History*****************************************************/
const SOCIAL_HISTORY = `${BASE_URL}PatientHealthProfile/SocialHistory`;

/***********************************************Change Password *****************************************************/
const CHANGEPASSWORD = `${BASE_URL}PatientSignUp/ChangePassword`;

/***********************************************Bill Pay *****************************************************/
const GET_BILL_DETAILS = `${BASE_URL}BillPayService/GetAllBillDetails`;

/***********************************************Prescription *****************************************************/
const GET_PRESCRIPTION_DETAILS = `${BASE_URL}PrescriptionService/GetAllPrescription`;

const GET_PRESCRIPTION = `${BASE_URL}PrescriptionService/GetPrescription`;

const CREATE_PRESCRIPTION = `${BASE_URL}PrescriptionService/UpdatePrescription`;
const DELETE_PRESCRIPTION = `${BASE_URL}PrescriptionService/DeletePrescriptionById`;
const GET_ALL_SPECIALITY = `${BASE_URL}Form/GetAllMasterSpeciality`;
const GET_ALL_PHYSICIAN = `${BASE_URL}Form/GetAllPhysician`;
/***********************************************GetAll AppointmentByAllergy *****************************************************/
const GETALL_ALLERGY_APPOINTMENT = `${BASE_URL}AppointmentService/GetAllAppointmentByAllergy`;

/***********************************************GetAll AppointmentByProblem *****************************************************/
const GETALL_PROBLEM_APPOINTMENT = `${BASE_URL}AppointmentService/GetAllAppointmentByProblem`;

/***********************************************GetAll Locations *****************************************************/
const GET_MYLOCATION_APPOINTMENT = `${BASE_URL}LocationService/GetMyLocationsForAppointment`;

/***********************************************GetAll HospitalURL(UN,PWD) *****************************************************/
const GET_HOSPITAL_URL = `${BASE_URL}LocationService/GetHospitalURLByPracticeId`;

/***********************************************Appointment Types *****************************************************/
const GET_APPOINTMENT_TYPES = `${BASE_URL}MasterService/GetAppointmentTypes`;

/***********************************************Appointment Types *****************************************************/
const SAVE_UN_PWD_HEAL = `${BASE_URL}LocationService/Saveusernamepswdtoheal`;   

/***********************************************Health Tracker *****************************************************/
const HEALTH_TRACKER_API = `${BASE_URL}VitalHistoryService/InsertVitalHistory`;

/***********************************************Health Tracker Listing *****************************************************/
const HEALTH_TRACKER_LIST_API = `${BASE_URL}VitalHistoryService/GetVitalHistoryList`;

/***********************************************Health Tracker Details *****************************************************/
const HEALTH_TRACKER_DETAILS_API = `${BASE_URL}VitalHistoryService/GetEditVitalHistoryById`;

/***********************************************Upload URL *****************************************************/
const UPLOAD_URL = 'https://care.patientheal.com/';

//*******************************************HOSPITAL URL ******************************************************************************/
/**************************************Medication *****************************************************************/
const HOSP_MEDICATION_LIST = 'api/PatientHealthProfile/Medication';
const HOSP_GET_MEDICATION_BY_ID = 'api/PatientHealthProfile/GetMedicationById';
const HOSP_GET_VISIT = 'api/PatientHealthProfile/GetVisit';
const HOSP_TREATMENT_CATEGORIES = 'api/PatientHealthProfile/GetAllTeartmentCategories';
const HOSP_MEDICATION_UNITS = 'api/MasterService/medicationUnits';
const HOSP_MEDICATION_METHODS = 'api/MasterService/MedicationMethods';
const HOSP_UPDATE_MEDICATION = 'api/PatientHealthProfile/UpdateMedication';
const HOSP_DELETE_MEDICATION = 'api/PatientHealthProfile/DeleteMedication';
const HOSP_INSERT_MEDICATION = 'api/PatientHealthProfile/Medication';

/*********************************Allergy *******************************************************************/
const HOSP_ALLERGY_DATA = 'api/PatientHealthProfile/Allergy';
const HOSP_DELETE_ALLERGY = 'api/PatientHealthProfile/DeleteAllergy';

/***********************************Problems *************************************************************************/
const HOSP_ADD_PROBLEM = 'api/PatientHealthProfile/Problem';
const HOSP_DELETE_PROBLEM = 'api/PatientHealthProfile/DeleteProblem';

/**************************************VISITS ********************************************************/
const HOSP_ADD_ENCOUNTER = 'api/PatientHealthProfile/Encounter';
const HOSP_VISIT_TYPES = 'api/MasterService/VisitTypes';
const HOSP_DELETE_ENCOUNTER = 'api/PatientHealthProfile/DeleteEncounter';

/***********************************************Discharge Details *****************************************************/
const HOSP_DISCHARGE_DETAILS_LIST = 'api/PatientHealthProfile/DischargeInstruction';
const HOSP_DISCHARGE_DETAILS_DELETE = 'api/PatientHealthProfile/DeleteDischargeInstruction';

/***********************************************Family History *****************************************************/
const HOSP_RELATIONSHIP_DATA = 'api/MasterService/Relationships';
const HOSP_FAMILY_HISTORY = 'api/PatientHealthProfile/FamilyHistory';
const HOSP_DELETE_FAMILY_HISTORY = 'api/PatientHealthProfile/DeleteFamilyHistory';

/***********************************************Social History*****************************************************/
const HOSP_SOCIAL_HISTORY = 'api/PatientHealthProfile/SocialHistory';


/***********************************************Immunization *****************************************************/
const HOSP_IMMUNIZATION = 'api/PatientHealthProfile/Immunization';
const HOSP_DELETE_IMMUNIZATION = 'api/PatientHealthProfile/DeleteImmunization';

/***********************************************Test Result *****************************************************/
const HOSP_ADD_TEST_RESULT = 'api/PatientHealthProfile/TestResult';
const HOSP_DELETE_TEST_RESULT = 'api/PatientHealthProfile/DeleteTestResult';

/***********************************************Clinical Documents *****************************************************/
const HOSP_CLINICAL_DOCUMENT = 'api/PatientHealthProfile/ClinicalDocument';
const HOSP_DELETE_CLINICAL_DOC = 'api/PatientHealthProfile/DeleteClinicalDocument';

/***********************************************Reminder*****************************************************/
const HOSP_REMINDER_SERVICE = 'api/ReminderService/ReminderTransaction';
const HOSP_SET_REMINDER = 'api/ReminderService/Reminder';
const HOSP_REMOVE_REMINDER = 'api/ReminderService/RemoveReminder';

/***********************************************Bill Pay *****************************************************/
const HOSP_GET_BILL_DETAILS = 'api/BillPayService/GetAllBillDetails';

/************************************* GeneralInfoData ***********************************************************/
const HOSP_GENERAL_PATIENT_INFO = 'api/PatientSignUp/PatientProfileLoad';
const HOSP_GENERAL_PATIENT_INFO_UPDATE = 'api/PatientSignUp/PatientProfileUpdate';
const HOSPGET_STATE_DATA = 'api/Form/GetState';

/******************************************* EmergencyCardData****************************************************/
const HOSP_EMERGENCY_CARD_DATA = 'api/EmergencyProfileService//GenerateEmergencyCard';

/*******************************************AddUser ****************************************************/
const HOSP_GET_RELATIONSHIP = 'api/RecordAccessService/GetRelationship';
const HOSP_INSERT_RECORD_ACCESS = 'api/RecordAccessService/InsertRecordAccess';
const HOSP_RECORD_ACCESS_LIST = 'api/RecordAccessService/RecordAccessList';
const HOSP_UPDATE_RECORD_ACCESS = 'api/RecordAccessService/UpdateRecordAccess';
const HOSP_DELETE_RECORD_ACCESS = 'api/RecordAccessService/DeleteRecordAccessUser';
const HOSP_GET_RECORD_ACCESS_USER_BY_ID = 'api/RecordAccessService/GetRecordAccessUserbyid';


/***********************************************Campaign List *****************************************************/
const HOSP_CAMPAIGN_LIST = 'api/CampaignService/CampaignList';

/***********************************************Prescription *****************************************************/
const HOSP_GET_PRESCRIPTION_DETAILS = 'api/PrescriptionService/GetAllPrescription';

/***********************************************Compose Message*****************************************************/
const HOSP_COMPOSE_MSG = 'api/CommunicationService/ComposeMessage';
const HOSP_GET_RECIPIENT_USERS = 'api/CommunicationService/GetRecipientUsers';

/***********************************************Vital History *****************************************************/
const HOSP_VITAL_HISTORY = 'api/VitalHistoryService/GetVitalHistoryDetails';

/***********************************************Message View*****************************************************/
const HOSP_MARK_READ_MSG = 'api/CommunicationService/MarkMessageAsRead';
const HOSP_FOLDERS_MSGS_COUNT = 'api/CommunicationService/GetFoldersMessagesCount';
const HOSP_FOLDER_MSGS = 'api/CommunicationService/MessagesOfFolder';
const HOSP_MOVE_MSG = 'api/CommunicationService/MoveMessage';

/*************************************Dashboard ***********************************************************/
const HOSP_DASHBOARD = 'api/PatientService/Dashboard'; 

/***********************************************GetAll AppointmentByAllergy *****************************************************/
const HOSP_GETALL_ALLERGY_APPOINTMENT = 'api/AppointmentService/GetAllAppointmentByAllergy';

/***********************************************GetAll AppointmentByAllergy *****************************************************/
const HOSP_GETALL_PROBLEM_APPOINTMENT = 'api/AppointmentService/GetAllAppointmentByProblem';

/***********************************************Health Tracker *****************************************************/
const HOSP_HEALTH_TRACKER_API = 'api/VitalHistoryService/InsertVitalHistory';

/***********************************************Health Tracker *****************************************************/
const HOSP_HEALTH_TRACKER_LIST_API = 'api/VitalHistoryService/GetVitalHistoryList';

/***********************************************Health Tracker Details *****************************************************/
const HOSP_HEALTH_TRACKER_DETAILS_API = 'api/VitalHistoryService/GetEditVitalHistoryById';

export {
    LOGIN_TOKEN, BASEM_URL, LOGIN_TOKEN_URL, USER_PROFILE, DASHBOARD, GENERAL_PATIENT_INFO, GENERAL_PATIENT_INFO_UPDATE, VISIT_TYPES, ADD_ALLERGY, FAMILY_HISTORY, DELETE_CLINICAL_DOC, SEQURITY_QUESTION, MOBILE_OTP_API, RESEND_OTP_API, VITAL_HISTORY, REMOVE_REMINDER, VERIFY_QUESTIONS, GET_ALL_HOSPITAL, FORGOT_PASSWORD,
    RECORD_ACCESS_LIST, MEDICATION_LIST, GET_RELATIONSHIP, INSERT_RECORD_ACCESS, UPDATE_RECORD_ACCESS, DELETE_RECORD_ACCESS, GET_STATE_DATA, RELATIONSHIP_DATA, SET_REMINDER, CLINICAL_DOCUMENT, GENDER_LIST, SIGNUP_OTP, GET_VISITS_DATA, SOCIAL_HISTORY, FORGOT_PASS_OTP, DELETE_IMMUNIZATION, DELETE_FAMILY_HISTORY, FORGOT_PASS_RESEND_OTP,
    EMERGENCY_CARD_DATA, INSERT_MEDICATION, GET_VISIT, TREATMENT_CATEGORIES, MEDICATION_METHODS, MEDICATION_UNITS, GET_MEDICATION_BY_ID, ADD_PROBLEM, REMINDER_SERVICE, DISCHARGE_DETAILS_LIST, PATIENTS_SIGNUP, PATIENT_SIGNUP, DELETE_ENCOUNTER, DELETE_PROBLEM, RESEND_OTP, GET_MY_HOSPITAL, DELETE_MY_HOSPITAL, GET_PRESCRIPTION_DETAILS, BASE_URL,
    UPDATE_MEDICATION, DELETE_MEDICATION, IMMUNIZATION, CHANGEPASSWORD, ALLERGY_DATA, DELETE_ALLERGY, ADD_ENCOUNTER, ADD_DISCHARGE_DETAILS, ADD_TEST_RESULT, CAMPAIGN_LIST, DISCHARGE_DETAILS_DELETE, RESET_PASSWORD, GET_TEST_RESULT, DELETE_TEST_RESULT, GET_SECURITY_QUESTION, IS_USERNAME_EXISTS_API, ADD_ACCOUNT_API, UPDATE_ACCOUNT_API, GET_PIN_API, SET_PIN_API, VERIFY_PIN_API, ADD_MY_HOSPITAL, GET_BILL_DETAILS, MARK_READ_MSG, FOLDERS_MSGS_COUNT, FOLDER_MSGS,
    COMPOSE_MSG, GET_RECIPIENT_USERS, MOVE_MSG, GETALL_ALLERGY_APPOINTMENT, HOSP_GETALL_ALLERGY_APPOINTMENT, GETALL_PROBLEM_APPOINTMENT, GET_MYLOCATION_APPOINTMENT, GET_HOSPITAL_URL, GET_APPOINTMENT_TYPES, SAVE_UN_PWD_HEAL, UPLOAD_URL, UPDATE_PIN_API, FORGOT_PASS_MOBILE_OTP, HEALTH_TRACKER_API, HEALTH_TRACKER_LIST_API, HEALTH_TRACKER_DETAILS_API, 

    HOSP_MEDICATION_LIST, HOSP_GET_MEDICATION_BY_ID, HOSP_GET_VISIT, HOSP_TREATMENT_CATEGORIES, HOSP_MEDICATION_UNITS, HOSP_MEDICATION_METHODS, HOSP_UPDATE_MEDICATION, HOSP_DELETE_MEDICATION, HOSP_INSERT_MEDICATION, HOSP_ALLERGY_DATA, HOSP_DELETE_ALLERGY, HOSP_ADD_PROBLEM, HOSP_DELETE_PROBLEM, HOSP_ADD_ENCOUNTER, HOSP_VISIT_TYPES, HOSP_HEALTH_TRACKER_DETAILS_API, 
    HOSP_DELETE_ENCOUNTER, HOSP_DISCHARGE_DETAILS_LIST, HOSP_DISCHARGE_DETAILS_DELETE, HOSP_RELATIONSHIP_DATA, HOSP_FAMILY_HISTORY, HOSP_DELETE_FAMILY_HISTORY, HOSP_SOCIAL_HISTORY, HOSP_IMMUNIZATION, HOSP_DELETE_IMMUNIZATION, HOSP_ADD_TEST_RESULT, HOSP_DELETE_TEST_RESULT, HOSP_CLINICAL_DOCUMENT, HOSP_DELETE_CLINICAL_DOC, HOSP_REMINDER_SERVICE,
    HOSP_SET_REMINDER, HOSP_REMOVE_REMINDER, HOSP_GET_BILL_DETAILS, HOSP_GENERAL_PATIENT_INFO_UPDATE, HOSP_GENERAL_PATIENT_INFO, HOSPGET_STATE_DATA, HOSP_EMERGENCY_CARD_DATA, HOSP_GET_RELATIONSHIP, HOSP_INSERT_RECORD_ACCESS, HOSP_RECORD_ACCESS_LIST, HOSP_UPDATE_RECORD_ACCESS, HOSP_DELETE_RECORD_ACCESS, GET_RECORD_ACCESS_USER_BY_ID, HOSP_CAMPAIGN_LIST, HOSP_GET_PRESCRIPTION_DETAILS,
    HOSP_COMPOSE_MSG, HOSP_GET_RECIPIENT_USERS, HOSP_VITAL_HISTORY, HOSP_MARK_READ_MSG, HOSP_FOLDERS_MSGS_COUNT, HOSP_FOLDER_MSGS, HOSP_MOVE_MSG, HOSP_DASHBOARD, HOSP_GETALL_PROBLEM_APPOINTMENT, GET_PRESCRIPTION, CREATE_PRESCRIPTION, GET_ALL_SPECIALITY, GET_ALL_PHYSICIAN, DELETE_PRESCRIPTION, HOSP_GET_RECORD_ACCESS_USER_BY_ID, HOSP_HEALTH_TRACKER_API, HOSP_HEALTH_TRACKER_LIST_API, 
};