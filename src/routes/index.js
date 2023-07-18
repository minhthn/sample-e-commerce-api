import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import reviewRoutes from './reviewRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/reviews', reviewRoutes);
router.use('/api/v1/orders', orderRoutes);

export default router;
