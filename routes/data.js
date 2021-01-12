var express = require('express');
var router = express.Router();
var passport = require('passport')
var basicAuth = passport.authenticate('basic', { session: false })
var data_feeds = require('../controllers/dataControllers');
var path = require("path");

router.get('/:feed_pubkey/',data_feeds.getPage);

router.get('/:feed_pubkey/json/',data_feeds.getJSON);

router.get('/:feed_pubkey/csv/',data_feeds.getCSV);

router.post('/:feed_pubkey/', data_feeds.postNewMeasurement);
0
router.get('/:feed_pubkey/latest/',data_feeds.getLatestMeasurement);


module.exports = router;