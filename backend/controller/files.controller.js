import { s3Client } from '../config/awsConfig.js';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from '../modules/Files.js';
import { AuthDB } from '../modules/AuthDB.js';
import { Activity } from '../modules/Activity.js';
import multer from 'multer';

const multerStorage = multer.memoryStorage();
export const uploadMiddleware = multer({ 
    storage: multerStorage,
    limits: { fileSize: 50 * 1024 * 1024 } 
}).single('file'); 

export const uploadFile = (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        if (!req.file) return res.status(400).json({ success: false, message: "No file provided!" });

        try {
            const originalName = req.file.originalname;
            const fileSize = req.file.size;
            const fileType = req.file.mimetype;
            
            const s3Key = `uploads/${req.userId}/${Date.now()}-${originalName.replace(/\s+/g, '_')}`;

            // Push to AWS S3
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: s3Key,
                Body: req.file.buffer,
                ContentType: fileType,
            });

            await s3Client.send(command);

            // Save metadata to MongoDB
            const newFile = await File.create({
                userId: req.userId,
                fileName: originalName,
                originalName: originalName,
                fileSize: fileSize,
                fileType: fileType,
                s3Key: s3Key
            });

            await AuthDB.findByIdAndUpdate(req.userId, {
                $inc: { totalFilesUploaded: 1, totalStorageUsed: fileSize }
            });

            await Activity.create({
                userId: req.userId,
                action: 'UPLOAD',
                fileName: originalName,
                fileSize: fileSize
            });

            res.status(201).json({ success: true, message: "File uploaded securely to AWS!", file: newFile });

        } catch (error) {
            console.error("AWS Upload Error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
};

export const listFiles = async (req, res) => {
    try {
        const files = await File.find({ userId: req.userId, isDeleted: false }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findOne({ _id: fileId, userId: req.userId, isDeleted: false });

        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        // Generate AWS Pre-signed URL
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.s3Key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

        file.downloadCount += 1;
        file.lastDownloadedAt = Date.now();
        await file.save();

        await Activity.create({
            userId: req.userId,
            action: 'DOWNLOAD',
            fileName: file.originalName,
            fileSize: file.fileSize
        });

        res.status(200).json({ success: true, url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findOne({ _id: fileId, userId: req.userId, isDeleted: false });

        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        // Hard delete from AWS S3
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: file.s3Key,
            });
            await s3Client.send(command);
        } catch (cloudErr) {
            console.log("Cloud deletion error:", cloudErr.message);
        }

        // Soft delete in MongoDB
        file.isDeleted = true;
        await file.save();

        await AuthDB.findByIdAndUpdate(req.userId, {
            $inc: { totalStorageUsed: -file.fileSize, totalFilesUploaded: -1 }
        });

        await Activity.create({
            userId: req.userId,
            action: 'DELETE',
            fileName: file.originalName,
            fileSize: file.fileSize
        });

        res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const user = await AuthDB.findById(req.userId);
        res.status(200).json({
            success: true,
            stats: {
                totalFiles: user.totalFilesUploaded,
                totalStorageUsed: user.totalStorageUsed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};