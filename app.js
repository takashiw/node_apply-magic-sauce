var filesystem = require('fs');
var Client = require('node-rest-client').Client;
var responses = require('./responses.json');
var client = new Client();
// secrets format: { "customer_id": 1111, "api_key": "string", "token": "" }
var secrets = require('./secrets.json');
var trait = "BIG5";
var uid = 1111111111; //e.g. 4 is Mark Zuckerberg's unique Facebook ID
var interviewArray = responses.interviewresults;
var globalArray = [];

// var firebase = require("firebase");
// var config = {
//   apiKey: "AIzaSyCp8ng0eKmuuXdyLAt9FKZy68q67sEwwOM",
//   authDomain: "tobibot-4ef44.firebaseapp.com",
//   databaseURL: "https://tobibot-4ef44.firebaseio.com",
//   storageBucket: "tobibot-4ef44.appspot.com",
// };
// firebase.initializeApp(config);
//
// var database = firebase.database();
//
// // console.log(database.ref());
// function searchKeyValue(headnode,childname,findvalue) {
//   var ref = firebase.database().ref("data");
//   nextref=ref.child(headnode);
//   nextref.orderByChild(childname).equalTo(findvalue).on("value",function (snapshot) {
//     snapshot.forEach(function(childSnapshot) {
//       console.log(JSON.stringify(childSnapshot.val()));
//     });
//   })
// }


function getPrediction(value) {
    var args = {
        data: value.text,
        headers: {
            "X-Auth-Token": secrets.token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };
    client.post("https://api.applymagicsauce.com/text?traits=" + trait + "&source=WEBSITE",
        args,
        function(data, response) {
            // console.log(response.statusCode);
            if (response.statusCode == 403) {
                console.log("Authtoken expired, get new token!");
                getNewToken(getPrediction);
            } else if (response.statusCode == 204) {
                console.log("No prediction could be made based on like ids provided.");
            } else {
              // console.log(value);
                data["name"] = value.name;
                saveData(data, "prediction-dt-test");
            }
        });
}


function getNewToken(callback) {
    var getTokenArgs = {
        data: {
            "customer_id": secrets.customer_id,
            "api_key": secrets.api_key
        },
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };
    client.post("http://api-v2.applymagicsauce.com/auth", getTokenArgs, function(data, response) {
        console.log(data);
        secrets.token = data.token;
        callback();
        saveData(secrets, "secrets");
    });
}

function saveData(data, name) {
    var dataName = data.name;
    var exportArray = data.predictions;
    console.log(data);
    exportArray.forEach(function(value){
      value["name"] = dataName;
      globalArray.push(value);
    });

    filesystem.writeFile("../tobi/data/" + name + ".json", JSON.stringify(globalArray, null, 2));
    // filesystem.writeFile("./" + name + ".json", JSON.stringify(globalArray, null, 2));

}

interviewArray.forEach(function(value){
  getPrediction(value);
})
