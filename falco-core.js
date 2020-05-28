const falcoStatic = require("./falco-static-scraper");
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const email = require("./setup/email-setup");
const db = require("./setup/db-setup");
const users = db.collection("users");

module.exports = {
  async processSnapshots(snapshots) {

    let allSnapshots = await snapshots.find({active: true});

    allSnapshots.forEach(async (snapshot) => {
      console.log("Processing " + snapshot.name);

      let start = process.hrtime();

      if (snapshot.dynamic) {
        console.log("dynamic not implemented yet");
      } else {
        let data = await falcoStatic.scrape(snapshot.url, snapshot.query);
        if(data != null) {
            let checkDataResult = checkChanges(snapshot, data);
            if(checkDataResult.diffData.length > 0){
                commitData(snapshots, snapshot, checkDataResult);
            }
        }
      }

      utils.elapsedTime(start, snapshot.name);
    });
  },
};

/*
  Compare incoming data with stored one
*/
checkChanges = function (snapshot, newData) {

  //Apply keywords filter
  if (snapshot.keywords != null && snapshot.keywords.length > 0) {
    newData = newData.filter((element) => {
      element.keywords = [];

      snapshot.keywords.forEach((keyword) => {
        if (element.title.includes(keyword)) 
          element.keywords.push(keyword);
      });

      return element.keywords.length != 0;
    });
  } 
  
  //Check if in newData contains something that snapshot.data not
  let diffData = [];
  newData.forEach(element => {
    if (!snapshot.data.some(e => e.title === element.title)) {
      diffData.push(element);
    }
  });

  let data = snapshot.data.concat(diffData);

  console.log("StoredData: "+  snapshot.data.length+" NewData: "+ newData.length+" Difference "+ diffData.length);

  return {
      diffData: diffData,
      data: data,
  }
};

commitData = async function(snapshots, snapshot, checkDataResult) {
  log.info("Commiting data change for "+snapshot.name)
  snapshot.data = checkDataResult.data;
  snapshot.last_update = new Date();
  snapshots.update({ _id: snapshot._id }, snapshot);
    
  let snapshotUsers = await users.find({});
  
  snapshotUsers.forEach(user => {
    email.sendEmail(user ,snapshot);
  });
}
