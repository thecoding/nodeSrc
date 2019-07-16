


const express = require('express')
const Download = require('../controller/download')
const router = express.Router();

router.post('/excel/*',Download.excelDownload);

module.exports = router;