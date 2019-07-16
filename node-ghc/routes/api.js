



const express = require('express')
const Api = require('../controller/api.js')
const router = express.Router();

router.post('/*',Api.invokeApi);


module.exports = router;