import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import {
    authenticateUser,
    authorizePermissions,
} from '../middlewares/authenticate';

const router = Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authenticateUser, reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getSingleReview)
    .patch(authenticateUser, reviewController.updateReview)
    .delete(authenticateUser, reviewController.deleteReview);

export default router;
