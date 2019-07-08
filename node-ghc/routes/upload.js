


const express = require('express')
const Upload = require('../controller/upload.js')
const router = express.Router();
const multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.post('/*',multipartMiddleware,Upload.upload);

module.exports = router;