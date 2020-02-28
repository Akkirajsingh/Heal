state = {
  username: '',
  password: '',
  auth_token: ''
}
Signup = async () => {
  fetch('https://auth.clustername+.hasura-app.io/v1/signup', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "provider": "username",
      "data": {
        "username": this.state.username,
        "password": this.state.password
      }
    })
  })
  .then((response) => response.json())
  .then((res) => {
    if(typeof(res.message) != "undefined"){
      Alert.alert("Error signing up", "Error: "+ res.message);
    }
    else{
      this.setState({ auth_token: res.auth_token });
      Alert.alert("Success", "You have succesfully signed up");
    }
  })
  .catch((error) => {
    console.error(error);
  });
}
Login = async () => {
  fetch('https://auth.clustername.hasura-app.io/v1/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    "provider": "username",
    "data": {
    "username": this.state.username,
    "password": this.state.password
    }
    })
  })
  .then((response) => response.json())
  .then((res) => {
    if(typeof(res.message) != "undefined"){
      Alert.alert("Error", "Error: "+ res.message);
    }
    else{
      this.setState({ auth_token: res.auth_token });
      Alert.alert("Welcome", " You have succesfully logged in");
    }
  })
  .catch((error) => {
    console.error(error);
  });
}