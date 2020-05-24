
const falcoStatic = require("./falco-static-scrape");

module.exports = {
    
    async processSnapshots(snapshots) {
        let allSnapshots = await snapshots.find()

        allSnapshots.forEach(async snapshot => {
            console.log("Processing "+snapshot.name);

            let start = process.hrtime();

            if(snapshot.dynamic) {
            console.log("dynamic not implemented yet");
            } else {
                let data = await falcoStatic.scrape(snapshot.url, snapshot.query);
                snapshot.data = data;
                snapshot.last_update = new Date();   
                snapshots.update({_id: snapshot._id}, snapshot)
            }

            elapsed_time(start, snapshot.name);

        });
        
    }
}

elapsed_time = function(start, note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
}