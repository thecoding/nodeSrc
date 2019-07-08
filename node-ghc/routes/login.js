


const express = require('express')
const LoginHandle = require('../controller/login.js')
const router = express.Router();

router.get('/login',LoginHandle.doLogin);
router.get('/loginOut',LoginHandle.loginOut);


module.exports = router;