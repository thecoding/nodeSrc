



const express = require('express')
const Api = require('../controller/api.js')
const router = express.Router();

router.get('/*',Api.invokeApi);


module.exports = router;