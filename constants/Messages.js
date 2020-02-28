/** Login Screen **/
const VALIDATION_ERR = 'Email id and Password field is required';
const VALIDATION_EMAIL_ERR = 'Invalid Email';
const INTERNET_CONN_ERR = 'No Internet Connection';
const EMAIL_MISMATCH_ERR = 'Email id or password did not matched our records. Please try again.';
/******************/

/** SignUp Screen **/
const SIGNUP_MANDATORY_FIELD_ERR = 'All fields are mandatory...';
const PASS_MISMATCH_ERR = 'Password did not match';
const INVALID_EMAIL_ERR = 'Invalid Email';
const EMAILID_EXISTING_ERR = 'Email id/Phone No. already Exists, Please try with other.';
const EMAILID_OR_PASS_EXISTING_ERR = 'Email id/Contact Number already used';
const PASS_VALIDATION = 'Password Should contain at least 1 uppercase alphabetical character, at least 1 numeric character and must be eight characters or longer';
const INVALID_AADHAR = "Aadhar Card Number is not valid.";
/******************/

/** Register OTP Screen **/
const OTP_VALIDATION = 'OTP id field is required';
const OTP_MISMATCH_ERR = 'Please Enter Valid OTP';
const OTP_TYPO_ERR = 'OTP did not matched our records. Please try again.';
const REGISTER_SUCCESS_MSG = 'You Can Now login To PatientCare';
const OTP_LIMIT_EXCEED = 'OTP request limit exceeded!'
/******************/

/** Forgot Password**/
const FORGOT_PASS_EMAIL_ERR = 'Email id did not matched our records! Please try again';
const FORGOT_PASS_RESP_ERR = 'Something Went Wrong! Please Wait for sometimes';
const FORGOT_PASS_SUCCESS_RESP = 'Great", "OTP Sent to your EmailId';
const EMPTY_EMAIL_VALIDATION_ERR = 'Please Enter your EmailId'; 'Please Enter Your Password';
const EMAIL_VALIDATION_ERR = 'Invalid Email';
const USERNAME_VALIDATION_ERR = 'Please enter valid username';
/******************/

/** ResetPassword Screen**/
const EMAIL_TYPO_ERR = 'Invalid Email';
const PASS_TYPO_ERR = 'Please enter New Password';
const PASS_VALIDATION_ERR = 'Please Enter Valid Password';
const SERVER_ERR = 'Something Went Wrong! Please Try Again';
const PASS_UPDATED_SUCCESS_MSG = 'Password Updated Successfully! Please Login to Continue.';
/******************/

/** OTPPage Screen **/
const SECURITY_ANS_TYPO_ERR = 'Enter  the answer for  Security Question';
const SECURITY_ANS_MISMATCH_ERR = 'Security answer did not matched our records. Please try again.';
const SECURITY_ANS_SUCCESS_MSG = 'Security answer Verified Sucessfully! Please Reset your Password.';
const INVALID_EMAIL_TYPO_ERROR = 'Email did not matched our records. Please try again.';
const OTP_BLANK_ERR = 'OTP id field is required';
const OTP_INVALID_TYPO_ERR = 'Please Enter Valid OTP';
const INVALID_OTP_TYPO_ERR = 'OTP did not matched our records. Please try again.';
const OTP_VARIFIED_SUCCESS_MSG = 'OTP Verified Sucessfully! Please Change your Password.';
const INVALID_OTP_TYPO_ERR_MSG = 'Sorry, Invalid Email ID.';
const OTP_SENT_SUCCESS_MSG = 'OTP has been sent to your Mobile Number';
/******************/

/** Medication Screen **/
const MEDICATION_DATA_EMPTY_ERROR = 'No Data Available';
/***********************/

/** Add Problem Screen **/
const PROBLEM_ADDED_SUCCESS_MSG = 'Problem Added Successfully!';
/***********************/

/** Add User Screen **/
const USERS_VALIDATION_ERROR = 'All fields are mandatory...';
const USER_EMAIL_VALIDATION_ERROR = 'Invalid EmailId';
const USER_EXIST_ERROR = 'This user exist in your access list';
const USER_RECORD_INSERTED_SUCCESS_MSG = 'Record Inserted Successfully!';
/***********************/

