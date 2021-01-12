var db = require('../config/database');
require('dotenv').config({path: __dirname + '/../../.env'})
var networkUtil = require('../utils/networkUtil');
const crypto = require("crypto");

exports.postNewFeed = function(req, res, next) {
    // Extract into variables from request body
    //var { feed_name} = req.body;
    var feed_name = req.body.feed_name;

    console.log(feed_name);
    
    // Check if the feed_name is valid

    let patt = /^[a-zA-Z0-9\s\-]+$/;
    var dataValid = (
        patt.test(feed_name)
    )
    
    if (dataValid)  {
        console.log('Valid feedname.');

        crypto.randomBytes(24, function(err, buffer) {
            var private_key = buffer.toString('hex');
            
            crypto.randomBytes(24, function(err, buffer) {

                var public_key = buffer.toString('hex');
            /*
            db.query('SELECT * FROM pg_catalog.pg_tables', function(err, result) {
                console.log("RESULTS:");
                console.log(result);
              });
              */

                var insertSQL = 'INSERT INTO feeds (name,public_key,private_key) VALUES ($1,$2,$3);'
                var params = [feed_name,public_key,private_key]
                db.query(insertSQL, params, (error, result) => {
                    if (error) {
                        console.log(`Error: ${error}`)
                        res.status(400).send(error);
                    } else {
                        console.log(`New feed '${feed_name}' created `);
                        console.log(`with key '${private_key}'.\n`);
                        //res.status(200).send(`New feed '${feed_name}' created with private_key '${private_key}'.\n`);
                        //var feed_id = req.params.feed_id;

                        //use the IP address for the feed link; change this once we have a fixed URL:
                        var ip = networkUtil.getIp();

                        res.status(200).render('feed',{feed_name: feed_name,feed_pubkey:public_key,private_key:private_key,base_url:ip});//process.exit(0);
                    }
                });
           });

        });
           
        
    
    } else {
        res.status(400).send('Feed name must be only letters, numbers, spaces, or dashes' );
    }

}