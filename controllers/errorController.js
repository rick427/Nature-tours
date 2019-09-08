const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);
}

const handleDuplicateErrorDb = err => {
    const value = err.errmsg.match(/([""'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`

    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(val => val.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // RENDERED WEB-APP
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    
}

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if(req.originalUrl.startsWith('/api')){

        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // Programming or other unknown error: dont leak error details
      
        // 1) Log error
        console.error('ERROR', err);

        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }

    // Rendered web-app
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }
    // Programming or other unknown error: dont leak error details
  
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'please try again later'
    })
}

const handleJwtError = err => new AppError('Invalid token. Please login again', 401);

const handleJwtEpired = err => new AppError('Your token has expired, Please login again', 401);

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    }
    
    else if(process.env.NODE_ENV === 'production'){
        let error = {...err}
        error.message = err.message

        if(error.name === 'CastError')  error =  handleCastErrorDB(error)
        if(error.name === 11000) error = handleDuplicateErrorDb(error);
        if(error.name === 'ValidationError') error= handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJwtError(error);
        if(error.name === 'TokenExpiredError') error = handleJwtEpired(error);
        
        sendErrorProd(error, req, res);
    }
}