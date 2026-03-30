import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AuthDB', 
        required: true 
    },
    action: { 
        type: String, 
        enum: ['REGISTER', 'VERIFY_EMAIL', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'DELETE'], 
        required: true 
    },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    ipAddress: { type: String, default: null }
}, { timestamps: true });

export const Activity = mongoose.model('Activity', ActivitySchema);