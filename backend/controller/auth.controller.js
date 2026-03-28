import { AuthDB } from "../modules/AuthDB.js"
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {sendVerificationEmail , sendWelcomeEmail , sendChangePasswordEmail , sendResetPasswordSuccessEmail} from "../mailtrap/emails.js"

export const checkAuth = async (req , res) => {
    try {
    const user = await AuthDB.findById(req.userId)

    if(!user) {
      return res.status(400).json({ success: false, message: "User not found" })
    }

    res.status(200).json({success:true , user:{
        ...user._doc,
        password:undefined
    }})
   } catch(err) {
      console.log("Error in checkAuth ", err);
      res.status(400).json({ success: false, message: err.message });
   }
}

export const signup = async (req , res) => {
  const {email , password , name} = req.body

  try {
  if(!email || !password || !name) {
    throw new Error("All fields are required !!")
  }

  const userAlreadyExists = await AuthDB.findOne({email:email}) // we can also write only {email}
  if(userAlreadyExists) {
    return res.status(400).json({success:false , message:"User already exists !!"})
  }

  const hashedPassword = await bcrypt.hash(password , 10)
  const verificationToken = Math.floor(100000 + Math.random()*900000).toString()

  const user = new AuthDB({
    email,
    password: hashedPassword,
    name,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
  })
  await user.save()

  generateTokenAndSetCookie(res , user._id)
  sendVerificationEmail(email , verificationToken)
  res.status(201).json({
    success: true,
    message: "User created successfully !!",
    user: {
      ...user._doc,
      password:undefined, 
    }
  })
} catch(err) {
   console.error(err);
   res.status(400).json({success: false , message: err.message})
  }
}

export const verifyEmail = async (req , res) => {
  const {code} = req.body
  try {
  const user = await AuthDB.findOne({verificationToken:code , verificationTokenExpiresAt: {$gt: Date.now()}})

  if(!user) {
    return res.status(400).send("Invalid or expired verification code !!")
  }
  user.isVerified = true
  user.verificationToken = null
  user.verificationTokenExpiresAt = null
  
  await user.save()

  await sendWelcomeEmail(user.email , user.name)

  res.status(201).json({
    success: true,
    message: "User created successfully !!",
    user: {
      ...user._doc,
      password:undefined, 
    }
  })
} catch(err) {
   console.error(err);
   res.status(400).json({success: false , message: err.message})
  }
}

export const login = async (req , res) => {
  const {email ,  password} = req.body
  try {
   const user = await AuthDB.findOne({email})

   if(!user) {
    return res.status(400).json({success:false , message:"Invalid credentials !!"})
   }

   const isPasswordValid = await bcrypt.compare(password , user.password)

   if(!isPasswordValid) {
    return res.status(400).json({success:false , message:"Invalid credentials !!"})
   }

   generateTokenAndSetCookie(res , user._id)
   user.lastLogin = new Date()

   await user.save()

   res.status(200).json({
    success:true ,
    message:"Logged in succesfully !!" ,
    user:{
      ...user._doc,
      password:undefined,
    }
  })
  } catch(err) {
    console.log(err)
    res.status(400).json({success:false , message:"Login failed !!"})
  }
}

export const forgotPassword = async (req , res) => {
  const {email} = req.body
  try {
    const user = await AuthDB.findOne({email})
    if(!user) {
      return res.status(400).json({success:false , message:"Invalid credentials !!"})
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000

    await user.save()

    sendChangePasswordEmail(email , resetURL)

    res.status(201).json({success:true , 
      message:"Check your inbox !!",
      user:{
        ...user._doc,
        password:undefined
      }
    })

  } catch(err) {
    console.log(err)
    res.status(400).json({success:false , message:"Forget password process failed !!"})
  }
}

export const resetPassword = async (req , res) => {
  const {token} = req.params //////////////////////////
  const {newPassword} = req.body
  if(!newPassword) {
    return res.status(400).json({success:false , message:"The password field shouldnt be empty !!"})
  }
  const user = await AuthDB.findOne({
    resetPasswordToken:token , 
    resetPasswordExpiresAt:{$gt:Date.now()}
  })
  
  if(!user) {
    return res.status(400).json({success:false , message:"The link has expired !!"})
  }
  
  const hashedPassword = await bcrypt.hash(newPassword , 10)
  user.password = hashedPassword

  user.resetPasswordToken = null
  user.resetPasswordExpiresAt = null

  await user.save()

  res.status(200).json({
    success:true,
    message:"Password has been changed",
    user:{
      ...user._doc,
      password:undefined
    }
  })

  sendResetPasswordSuccessEmail(user.email)
}

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // explicitly match the default path
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}