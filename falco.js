const Promise = require("bluebird");
const db = require("./setup/db-setup");
const log = require("./setup/log-setup");
const cronjob = require("cron").CronJob;
const falcoCore = require("./falco-core");

const users = db.collection("users");
const snapshots = db.collection("snapshots");

const freqInMin = 5;

(async () => {
    log.info("Starting Falco");

    printInitLog();

    log.info(`Scheduling cron job to every ${freqInMin} minutes`);

    var job = new cronjob({
        cronTime: '1 */'+freqInMin+' * * * *',
        onTick: function() {
            mainRoutine()
        },
        start: false,
        timeZone: 'America/Santiago'
      });
    job.start()

    falcoCore.processSnapshots(snapshots)

})().catch((err) => console.error(err));

//Main
var mainRoutine = Promise.coroutine(function* () {
  log.info("Main Routine starting");
  falcoCore.processSnapshots(snapshots);
  return true;
});


async function printInitLog() {
    let u = await users.find({active: true})
    let s = await snapshots.find({active: true})
    console.log("===================================================");
    console.log("Users:");
    console.log("===================================================");

    u.forEach(user => {
        console.log("       "+user.name);
    });

    console.log("===================================================");
    console.log("Snapshots");
    console.log("===================================================");

    s.forEach(snapshot => {
        console.log("       "+snapshot.name);
    });

    console.log("===================================================");
    console.log("Initiating process");
    console.log("===================================================");
}

