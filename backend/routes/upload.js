import express from 'express';
import { uploadImage, deleteImage, checkCloudinaryConfig } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/config', checkCloudinaryConfig);
router.post('/image', protect, upload.single('image'), uploadImage);
router.delete('/image', protect, deleteImage);

export default router;