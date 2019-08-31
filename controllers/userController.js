const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach(val => {
        if(allowedFields.includes(val)) newObject[val] = obj[val];
    });
    return newObject
}

//:ROUTE HANDLERS

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find()

    res.status(500).json({
        status: 'success',
        results: users.length,
        data: {users}
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
   // 1) create error if user tries to update password
   if(req.body.password || req.body.passwordConfirm) {
       return next(new AppError('This route is not for password updates, please use /updatePassword', 400));
   }

   // 2) filter fields names that shouldnt be updated
   const filteredBody = filterObj(req.body, 'name', 'email');

   //3) update user document
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
       new: true, 
       runValidators: true
    });
   res.status(200).json({
       status: 'success',
       data: {
           user: updatedUser
       }
   })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}

exports.deleteUser = factory.deleteOne(User)

exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}