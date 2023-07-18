import Order from '../models/Order';
import Product from '../models/Product';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import checkPermissions from '../utils/checkPermissions';

const fakeStripe = async function ({ amount, currency }) {
    return {
        client_secret: 'random_client_secret',
        amount,
    }
}

const orderController = {

    // GET /api/v1/orders
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.find({});
            res.status(StatusCodes.OK).json({
                status: 'Success',
                total: orders.length,
                orders,
            });
        } catch (err) {
            next(err);
        }
    },

    // POST /api/v1/orders
    createOrder: async (req, res, next) => {
        const { tax, shippingFee, items } = req.body;
        if (!items) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                'No items supplied'
            ));
        }
        if (!tax || !shippingFee) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                `Please provide both 'tax' and 'shippingFee'`
            ));
        }
        let orderItems = [];
        let subtotal = 0;
        try {
            for (const item of items) {
                const existingProduct = await Product.findOne({ _id: item.product });
                if (!existingProduct) {
                    return next(createError(
                        StatusCodes.NOT_FOUND,
                        `No such product with id: '${item.product}'`
                    ));
                }
                subtotal += item.amount * existingProduct.price;
                const orderItem = {
                    name: existingProduct.name,
                    image: existingProduct.image,
                    price: existingProduct.price,
                    amount: item.amount,
                    product: item.product
                };
                orderItems.push(orderItem);
            }
            const total = subtotal + tax + shippingFee;
            const paymentIntent = await fakeStripe({ total, currenycy: 'usd' });
            const order = await Order.create({
                tax,
                shippingFee,
                subtotal,
                total,
                orderItems,
                user: req.user.id,
                clientSecret: paymentIntent.client_secret,
            });
            res.status(StatusCodes.CREATED).json({
                status: 'Success',
                order,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/orders/:id
    getSingleOrder: async (req, res, next) => {
        const orderId = req.params.id;
        try {
            const order = await Order.findOne({ _id: orderId });
            if (!order) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such order with id: '${orderId}'`
                ));
            }
            console.log(">> order:", order);
            console.dir(order.user);
            checkPermissions(req.user, order.user);
            res.status(StatusCodes.OK).json({
                status: 'Success',
                order,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/orders/my-orders
    showCurrentUserOrders: async (req, res, next) => {
        const userId = req.user.id;
        try {
            const orders = await Order.find({ user: userId });
            res.status(StatusCodes.OK).json({
                statusS: 'Success',
                orders,
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /api/v1/orders/:id
    updateOrder: async (req, res, next) => {
        const orderId = req.params.id;
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                'No paymentIntentId supplied',
            ));
        }
        try {
            const order = await Order.findOne({ _id: orderId });
            if (!order) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `No such order with id: '${orderId}'`
                ));
            }
            order.paymentIntentId = paymentIntentId;
            order.status = 'paid';
            await order.save();
            res.status(StatusCodes.OK).json({
                status: 'Success',
                order
            });
        } catch (err) {
            next(err);
        }
    },
};

export default orderController;