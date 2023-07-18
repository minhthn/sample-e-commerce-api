import { Router } from 'express';
import orderController from '../controllers/orderController';
import {
    authenticateUser,
    authorizePermissions,
} from '../middlewares/authenticate';

const router = Router();

router.route('/')
    .get(authenticateUser, authorizePermissions('admin'), orderController.getAllOrders)
    .post(authenticateUser, orderController.createOrder);

router.get('/my-orders', authenticateUser, orderController.showCurrentUserOrders);

router.route('/:id')
    .get(authenticateUser, orderController.getSingleOrder)
    .patch(authenticateUser, orderController.updateOrder);

export default router;
