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
    utils.timer("total");

    allSnapshots.forEach(utils.delayLoop( async (snapshot) => {  
      //TODO: check if any dynamic fb   
      if(allSnapshots[0] === snapshot)
        await falcoDynamic.fbBrowserInit(config.fb_login, config.fb_pass);

      log.info(` Processing ${snapshot.name} - ${snapshot.url}`);
      let start = process.hrtime();
      let data;
      if (snapshot.dynamic) {
        data = await falcoDynamic.scrape(snapshot.url, snapshot.query);
      } else {
        data = await falcoStatic.scrape(snapshot.url, snapshot.query);
      }

      snapshot.lastExecutionDuration = utils.elapsedTime(start)
      log.info(`${snapshot.name} time: ${snapshot.lastExecutionDuration}`);

      if(data != null) {
        let checkDataResult = checkChanges(snapshot, data);
        snapshot.last_check_date = new Date().toLocaleString();

        if(checkDataResult.diffData.length > 0){
            commitData(snapshots, snapshot, checkDataResult);
        }
      }
      

      if(allSnapshots[allSnapshots.length - 1] === snapshot)
        log.info(`Total: ${utils.timerEnd("total")} ms with ${config.time_between} ms pauses`);
      //await falcoDynamic.fbBrowserFinnish();

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
    log.info(`Exclude: ${snapshot.exclude}`)
    newData = newData.filter((element) => {
      let excluded = false;  

      snapshot.exclude.some((excludeWord) => {
        if (excludeWord.length > 0 && element.title.toLowerCase().indexOf(excludeWord.toLowerCase())  != -1) {
          excluded = true;
          return excluded;
        }
      });
      
      if(excluded)
        log.info(`Excluded ${element.title}`)  

      return !excluded;
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

  log.info(`${snapshot.name} =>  StoredData: ${snapshot.data.length} NewData: ${newData.length} Difference: ${diffData.length}`);

  return {
      diffData: diffData,
      data: data,
  }
};

commitData = async function(snapshots, snapshot, checkDataResult) {
  log.info(`Commiting data change for ${snapshot.name} ${snapshot._id}`)
  snapshot.data = checkDataResult.data;
  
  let snapshotUsers = await users.find({active: true, snapshots_ids: ""+snapshot._id});

  snapshot.last_update = {
    date: new Date().toLocaleString(),
    receivers: snapshotUsers.map(x => x.name),
    data: checkDataResult.diffData
  };

  snapshots.update({ _id: snapshot._id }, snapshot);
    
  snapshotUsers.forEach(user => {
    email.sendEmail(user ,snapshot);
  });
}