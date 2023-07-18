import User from '../models/User';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import {
    checkPermissions,
    createAccessToken,
    storeAccessToken,
} from '../utils';

const usersController = {

    // GET /api/v1/users
    getAllUsers: async (req, res, next) => {
        try {
            // must be an admin
            const users = await User.find({ role: 'user' }).select({ password: 0 });
            res.status(StatusCodes.OK).json({
                status: 'Success',
                total: users.length,
                users,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/users/:id
    getSingleUser: async (req, res, next) => {
        const userId = req.params.id;
        try {
            const user = await User.findById(userId).select({ password: 0 });

            if (user == null) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    `There is no user with id: '${userId}'`
                ));
            }
            checkPermissions(req.user, user._id);
            res.status(StatusCodes.OK).json({
                status: 'Success',
                user,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /api/v1/users/me
    getCurrentUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            res.status(StatusCodes.OK).json({
                status: 'Success',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            });

        } catch (err) {
            next(err);
        }
    },

    // PATCH /api/v1/users/update
    updateUser: async (req, res, next) => {
        const { name, email } = req.body;
        if (!name && !email) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                'There is nothing to update'
            ));
        }
        try {
            const userId = req.user.id;
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { name, email },
                { new: true, runValidators: true, }
            );

            const jwtPayload = {
                id: updatedUser._id,
                name: updatedUser.name,
                role: updatedUser.role,
            };
            const accessToken = createAccessToken(jwtPayload);
            storeAccessToken(res, accessToken);
            res.status(StatusCodes.OK).json({
                status: 'Success',
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                }
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /api/v1/users/update-password
    updateUserPassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(createError(
                StatusCodes.BAD_REQUEST,
                'Must provide both oldPassword and newPassword',
            ));
        }
        try {
            const user = await User.findById(req.user.id);
            const isMatch = await user.verifyPassword(oldPassword);
            if (!isMatch) {
                return next(createError(
                    StatusCodes.UNAUTHORIZED,
                    'The provided password is incorrect',
                ));
            }

            user.password = newPassword;
            await user.save();
            res.status(StatusCodes.OK).json({
                status: 'Success',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            });
        } catch (err) {
            next(err);
        }

    },
};

export default usersController
