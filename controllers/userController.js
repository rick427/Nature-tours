const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

//:ROUTE HANDLERS

exports.getAllUsers = catchAsync(async (req, res) => {
    const user = await User.find()

    res.status(500).json({
        status: 'success',
        results: user.length,
        data: {users}
    });
});

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

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}

exports.getUserById = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}