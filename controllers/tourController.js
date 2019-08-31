const Tours = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//:ROUTE HANDLERS

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {

    //: EXECUTE QUERY
    const features = new APIFeatures(Tours.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const tours = await features.query;

    //: SEND QUERY 
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //Tours.findOne({_id: req.params.id})
    const tour = await Tours.findById(req.params.id);

    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: tour
    });
    
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tours.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
})

exports.updateTour = catchAsync(async (req, res, next) => {
  
    const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  
    const tour = await Tours.findByIdAndRemove(req.params.id)

    if(!tour){
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

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