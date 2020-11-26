const monk = require("monk");
const fs = require("fs");
const token = fs.readFileSync('./db.config')
const db = monk(token.toString());

module.exports = db;
