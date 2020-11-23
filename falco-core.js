const falcoStatic = require("./falco-static-scraper");
const falcoDynamic = require("./falco-dynamic-scraper");
const utils = require("./falco-utils");
const log = require("./setup/log-setup");
const email = require("./setup/email-setup");
const db = require("./setup/db-setup");
const users = db.collection("users");

module.exports = {
  async processSnapshots(snapshots, config) {

    let allSnapshots = await snapshots.find({active: true});

    allSnapshots.forEach(utils.delayLoop(  async (snapshot) => {
    
      console.log(`Processing ${snapshot.name}`);

      let start = process.hrtime();
      let data;
      if (snapshot.dynamic) {
        data = await falcoDynamic.scrape(snapshot.url, snapshot.query);
      } else {
        data = await falcoStatic.scrape(snapshot.url, snapshot.query);
      }

      if(data != null) {
        let checkDataResult = checkChanges(snapshot, data);
        if(checkDataResult.diffData.length > 0){
            commitData(snapshots, snapshot, checkDataResult);
        }
      }

      utils.elapsedTime(start);

    }, config.time_between));
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
        if (keyword.length > 0 && element.title.toLowerCase().indexOf(keyword.toLowerCase()) != -1) 
          element.keywords.push(keyword);
      });

      return element.keywords.length != 0;
    });
  } 

  //Apply exclude filter
  if (snapshot.exclude != null && snapshot.exclude.length > 0) {
    newData = newData.filter((element) => {

      snapshot.exclude.forEach((excludeWord) => {
        if (excludeWord.length > 0 && element.title.toLowerCase().indexOf(excludeWord.toLowerCase())  != -1) 
          return false;
      });

      return true;
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

  console.log(`${snapshot.name} =>  StoredData: ${snapshot.data.length} NewData: ${newData.length} Difference: ${diffData.length}`);

  return {
      diffData: diffData,
      data: data,
  }
};

commitData = async function(snapshots, snapshot, checkDataResult) {
  log.info(`Commiting data change for ${snapshot.name} ${snapshot._id}`)
  snapshot.data = checkDataResult.data;
  snapshot.last_update = new Date();
  snapshots.update({ _id: snapshot._id }, snapshot);
    
  let snapshotUsers = await users.find({snapshots_ids: ""+snapshot._id});
  

  snapshot.diffData = checkDataResult.diffData;

  snapshotUsers.forEach(user => {
    email.sendEmail(user ,snapshot);
  });
}