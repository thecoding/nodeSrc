


const express = require('express')
const Download = require('../controller/download')
const router = express.Router();

router.post('/excel/*',Download.excelDownload);
router.post('/excel2/*',Download.createExcelFile);
router.post('/checkDownload',Download.checkDownload);
// router.post('/excel/*',Download.excelDownload);

module.exports = router;