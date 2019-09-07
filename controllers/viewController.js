const Tours = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tours.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
})

exports.getTour = catchAsync(async (req, res) => {
    // !) Get the data
    const tour = await Tours.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    res.status(200).render('tour', {
        title: 'The forest hiker tour',
        tour
    });
})