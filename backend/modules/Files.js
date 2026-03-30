import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthDB', required: true },
    fileName: { type: String, required: true }, 
    originalName: { type: String, required: true }, 
    fileSize: { type: Number, required: true }, 
    fileType: { type: String, required: true }, 
    s3Key: { type: String, required: true }, // Changed back to s3Key
    downloadCount: { type: Number, default: 0 },
    lastDownloadedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false } 
}, { timestamps: true });

export const File = mongoose.model('File', FileSchema);