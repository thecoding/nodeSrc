


const express = require('express')
const LoginHandle = require('../controller/login.js')
const router = express.Router();

router.post('/login',LoginHandle.doLogin);
router.post('/loginOut',LoginHandle.loginOut);
// router.get('/test',LoginHandle.test);


module.exports = router;