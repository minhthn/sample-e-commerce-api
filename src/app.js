import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Rfs from 'rotating-file-stream';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './db/connect';
import routes from './routes';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';
import { getDirname } from './utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;
const __dirname = getDirname(import.meta.url);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/v1', express.static(path.join(__dirname, '..', 'public')));
app.use(cors());
app.use(helmet());
app.use(cookieParser(process.env.COOKIES_SECRET));
if (app.get('env') === 'production') {
    const rfs = Rfs.createStream(process.env.LOG_FILE || 'log.txt', {
        size: process.env.LOG_SIZE || '10M',
        interval: process.env.LOG_INTERVAL || '1d',
        compress: 'gzip',
        path: process.env.LOG_PATH || './logs',
    });
    app.use(morgan(process.env.LOG_FORMAT || 'dev', {
        stream: rfs,
    }));
} else {
    app.use(morgan('dev'));
}
app.use(mongoSanitize({
    allowDots: true,
    replaceWith: '_',
}));

const apiRequestLimit = process.env.API_REQUEST_LIMIT || 500;
const apiRequestWindow = parseInt(process.env.API_REQUEST_WINDOW) || 3600000;
const apiRequestWindowPhrase = process.env.API_REQUEST_WINDOW_PHRASE || 'hour';
const apiLimiter = rateLimit({
    windowMs: apiRequestWindow,
    max: apiRequestLimit,
    message: {
        status: 'Failed',
        error: {
            name: 'RateLimitReached',
            message: `You can only make ${apiRequestLimit} requests per ${apiRequestWindowPhrase}. Please try again later.`
        }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter);

// routes
app.use(routes);

// custom middleware
app.use(notFound);
app.use(errorHandler);

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        throw err;
    }
}

start();
