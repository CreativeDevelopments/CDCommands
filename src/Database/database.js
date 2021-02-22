const { connect } = require("mongoose");
const { log } = require('mustang-log');

/** @param {string} mongoURI */
module.exports = async function(mongoURI) {
    connect(mongoURI, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err) throw err;
        else log("Successfully connected to the mongoose database.", 'INFO', true);
    });
}