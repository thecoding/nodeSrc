


import express from 'express'
import LoginCtr from '../controller/login.js'
const router = express.Router();

router.get('/login',LoginCtr.doLogin);
router.get('/loginOut',LoginCtr.loginOut);

export default router;