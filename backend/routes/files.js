import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
    uploadFile, 
    listFiles, 
    downloadFile, 
    deleteFile, 
    getStats 
} from '../controller/files.controller.js';

const router = express.Router();

// Apply verifyToken to ALL routes in this file
router.use(verifyToken);

// Define the endpoints
router.post('/upload', uploadFile);
router.get('/', listFiles);
router.get('/download/:fileId', downloadFile);
router.delete('/delete/:fileId', deleteFile);
router.get('/stats', getStats);

export default router;