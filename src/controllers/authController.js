import User from '../models/User';
import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import {
    createAccessToken,
    storeAccessToken,
    removeAccessToken
} from '../utils';

const authController = {

    // POST /api/v1/auth/register
    register: async (req, res, next) => {
        try {
            const { name, email, password } = req.body; // ignore role

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return next(createError(
                    StatusCodes.BAD_REQUEST,
                    'This email is already registered. Please try another one'
                ));
            }

            // set the first registered user as admin
            const isFirst = await User.countDocuments({}) === 0;
            const role = isFirst ? 'admin' : 'user';
            const newUser = await User.create({ name, email, password, role });
            res.status(StatusCodes.CREATED).json({
                message: 'User created',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                }
            });
        } catch (err) {
            return next(err);
        }
    },

    // POST /api/v1/auth/login
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(createError(
                    StatusCodes.BAD_REQUEST,
                    'Must provide email and password',
                ));
            }
            const user = await User.findOne({ email });
            if (user == null) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    'Email or password is not correct'
                ));
            }
            const isMatch = await user.verifyPassword(password);
            if (!isMatch) {
                return next(createError(
                    StatusCodes.NOT_FOUND,
                    'Email or password is not correct'
                ));
            }

            const jwtPayload = {
                id: user._id,
                name: user.name,
                role: user.role,
            }
            const accessToken = createAccessToken(jwtPayload);
            storeAccessToken(res, accessToken);

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
            return next(err);
        }
    },

    // GET /api/v1/auth/logout
    logout: async (req, res, next) => {
        removeAccessToken(res);
        res.status(StatusCodes.OK).json({
            message: 'Logged out',
        });
    },
};

export default authController;
