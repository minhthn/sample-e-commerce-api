import { Router } from 'express';
import userController from '../controllers/userController';
import {
    authenticateUser,
    authorizePermissions
} from '../middlewares/authenticate';

const router = Router();

router.get('/', authenticateUser, authorizePermissions('admin'), userController.getAllUsers);
router.get('/me', authenticateUser, userController.getCurrentUser);
router.patch('/update', authenticateUser, userController.updateUser);
router.patch('/update-password', authenticateUser, userController.updateUserPassword);
router.get('/:id', authenticateUser, userController.getSingleUser);


export default router;
