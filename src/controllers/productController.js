import Product from '../models/Product';
import Review from '../models/Review';
import createError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import removeFile from '../utils/removeFile';
import path from 'node:path';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

const productController = {

    // GET /api/v1/products
    getAllProducts: async (req, res, next) => {
        try {
            const products = await Product.find({}).populateProduct();
            res.status(StatusCodes.OK).json({
                status: 'Success',
                total: products.length,
                products,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /api/v1/products
    createProduct: async (req, res, next) => {
        req.body.user = req.user.id;
        try {
            const newProduct = await Product.create(req.body);
            res.status(StatusCodes.CREATED).json({
                status: 'Success',
                product: newProduct,
            })
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/products/:id
    getSingleProduct: async (req, res, next) => {
        const productId = req.params.id;
        try {
            const product = await Product.findById(productId).populateProduct();
            if (!product) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such product with id: '${productId}'`
                ));
            }
            res.status(StatusCodes.OK).json({
                status: 'Success',
                // product: {...product}
                product
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/products/:id/reviews
    getSingleProductReviews: async (req, res, next) => {
        const productId = req.params.id;
        try {
            const product = await Product.findOne({ _id: productId });
            if (!product) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such product with id: '${productId}'`
                ));
            }
            const reviews = await Review.find({ product: productId });
            res.status(StatusCodes.OK).json({
                status: 'Success',
                reviews,
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /api/v1/products/:id
    updateProduct: async (req, res, next) => {
        const productId = req.params.id;
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedProduct) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such product with id: '${productId}'`
                ));
            }
            res.status(StatusCodes.OK).json({
                status: 'Success',
                updatedProduct,
            })
        } catch (err) {
            next(err);
        }
    },

    // DELETE /api/v1/products/:id
    deleteProduct: async (req, res, next) => {
        const productId = req.params.id;
        try {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            if (!deletedProduct) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such product with id: '${productId}'`
                ));
            }
            res.status(StatusCodes.OK).json({
                status: 'Success',
                deletedProduct,
            })
        } catch (err) {
            next(err);
        }
    },

    // POST /api/v1/products/upload
    uploadImage: async (req, res, next) => {
        if (!req.file || Object.keys(req.file).length === 0) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                'No image found'
            ));
        }
        const productImage = req.file;
        const accept = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!accept.includes(productImage.mimetype)) {
            await removeFile(productImage.path);
            return next(createError(
                StatusCodes.BAD_REQUEST,
                `Image must be png, jpg or jpeg. Received '${productImage.mimetype}'`
            ));
        }
        // res.json({ file: { ...req.file } });
        const imageRelativePath = path.join('/upload', productImage.filename);
        res.status(StatusCodes.OK).json({
            status: 'Success',
            image: {
                src: imageRelativePath
            }
        })
    },
};

export default productController;
