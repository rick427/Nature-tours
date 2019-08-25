const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//:GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
    max: 100, //100 requests from the same IP in 1hr
    windowMs: 60 * 60 * 1000,
    message: 'Too Many requests from this IP. Please try again in an hour!' 
});
app.use('/api', limiter); // apply limiter to all routes starting with '/api
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//:ROUTES
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Cannot find ${req.originalUrl} on this server`);
    // err.status = 'fail',
    // err.statusCode = 404

    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

//:ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;