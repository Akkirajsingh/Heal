class utility {

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
  const Utility = new utility();
  export default Utility;
