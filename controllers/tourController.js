const Tours = require('../models/Tour');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');


exports.getAllTours = factory.getAll(Tours);

exports.getTour = factory.getOne(Tours, {path: 'reviews'});

exports.createTour = factory.createOne(Tours);

exports.updateTour = factory.updateOne(Tours)

exports.deleteTour = factory.deleteOne(Tours);

//:ROUTE HANDLERS

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

//AGGREGATION  PIPELINE
exports.getTourStats = catchAsync(async (req, res, next) => {
 
    const stats = await Tours.aggregate([
        {
            $match: {ratingAverage: {$gte: 4.5}}
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'}, 
                numofTours: {$sum: 1},
                numOfRatings: {$sum: '$ratingQuantity'},
                avRating: {$avg: '$ratingAverage'}, 
                avPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        },
        {
            $sort: {
                avPrice: 1
            }
        }
        ]);
        res.status(200).json({
        status: 'success',
        data: {stats}
    });
});

exports.getMonthlyplan = catchAsync(async (req, res, next) => {
   
    console.log(req.params.year);
    const year = req.params.year * 1; 

    const plan = await Tours.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {startDates: {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}}
        },
        {
            $group: {
                _id: {$month: '$startDates'},
                numToursStarts: {$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {_id: 0}
        },
        {
            $sort: {numofTourStart: -1}
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {plan}
    });
});