/** Update Record User Screen **/
const UPDATE_USER_DATA_EMPTY_ERROR = 'No Data Available';
const UPDATE_USER_DATA_SUCCESS_MSG = 'Your Record has Updated Successfully !';
const DELETE_USER_DATA_SUCCESS_MSG = 'Users Record Deleted Successfully !';
/***********************/

/** Emergency Card Screen **/
const EMERGENCY_CARD_DATA_EMPTY_ERROR = 'No Data Available';
/***********************/

/** Get User Screen **/
const USER_RECORD_EMPTY_ERROR = 'No Data Available';
/***********************/

/** Allergy Details Screen **/
const DATA_UPDATED_SUCCESS_MSG = 'Your Data has Updated Successfully.';
const DATA_DELETED_SUCCESS_MSG = 'Data has Deleted Successfully.';
/***********************/

/** Add Allergy Screen **/
const ALLERGY_ADDED_SUCCESS_MSG = 'Allergy has Added Successfully';
/***********************/

/** Add Visits Screen **/
const VISITS_VALIDATION_ERR = 'You Have Missed Some Fields.';
const VISITS_ADDED_SUCCESS_MSG = 'You have Successfully Added Visit.';
/***********************/

/** Add Discharge Details Screen **/
const DISCHARGE_ADDED_SUCCESS_MSG = 'Discharge Details Added Successfully!';
/***********************/

/** Add Family History Screen **/
const FAMILY_HISTORY_ADDED_SUCCESS_MSG = 'Successfully Added Family History';
/***********************/

/** Add Health Tracker **/
const HEALTH_TRACKER_ADDED_SUCCESS_MSG = 'Data Inserted Successfully';
/***********************/

/** Update Health Tracker **/
const HEALTH_TRACKER_UPDATED_SUCCESS_MSG = 'Data Updated Successfully';
/***********************/

/** Data not Available **/
const DATA_NOT_AVAILABLE = 'No Data Available';
const INVALID_PIN = "Invalid PIN";
const PIN_MISMATCH = "PIN Mismatch";
/***********************/

/** GeneralInfo **/
const UPDATE_GENERAL_ERROR_MSG = 'Server is down! Please Try Again';
const UPDATE_GENERAL_SUCCESS_MSG = 'Your Record has Updated Successfully';
const PROFILE_LOAD_GENERAL_ERROR_MSG = 'Server is down! Please Try Again';

/** Add Immunization ****/
const IMMUNIZATION_ADDED_SUCCESS_MSG = 'Successfully Added Immunization!';

/** Family History Details ****/
const FAMILY_HISTORY_UPDATE_SUCCESS_MSG = 'Your Family History is successfully Updated';

/** Add Medication ****/
const ADDED_MEDICATION_SUCCESS_MSG = 'Medication Added Successfully!';

/** Add Reminder ****/
const REMINDER_SET_SUCCESS_MSG = 'Reminder Set Successfully!';

/** Add Test & Result ****/
const TEST_RESULT_ADDED_SUCCESS_MSG = 'Record Added Successfully!';
const UPDATE_TEST_PROCEDURE = 'Successfully Updated Test & Procedure!';

/** Clinical Documents ****/
const CLINICAL_DOCS_DELETE_SUCCESS_MSG = 'Your Data has Deleted Successfully!';
const CLINICAL_DOCS_UPDATE_SUCCESS_MSG = 'Your Data has Updated Successfully!';

/** Social History ****/
const SOCIALHISTORY_UPDATE_SUCCESS_MSG = 'Social History has Updated Successfully!';
const SOCIALHISTORY_MANDATORY_MSG = 'All Fields in Social Support section is mandatory';

/** Hospital****/
const HOSPITAL_ADDED_SUCCESS_MSG = 'Hospital Added Successfully!';
const HOSPITAL_DELETED_SUCCESS_MSG = 'Deleted Successfully!';

/** Reminder ****/
const REMINDER_DELETED_SUCCESS_MSG = 'Your Reminder Data has Deleted Successfully!';

