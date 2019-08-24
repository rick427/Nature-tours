const {promisify} = require('util');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signedToken = id => {
   return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm} = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm
    });

    const token = signedToken(newUser._id)

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
   const {email, password} = req.body;

   // 1). Check if email and password exists
   if(!email || !password){
       return next(new AppError('Please provide email and password', 400));
   }
   // 2). Check if the user exists && password matches
   const user = await User.findOne({email}).select('+password');
   const correct = await user.correctPassword(password, user.password);

   if(!user || !correct){
       return next(new AppError('Incorrect email or password', 401));
   }

   // 3). if everything checks out, send token to the client
   const token = signedToken(user._id);
   res.status(200).json({
       status: 'success',
       token
   });
});

exports.protected = catchAsync(async (req, res, next) => {
    //1). Get token and check if it exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not logged in...unauthorized', 401));
    }

    //2). verify the token
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3). check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user matching this token does not exist any longer', 401));
    }

    //4). check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password!. Please login again', 401));
    }

    req.user = currentUser;
    next();
})