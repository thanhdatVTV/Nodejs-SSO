const express = require('express');
const router = express.Router();
const { getHomepage, getABC } = require('../controllers/homeController');

//Cu phat chung
//  router.Method('/router', handler)

router.get('/', getHomepage);


module.exports = router;