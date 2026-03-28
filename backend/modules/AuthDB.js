import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
    
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    verificationToken: String,
    verificationTokenExpiresAt: Date,
} , { timestamps: true })

export const AuthDB = mongoose.model('AuthDB' , AuthSchema)