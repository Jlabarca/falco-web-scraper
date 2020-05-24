let log =  require('bunyan').createLogger({
    name: "falco",
    level: 'info',
    streams: [
        {
            level: 'info',
            type: 'rotating-file',
            path: './log/falco.log',
            period: '1d',   // daily rotation
            count: 3        // keep 3 back copies
        },
        {
            name: "falcoConsole",
            stream: process.stdout,
            level: "info",
            reemitErrorEvents: true
        }
    ]
})

module.exports = log