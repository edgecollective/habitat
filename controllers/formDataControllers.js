var db = require('../config/database');
const fs = require('fs');
const fastcsv = require("fast-csv");
const CsvParser = require("json2csv").Parser;

/*
exports.getPage = function(req, res, next) {
    var feed_id = req.body.feed_id;
    res.render('data',{feed: feed_id});

}
*/

exports.getPage = function(req, res, next) {
    var feed_id = req.body.feed_id;
    var target_url = '/data/'.concat(feed_id.toString());
    res.redirect(target_url);
}


exports.getCSV = function(req, res, next) {

    var feed_id = req.body.feed_id;

    var ws = fs.createWriteStream('measurements.csv');
    const tableName = 'measurements';

    const query = `SELECT * FROM ${tableName} WHERE feed_id = ${feed_id}`;

    // pass SQL string and table name to query()
db.query(query, (err, response) => {

    if (err) {
    console.log("client.query()", err.stack)
    }
    
    if (response) {
    
    const jsonData = JSON.parse(JSON.stringify(response.rows));
    console.log("\njsonData:", jsonData)
    
    const csvFields = ["id", "feed_id", "created","celcius"];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(jsonData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=measurements.csv");

    //res.status(200).end(csvData);
    return res.status(200).send(csvData);
    }
});
}

exports.getJSON = function(req, res, next) {

    var feed_id = req.body.feed_id;

    const query = `SELECT * FROM measurements WHERE feed_id = ${feed_id}  ORDER BY created DESC`;

    db.query(query, (error, results) => {
        if (error)
            throw error;
        res.status(200).json(results.rows);
    });
}

