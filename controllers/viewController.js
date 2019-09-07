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

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The forest hiker tour'
    });
}