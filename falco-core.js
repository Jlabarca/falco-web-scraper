const falcoStatic = require("./falco-static-scraper");
const utils = require("./falco-utils");
const log = require("./setup/log-setup");

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

        data = processData(snapshot, data)
        if(data != null){
            commitData(snapshots, snapshot, data);
        }
      }

      utils.elapsedTime(start, snapshot.name);
    });
  },
};

processData = function (snapshot, newData) {

  //Keywords  
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

  //Simple comparison, ordered json serialization string
  newData.sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0));
  console.log(newData.length + " - "+ snapshot.data.length);
  
  if(JSON.stringify(newData) != JSON.stringify(snapshot.data))
    return newData

    return null;
};

commitData = function(snapshots, snapshot, newData) {
  log.info("Commiting data change for "+snapshot.name)
  snapshot.data = newData;
  snapshot.last_update = new Date();
  snapshots.update({ _id: snapshot._id }, snapshot);
}
