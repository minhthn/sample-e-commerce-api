import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    }
});

const OrderSchema = new Schema({
    tax: {
        type: Number,
        required: [true, 'No tax supplied'],
    },
    shippingFee: {
        type: Number,
        required: [true, 'No shipping fee supplied'],
    },
    subtotal: {
        type: Number,
        required: [true, 'No subtotal supplied'],
    },
    total: {
        type: Number,
        required: [true, 'No total supplied'],
    },
    orderItems: {
        type: [OrderItemSchema],
    },
    status: {
        type: String,
        lowercase: true,
        enum: {
            values: ['pending', 'failed', 'paid', 'canceled', 'delivered']
        },
        default: 'pending'
    },
    user: {
        type: Schema.Types.ObjectId,
        required: [true, 'No user id supplied']
    },
    clientSecret: {
        type: String,
        required: [true, 'No client secret supplied']
    },
    paymentIntentId: {
        type: String,
        default: null
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;