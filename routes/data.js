var express = require('express');
var router = express.Router();
var passport = require('passport')
var basicAuth = passport.authenticate('basic', { session: false })
var data_feeds = require('../controllers/dataControllers');
var path = require("path");

router.get('/:feed_id/', function(req,res, next){
    res.sendFile(path.join(__dirname,'../public/data.html')); //make this more robust?
  });

router.get('/:feed_id/json/',data_feeds.getJSON);

router.get('/:feed_id/latest/',data_feeds.getLatestMeasurement);

//router.post('/', basicAuth, measurements.postNewMeasurement);

router.post('/:feed_id/', data_feeds.postNewMeasurement);

router.get('/:feed_id/csv/',data_feeds.getCSV);

module.exports = router;