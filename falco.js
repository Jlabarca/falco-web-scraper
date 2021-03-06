const Promise = require("bluebird");
const db = require("./setup/db-setup");
const log = require("./setup/log-setup");
const cronjob = require("cron").CronJob;
const falcoCore = require("./falco-core");

const users = db.collection("users");
const snapshots = db.collection("snapshots");
const configuration = db.collection("configuration");
const email = require("./setup/email-setup");

const freqInMin = 30;

(async () => {
    log.info("Starting Falco");
    
    let config = await getConfig();
    email.init(config);

    printInitLog();

    log.info(`Scheduling cron job to every ${freqInMin} minutes`);

    var job = new cronjob({
        cronTime: `1 */${freqInMin} * * * *`,
        onTick: function() {
            falcoCore.processSnapshots(snapshots, config);
        },
        start: false,
        timeZone: 'America/Santiago'
      });
    job.start()

    if(process.argv[process.argv.length - 1] == 'go')
       falcoCore.processSnapshots(snapshots, await getConfig());
       
})().catch((err) => console.error(err));


async function getConfig() {
    let config = await configuration.find({});
    return config[0];
}

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

