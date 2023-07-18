import mongoose, { SchemaType } from 'mongoose';
import Product from './Product';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: [true, 'No rating supplied'],
        min: [1, 'Rating must be between 1-5'],
        max: [5, 'Rating must be between 1-5'],
    },
    title: {
        type: String,
        required: [true, 'No title supplied'],
        trim: true,
        minLength: [3, 'Title must be at least 3 characters'],
        maxLength: [128, 'Title cannot be exceed 128 characters'],
    },
    comment: {
        type: String,
        required: [true, 'No comment supplied'],
        maxLength: [256, 'Comment cannot be exceed 256 characters'],
    },
    user: {
        type: ObjectId,
        required: [true, 'No user id supplied'],
        ref: 'User',
    },
    product: {
        type: ObjectId,
        required: [true, 'No product id supplied'],
        ref: 'Product',
    }
}, {
    timestamps: true,
});

ReviewSchema.query = {
    populateReview: function () {
        return this.populate([
            { path: 'user', select: 'name email role' },
            { path: 'product', select: 'name price category company averageRating' }
        ]);
    }
};

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    try {
        const product = await Product.findOne({ _id: productId });
        const result = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    numOfReviews: { $sum: 1 }
                }
            }
        ]);
        product.averageRating = result[0].averageRating.toFixed(1);
        product.numOfReviews = result[0].numOfReviews;
        await product.save();
    } catch (err) {
        throw err;
    }
}

// create middleware
ReviewSchema.post('save', async function (doc, next) {
    console.log('>> Post save hook called');
    await doc.constructor.calculateAverageRating(doc.product);
});

// update middleware
ReviewSchema.post('findOneAndUpdate', async function (doc, next) {
    console.log('>> Post findOneAndUpdate hook called');
    await doc.constructor.calculateAverageRating(doc.product);
});

// delete middleware
ReviewSchema.post('findOneAndDelete', async function (doc, next) {
    console.log('>> Post findOneAndDelete hook called');
    await doc.constructor.calculateAverageRating(doc.product);
});
ReviewSchema.post('deleteOne', async function (doc, next) {
    console.log('>> Post deleteOne hook called');
    await doc.constructor.calculateAverageRating(doc.product);
});

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
const Review = mongoose.model('Review', ReviewSchema);

export default Review;