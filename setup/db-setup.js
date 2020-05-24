const monk = require('monk')

const url = '192.168.1.15:27017/falco'
const db = monk(url)

module.exports = db