/** Change Password ****/
const PASS_CHANGED_SUCCESS_MSG = 'Your Password has been changed successfully, Please Login Again!';
const PASS_INCORRECT_MSG = 'Password is incorrect.';
export {
    EMAIL_MISMATCH_ERR, FORGOT_PASS_EMAIL_ERR, FORGOT_PASS_RESP_ERR, FORGOT_PASS_SUCCESS_RESP, INVALID_EMAIL_ERR, EMAILID_OR_PASS_EXISTING_ERR, OTP_INVALID_TYPO_ERR, INVALID_OTP_TYPO_ERR, PASS_CHANGED_SUCCESS_MSG, PASS_INCORRECT_MSG, VISITS_VALIDATION_ERR, IMMUNIZATION_ADDED_SUCCESS_MSG, REMINDER_SET_SUCCESS_MSG, SOCIALHISTORY_UPDATE_SUCCESS_MSG, HOSPITAL_ADDED_SUCCESS_MSG,
    UPDATE_GENERAL_ERROR_MSG, UPDATE_GENERAL_SUCCESS_MSG, PROFILE_LOAD_GENERAL_ERROR_MSG, SIGNUP_MANDATORY_FIELD_ERR, PASS_MISMATCH_ERR, EMAILID_EXISTING_ERR, OTP_BLANK_ERR, OTP_VARIFIED_SUCCESS_MSG, DATA_NOT_AVAILABLE, INVALID_PIN, PIN_MISMATCH, DATA_UPDATED_SUCCESS_MSG, ALLERGY_ADDED_SUCCESS_MSG, ADDED_MEDICATION_SUCCESS_MSG, TEST_RESULT_ADDED_SUCCESS_MSG, REMINDER_DELETED_SUCCESS_MSG,
    VALIDATION_ERR, VALIDATION_EMAIL_ERR, INTERNET_CONN_ERR, OTP_VALIDATION, OTP_MISMATCH_ERR, OTP_TYPO_ERR, REGISTER_SUCCESS_MSG, OTP_LIMIT_EXCEED, EMPTY_EMAIL_VALIDATION_ERR, USERNAME_VALIDATION_ERR, INVALID_EMAIL_TYPO_ERROR, OTP_SENT_SUCCESS_MSG, DATA_DELETED_SUCCESS_MSG, VISITS_ADDED_SUCCESS_MSG, DISCHARGE_ADDED_SUCCESS_MSG, CLINICAL_DOCS_DELETE_SUCCESS_MSG, UPDATE_TEST_PROCEDURE, HOSPITAL_DELETED_SUCCESS_MSG,
    EMAIL_VALIDATION_ERR, EMAIL_TYPO_ERR, PASS_VALIDATION_ERR, SERVER_ERR, PASS_UPDATED_SUCCESS_MSG, SECURITY_ANS_TYPO_ERR, SECURITY_ANS_MISMATCH_ERR, SECURITY_ANS_SUCCESS_MSG, INVALID_OTP_TYPO_ERR_MSG, MEDICATION_DATA_EMPTY_ERROR, PASS_VALIDATION, INVALID_AADHAR, FAMILY_HISTORY_ADDED_SUCCESS_MSG, PROBLEM_ADDED_SUCCESS_MSG, CLINICAL_DOCS_UPDATE_SUCCESS_MSG, FAMILY_HISTORY_UPDATE_SUCCESS_MSG, PASS_TYPO_ERR,
    USERS_VALIDATION_ERROR, USER_EMAIL_VALIDATION_ERROR, USER_EXIST_ERROR, USER_RECORD_INSERTED_SUCCESS_MSG, USER_RECORD_EMPTY_ERROR, EMERGENCY_CARD_DATA_EMPTY_ERROR, UPDATE_USER_DATA_EMPTY_ERROR, UPDATE_USER_DATA_SUCCESS_MSG, DELETE_USER_DATA_SUCCESS_MSG, SOCIALHISTORY_MANDATORY_MSG, HEALTH_TRACKER_ADDED_SUCCESS_MSG, HEALTH_TRACKER_UPDATED_SUCCESS_MSG

};
