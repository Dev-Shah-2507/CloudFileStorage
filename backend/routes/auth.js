import express from "express"
import {signup , verifyEmail , login , forgotPassword , resetPassword , logout , checkAuth} from "../controller/auth.controller.js"
import {verifyToken} from "../middleware/verifyToken.js"

const router = express.Router()

router.get('/check-auth' , verifyToken , checkAuth)

router.post('/signup' , signup)

router.post('/verify-email' , verifyEmail)

router.post('/login' , login)

router.post("/forgotPassword" , forgotPassword)

router.post("/resetPassword/:token" , resetPassword)

router.post("/logout", logout)

export default router