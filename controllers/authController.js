const crypto = require('crypto');
const {promisify} = require('util');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signedToken = id => {
   return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const {name, email, password, passwordConfirm, role} = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        role
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
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perfrom this action', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1). get user based on posted email
    const user = await User.findOne({email: req.body.email})
    if(!user) return next(new AppError('There is no user with that email address', 404));

    //2). generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    //3). send it to the users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:\n 
    ${resetUrl}\n\nIf you didn't forget your password, please ignore this email`;

    try {       
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10mins)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending thsi email. Try again later', 500))
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
       .createHash('sha256')
       .update(req.params.token)
       .digest('hex');
    
    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: {$gt: Date.now()}
    })

    // 2) If token has not expired, and user exists, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changedPassword property for the user

    // 4) Log the user in, send JWT
    const token = signedToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});