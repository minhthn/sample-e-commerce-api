import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';

import productController from '../controllers/productController';
import {
    authenticateUser,
    authorizePermissions
} from '../middlewares/authenticate';
import { getDirname } from '../utils';

const router = Router();
const __dirname = getDirname(import.meta.url);

// multer
const maxFileSize = 5 * 1024 * 1024; // 5 MiB
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/upload');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueFilename = new Date().toISOString().replace(/:/g, '-')
            + path.extname(file.originalname).toLowerCase();
        cb(null, uniqueFilename);
   },
});

const upload = multer({
    storage,
    limits: {
        fileSize: maxFileSize
    }
});

router
    .route('/')
    .get(productController.getAllProducts)
    .post([authenticateUser, authorizePermissions('admin')], productController.createProduct);

router
    .route('/upload')
    .post(
        [authenticateUser, authorizePermissions('admin')],
        upload.single('image'),
        productController.uploadImage
    );

router
    .route('/:id')
    .get(productController.getSingleProduct)
    .patch([authenticateUser, authorizePermissions('admin')], productController.updateProduct)
    .delete([authenticateUser, authorizePermissions('admin')], productController.deleteProduct);

router.get('/:id/reviews', productController.getSingleProductReviews);


export default router;
