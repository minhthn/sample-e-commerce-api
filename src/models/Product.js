import mongoose from 'mongoose';
import Review from './Review';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'No name supplied'],
        trim: true,
        minLength: [3, 'Name too short. Must be at least 3 characters'],
        maxLength: [20, 'Name too long. Must be at most 20 characters'],
    },
    price: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        required: [true, 'No description supplied'],
        maxLength: [500, 'Description must be at most 500 characters'],
    },
    image: {
        type: String,
        default: '/upload/sample.png',
    },
    category: {
        type: String,
        lowercase: true,
        required: [true, 'No category supplied'],
        enum: {
            values: ['office', 'kitchen', 'bedroom'],
            message: `Unknown category, '{VALUE}' is not supported`,
        },
    },
    company: {
        type: String,
        lowercase: true,
        required: [true, 'No company supplied'],
        enum: {
            values: ['marcos', 'liddy', 'ikea'],
            message: `Unknown company, '{VALUE}' is not supported`,
        },
    },
    colors: {
        type: [String],
        required: [true, 'No colors supplied'],
        default: ['#3f4'],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        default: 10,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    user: {
        type: ObjectId,
        required: [true, 'Must be provide author id'],
        ref: 'User',
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.id;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.id;
        }
    }
});

// virtuals
// looking for documents in `ref` whose foreignField matches this document's localField
ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
});

// query helpers
ProductSchema.query.populateProduct = function () {
    return this.populate([
        {
            path: 'user',
            select: 'name email role'
        },
        {
            path: 'reviews',
            populate: {
                path: 'user',
                select: 'name email role'
            }
        }
    ]);
}

// middlewares

const deleteProductMiddleware = async function(next) {
    const productId = this._conditions._id;
    await Review.deleteMany({ product: productId });
}

ProductSchema.pre('findOneAndDelete', deleteProductMiddleware);
ProductSchema.pre('deleteOne', deleteProductMiddleware);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
