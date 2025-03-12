import cloudinaryModule from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
    cloud_name: "diytyjnla",
    api_key: "555319435542324",
    api_secret: "jv1VUCLK8c7P_kpyuv4h_pxeomc",
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'template_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage });

export { upload, cloudinary }; // Use named exports
