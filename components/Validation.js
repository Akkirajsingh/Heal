
import Utility from '../components/Utility';
class validation {
    Validate = (mandatoryMsg, pattern, patternMsg, length, lengthMsg, obj) => {
        let mandatoryValMsg = "";
        let patternValMsg = "";
        let lengthValMsg = "";

        /* ---------------------------Empty validation------------------*/
        if (!Utility.IsNullOrEmpty(obj)) {
            mandatoryValMsg = this.mandatoryValidator(mandatoryMsg, obj)

        }
        if (!Utility.IsNullOrEmpty(mandatoryValMsg)) {
            return mandatoryValMsg;
        }

        /* ---------------------------Length validation------------------*/
        if (!Utility.IsNullOrEmpty(length)) {
            return lengthValMsg = this.lengthValidator(length, lengthMsg, obj)
        }
        if (!Utility.IsNullOrEmpty(lengthValMsg)) {
            return lengthValMsg;
        }

        /* ---------------------------Pattern validation------------------*/
        if (!Utility.IsNullOrEmpty(patternMsg)) {
            patternValMsg = this.patternValidator(pattern, patternMsg, obj);

        }
        if (!Utility.IsNullOrEmpty(patternValMsg)) {
            return patternValMsg;
        }
        return "";

    }
    lengthValidator = (length, LengthMsg, obj) => {
        let lengthValMsg = "";
        for (let i = 0; i < obj.length; i++) {
            if (!Utility.IsNullOrEmpty(obj[i]) && (obj[i].length < length[i])) {
                lengthValMsg += LengthMsg[i] + "\n";
            }
            return lengthValMsg;
        }
    }
    patternValidator = (pattern, patternMsg, obj) => {
        let patternValMsg = "";
        for (let i = 0; i < obj.length; i++) {
            if (!Utility.IsNullOrEmpty(obj[i]) && (pattern.test(obj[i]) == false)) {
                patternValMsg += (patternMsg[i]) + "\n";
            }
        }
        return patternValMsg;
    }


    mandatoryValidator = (mandatoryMsg, obj) => {

        let mandatoryValMsg = "";
        for (let i = 0; i < obj.length; i++) {
            if (Utility.IsNullOrEmpty(obj[i])) {
                console.log("mandatoryValidator", obj[i]);
                mandatoryValMsg += mandatoryMsg[i] + "\n";
            }
        }
        return mandatoryValMsg;
    }
}
const Validation = new validation();
export default Validation;
