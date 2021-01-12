var db = require('../config/database');
const fs = require('fs');
const fastcsv = require("fast-csv");
const CsvParser = require("json2csv").Parser;
var networkUtil = require('../utils/networkUtil');


const getFeedDetails = (feed_pubkey) => db.query('SELECT * FROM feeds WHERE public_key = $1', [feed_pubkey]).then(response => response.rows[0])
.catch((err) => {
    console.log("couldn't find feed_id for that key!");
  });


exports.getJSON = (req,res,next) =>  {

    var feed_pubkey = String(req.params.feed_pubkey);

    getFeedDetails(String(req.params.feed_pubkey))
    .then((feed_params) => {

    var feed_id = feed_params.feed_id;

        db.query('SELECT * FROM measurements WHERE feed_id = $1', [feed_id], (err, results) => {
            if (err) throw err

            res.status(200).json(results.rows);

        });
    })
    .catch((err) => {
       console.log("couldn't get measurements for that feed_id!");
      });
   
}

exports.getPage = function(req, res, next) { // NOW BY PUB_KEY

    var feed_pubkey = req.params.feed_pubkey;
     //use the IP address for the feed link; change this once we have a fixed URL:
     var ip = networkUtil.getIp();

     getFeedDetails(String(req.params.feed_pubkey))
     .then((feed_params) => {
        console.log(feed_params);
    res.render('data',{feed_pubkey:feed_params.public_key,feed_name:feed_params.name,base_url:ip});
     }).catch((err) => {
        console.log("Something went wrong with getPage!");
       });
}

exports.getCSV = function(req, res, next) {  // NOW BY PUB KEY

    var feed_pubkey = String(req.params.feed_pubkey);

    getFeedDetails(String(req.params.feed_pubkey))
    .then((feed_params) => {
        var feed_id = feed_params.feed_id;

    console.log("feed_pubkey",feed_pubkey);
    console.log(feed_id);

    db.query('SELECT * FROM measurements WHERE feed_id = $1', [feed_id], (err, response) => {

    if (err) {
    console.log("db.query()", err.stack)
    }
    
    if (response) {
    
        var ws = fs.createWriteStream('measurements.csv');

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
        res.status(400).send('No data yet for this feed.\n' );
    }
    }
});
    })
    .catch((err) => {
        console.log("couldn't download csv!");
       });

}


exports.postNewMeasurement = function(req, res, next) {  // NOW BY PUB KEY
    // Extract into variables from request body
    //var {private_key, celcius, humidity } = req.body;
    var {private_key, co2, tempC, humidity, mic, auxPressure, auxTempC, aux001, aux002} = req.body;

    var feed_pubkey = String(req.params.feed_pubkey);

    getFeedDetails(String(req.params.feed_pubkey))
    .then((feed_params) => {
        var feed_id = feed_params.feed_id;

    console.log(private_key,co2,tempC,humidity,mic,auxPressure,auxTempC,aux001,aux002);

    console.log(private_key);

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
    })
    .catch((err) => {
        console.log("couldn't get measurements for that feed_id!");
       });
}

exports.getLatestMeasurement = function(req, res, next) {
    
    getFeedDetails(String(req.params.feed_pubkey))
    .then((feed_params) => {
        
        var feed_id = feed_params.feed_id;

    const query = `SELECT * FROM measurements WHERE feed_id = ${feed_id}  ORDER BY created DESC LIMIT 1`;

    db.query(query, (error, results) => {
        if (error)
            throw error;
        res.status(200).json(results.rows);
    });
}).catch((err) => {
    console.log("couldn't get latest measurement for this feed!");
   });


}

