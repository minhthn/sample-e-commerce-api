import createError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

const checkerPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.id === resourceUserId.toString()) return;
    const err = createError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to do this action',
    );
    throw err;
}

export default checkerPermissions;
