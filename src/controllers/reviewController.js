import Product from '../models/Product';
import Review from '../models/Review';
import { checkPermissions } from '../utils';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';

const reviewController = {

    // GET /api/v1/reviews
    getAllReviews: async (req, res, next) => {
        try {
            const reviews = await Review.find({}).populateReview();
            res.status(StatusCodes.OK).json({
                status: 'Success',
                total: reviews.length,
                reviews
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /api/v1/reviews
    createReview: async (req, res, next) => {
        const productId = req.body.product;
        const userId = req.user.id;
        req.body.user = userId;
        try {
            if (typeof productId === 'undefined') {
                return next(createError(
                    StatusCodes.BAD_REQUEST,
                    'No product id supplied',
                ));
            }
            const product = await Product.findOne({ _id: productId });
            if (!product) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `There is no product with id '${productId}'`
                ));
            }

            const submittedReview = await Review.findOne({
                product: productId,
                user: userId
            });
            if (submittedReview) {
                return next(createError(
                    StatusCodes.BAD_REQUEST,
                    'Review is already submitted'
                ));
            }

            const newReview = await Review.create(req.body);
            res.status(StatusCodes.CREATED).json({
                status: 'Success',
                review: newReview
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/reviews/:id
    getSingleReview: async (req, res, next) => {
        const reviewId = req.params.id;
        try {
            const review = await Review.findOne({ _id: reviewId }).populateReview();
            if (!review) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such review with id '${reviewId}'`
                ));
            }
            res.status(StatusCodes.OK).json({
                status: 'Success',
                review
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /api/v1/reviews/:id
    updateReview: async (req, res, next) => {
        const reviewId = req.params.id;
        const { rating, title, comment } = req.body;
        try {
            const review = await Review.findOne({ _id: reviewId });
            if (!review) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such review with id '${reviewId}'`
                ));
            }
            checkPermissions(req.user, review.user);
            // await review.update({ rating, title, comment });
            const updatedReview = await Review.findOneAndUpdate(
                { _id: reviewId },
                { rating, title, comment },
                { new: true, runValidators: true }
            );
            res.status(StatusCodes.OK).json({
                status: 'Success',
                updatedReview
            });
        } catch (err) {
            next(err);
        }
    },

    // DELETE /api/v1/reviews/:id
    deleteReview: async (req, res, next) => {
        const reviewId = req.params.id;
        try {
            const review = await Review.findOne({ _id: reviewId });
            if (!review) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such review with id '${reviewId}'`
                ));
            }
            checkPermissions(req.user, review.user);
            // await review.remove(); // deprecated in mongoose v5.5.3
            const deletedReview = await Review.findOneAndDelete({ _id: reviewId });
            res.status(StatusCodes.OK).json({
                status: 'Success',
                deletedReview
            });
        } catch (err) {
            next(err);
        }
    },
};

export default reviewController;