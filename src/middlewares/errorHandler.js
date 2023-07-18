import { StatusCodes } from 'http-status-codes';

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.log(">> err.stack:", err.stack);

    if (typeof req.removeImages === 'function') {
        req.removeImages();
    }

    const customError = {
        status: err.status || StatusCodes.INTERNAL_SERVER_ERROR,
        name: err.name || 'Unknown error',
        message: err.message || 'An error occurred',
    };

    // mongoose validation error
    if (err.name === 'ValidationError') {
        customError.status = StatusCodes.BAD_REQUEST;
        customError.message = {};
        Object.keys(err.errors).forEach((field) => {
            customError.message[field] = err.errors[field].message;
        });
    }
    // mongoose duplicate error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        customError.status = StatusCodes.BAD_REQUEST;
        customError.message = `Duplicate value for '${Object.keys(err.keyValue)}' field. Please try again`;
    }
    // mongoose cast error
    if (err.name === 'CastError') {
        customError.status = StatusCodes.BAD_REQUEST;
        customError.message = `Invalid product id: '${err.value}'`;
    }
    // res.status(err.status || 500).json(err);
    res.status(customError.status).json({
        status: 'Failed',
        error: {
            name: customError.name,
            message: customError.message,
        }
    });
}

export default errorHandler;
