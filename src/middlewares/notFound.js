import { StatusCodes } from 'http-status-codes';

const notFound = (req, res, next) => {
    res.status(StatusCodes.NOT_FOUND).json({
        error: 'Oopps ~~!. Something went wrong, try another path',
    });
}

export default notFound;
