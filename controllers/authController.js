const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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