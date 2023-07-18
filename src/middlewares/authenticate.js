import { StatusCodes } from 'http-status-codes';
import createError from 'http-errors';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils';

const authenticateUser = async (req, res, next) => {
    const accessToken = req.signedCookies.accessToken;
    if (!accessToken) {
        return next(createError(
            StatusCodes.UNAUTHORIZED,
            'You are not authenticated'
        ));
    }
    try {
        const payload = verifyAccessToken(accessToken);
        const { id, name, role } = payload;
        req.user = { id, name, role };
        next();
    } catch (err) {
        return next(createError(
            StatusCodes.UNAUTHORIZED,
            'You are not authenticated'
        ));
    }
}

const authorizePermissions = (...roles) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role)) {
            return next(createError(
                StatusCodes.UNAUTHORIZED,
                'You are not authorized to access this route'
            ));
        }
        next();
    }
}

export {
    authenticateUser,
    authorizePermissions
};
