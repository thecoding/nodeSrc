


const express = require('express')
const Download = require('../controller/download')
const router = express.Router();

router.get('/excel/*',Download.excelDownload);
// router.post('/excel/*',Download.excelDownload);

module.exports = router;