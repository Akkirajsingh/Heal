// const handleResponse = (response) => {

//     return response.json()
//       .then((json) => {
//         if (!response.ok) {
//           const error = Object.assign({}, json, {
//             status: response.status,
//             statusText: response.statusText,
//           });

//           return Promise.reject(error);
//         }
//         return json;
//       });
//   }
//   const LogError = (err) => {

//     if (false === err instanceof Error && err.type && err.type === 'unparsable') {
//         this.props.dispatch(alert(err.body))
//         return;
//       }
//      // throw err;
//   }
//   export default {handleResponse,LogError
//   };

class APIStatusInfo {
  async  handleResponse(response) {
            if (!response.ok) {
                const error = Object.assign({
                    status: response.status,
                    data: response,
                    APISuccess: 1
                });
                return await Promise.reject(error);

            }
        return response;
       
    }

    GetStatusMessage = (statusCode, takeAPIStatus = false) => {
        let errMsg = "";
        if (statusCode == "400") {
            errMsg = "Network Issue/For security purposes, your account has been locked";
        }
        else if (statusCode == "401") {
            errMsg = "Not authorized to view this content / Token Expired";
        }
        else if (statusCode == "404") {
            errMsg = "the server could not find the content requested";
        }
        else if (statusCode == "403") {
            errMsg = 'Looks like User does not exist 0r You have entered Incorrect Email/Password';
        }
        else if (statusCode == "500") {
            errMsg = "Server error has occured, Please Try again!";
        }
        else if (statusCode == "409" && !takeAPIStatus) {
            errMsg = "something went wrong,email/Password already Exists";
        }
        else if (!takeAPIStatus){
            errMsg = "Service is down, Please try again after some time ";
        }
        return errMsg;
    }
    logError = (err, takeAPIStatus = false) => {

        if (err.hasOwnProperty("APISuccess")) {


            return this.GetStatusMessage(err.status.toString(), takeAPIStatus);

        }
        else return "";
    }
    IsNullOrEmpty(value) {
        if (value == null ||
            value == undefined ||
            value.length == 0) {
            return true;
        } else {
            return false;
        }
    }

}
const aPIStatusInfo = new APIStatusInfo();
export default aPIStatusInfo

