import asyncHandler from '../middleware/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const isVector = ['svg'].includes(fileExtension);
    
    const uploadOptions = {
      folder: 'homelyhub',
      resource_type: isVector ? 'raw' : 'image',
      public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    if (!isVector) {
      uploadOptions.transformation = [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ];
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        storage: 'cloudinary'
      }
    });

  } catch (error) {
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded locally',
      data: {
        public_id: `local_${Date.now()}_${req.file.originalname}`,
        url: dataUrl,
        local: true,
        storage: 'base64',
        format: req.file.mimetype.split('/')[1],
        bytes: req.file.size
      }
    });
  }
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({
      success: false,
      message: 'Image public ID is required'
    });
  }

  try {
    if (!public_id.startsWith('local_')) {
      await cloudinary.uploader.destroy(public_id);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

export const checkCloudinaryConfig = asyncHandler(async (req, res) => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  };

  let testResult = null;
  if (config.configured) {
    try {
      testResult = await cloudinary.api.root_folders();
    } catch (error) {
      testResult = { error: error.message };
    }
  }

  res.status(200).json({
    success: true,
    message: 'Cloudinary configuration check',
    data: {
      config,
      testResult,
      recommendation: config.configured ? 
        'Cloudinary is properly configured' : 
        'Please set Cloudinary environment variables'
    }
  });
});