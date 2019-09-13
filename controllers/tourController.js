const Tours = require('../models/Tour');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports .uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    console.log(req.files);

    if(!req.files.imageCover || !req.files.images) return next();

    // Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.file.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // Images
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename)
    }))
    next();
});


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

//  tours-within/:distance/center/:latlang/unit/:unit
//  tours-within/233/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlang, unit} = req.params;
    const [lat, lng] = latlang.split(',')

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

    if(!lat || !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng", 400))
    }

    const tours = await Tours.find({
        startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync( async(req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng", 400))
    }

    const distances = await Tours.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})