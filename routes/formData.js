var express = require('express');
var router = express.Router();
var passport = require('passport')
var basicAuth = passport.authenticate('basic', { session: false })
var form_data_feeds = require('../controllers/formDataControllers');


router.post('/',form_data_feeds.getPage);
router.post('/csv/', form_data_feeds.getCSV);
router.post('/json/', form_data_feeds.getJSON);


module.exports = router;