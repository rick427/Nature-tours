const Tours = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tours.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
})

exports.getTour = catchAsync(async (req, res, next) => {
    // !) Get the data
    const tour = await Tours.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if(!tour){
     return next(new AppError('There is no tour with that name', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
})

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    }); 
}