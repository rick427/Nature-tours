const Tours = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');

//:ROUTE HANDLERS

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    };
};

exports.getTour = async (req, res) => {
    try {
        //Tours.findOne({_id: req.params.id})
        const tour = await Tours.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            data: tour
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.createTour = async (req, res) => {
    // const newTour = new Tour(req.body);
    // newTour.save();
    try {
        const newTour = await Tours.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tours.findByIdAndRemove(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//AGGREGATION  PIPELINE
exports.getTourStats = async (req, res) => {
   try{
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
   }
   catch(err){
    res.status(404).json({
        status: 'fail',
        message: err
    }); 
   }
}

exports.getMonthlyplan = async (req, res) => {
    try {
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

    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });   
    }
}