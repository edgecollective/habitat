var db = require('../config/database');
const fs = require('fs');
const fastcsv = require("fast-csv");
const CsvParser = require("json2csv").Parser;

exports.getPage = function(req, res, next) { // NOW BY PUB_KEY

    var feed_pubkey = req.params.feed_pubkey;
    res.render('data',{feed_pubkey: feed_pubkey});

}

exports.getJSON = function(req, res, next) {  // NOW BY PUB_KEY
  
    var feed_pubkey = String(req.params.feed_pubkey);

    console.log("feed_pubkey",feed_pubkey);

    db.query('SELECT * FROM feeds WHERE public_key = $1', [feed_pubkey], (err, results) => {
        if (err) throw err

        if (results.rows.length<1) throw 'no feeds exist with that public key!'

        if (results.rows.length>1) throw 'more than one field with this public key!'

        //if we got here, we've got a unique feed for this public Key

        console.log(results.rows[0]);
        var feed_id = results.rows[0].feed_id;

        console.log("feed_id for this key is",feed_id)
        db.query('SELECT * FROM measurements WHERE feed_id = $1', [feed_id], (err, results) => {
            if (err) throw err

            res.status(200).json(results.rows);

        });

      });
}

exports.getCSV = function(req, res, next) {  // NOW BY PUB KEY

    var feed_pubkey = String(req.params.feed_pubkey);
    console.log("feed_pubkey",feed_pubkey);


    db.query('SELECT * FROM feeds WHERE public_key = $1', [feed_pubkey], (err, results) => {
        if (err) throw err

        if (results.rows.length<1) throw 'no feeds exist with that public key!'

        if (results.rows.length>1) throw 'more than one field with this public key!'

        console.log(results.rows[0]);
        var feed_id = results.rows[0].feed_id;

    var ws = fs.createWriteStream('measurements.csv');

    
    db.query('SELECT * FROM measurements WHERE feed_id = $1', [feed_id], (err, response) => {

    if (err) {
    console.log("client.query()", err.stack)
    }
    
    if (response) {
    
        console.log(response);

        if (response.rows.length>0){
    const jsonData = JSON.parse(JSON.stringify(response.rows));
    console.log("\njsonData:", jsonData)
    
    const csvFields = ["id", "feed_id", "created","celcius"];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(jsonData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=measurements.csv");

    //res.status(200).end(csvData);
    return res.status(200).send(csvData);
    } else {
        res.status(400).send('No data yet for that feed.\n' );
    }
    }
});
});
}

exports.postNewMeasurement = function(req, res, next) {  // NOW BY PUB KEY
    // Extract into variables from request body
    //var {private_key, celcius, humidity } = req.body;
    var {private_key, co2, tempC, humidity, mic, auxPressure, auxTempC, aux001, aux002} = req.body;

    var feed_pubkey = req.params.feed_pubkey;

    console.log(private_key,co2,tempC,humidity,mic,auxPressure,auxTempC,aux001,aux002);

    //console.log(feed_pubkey);
    console.log(private_key);
    //console.log(celcius);
    //console.log(humidity);

    db.query('SELECT * FROM feeds WHERE public_key = $1', [feed_pubkey], (err, results) => {
        if (err) throw err

        if (results.length<1) throw 'no feeds exist with that public key!'

        if (results.length>1) throw 'more than one field with this public key!'

        //if we got here, we've got a unique feed for this public Key

        console.log(results.rows[0]);
        var feed_id = results.rows[0].feed_id;

      const query = {
        text: 'SELECT * FROM feeds WHERE feed_id = $1',
        values: [feed_id],
      }

    console.log('poster key is:');
    console.log(private_key);

   db.query(query, (error, results) => {
    if (error)
        throw error;
        
    console.log("associated private_key is:");
    var key_to_match =results.rows[0].private_key;
    console.log(key_to_match);
    if(private_key==key_to_match) {
        console.log("key match!");

  // Check if values are int, float and float

  var dataValid = (
    typeof co2 == 'number' &&
    typeof tempC == 'number' &&
    typeof humidity == 'number' &&
    typeof mic == 'number' &&
    typeof auxPressure == 'number' &&
    typeof auxTempC == 'number' &&
    typeof aux001 == 'number' &&
    typeof aux002 == 'number'
)

console.log("dataValid=",dataValid)

if (dataValid)  {
    // Create new measurement
    var insertSQL = `INSERT INTO measurements (feed_id, co2, tempC, humidity, mic, auxpressure, auxTempC, aux001, aux002) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`
    var params = [feed_id, co2, humidity, tempC, mic, auxPressure, auxTempC, aux001, aux002]

    db.query(insertSQL, params, (error, result) => {
        if (error) {
            res.status(400).send(error);
        } else {
            res.status(200).send('Measurement recorded\n');    
        }
    });

} else {
    res.status(400).send('Please check that your data types are correct' );
}

    }
    else{
        console.log("keys don't match!");
        res.status(400).send('Private key mismatch.\n' );

    }
});
    });

}

exports.getLatestMeasurement = function(req, res, next) {

    var feed_id = req.params.feed_id;
    
    const query = `SELECT * FROM measurements WHERE feed_id = ${feed_id}  ORDER BY created DESC LIMIT 1`;

    db.query(query, (error, results) => {
        if (error)
            throw error;
        res.status(200).json(results.rows);
    });
}

