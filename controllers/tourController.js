const Tours = require('../models/Tour');

//:ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
    try {
        console.log(req.query);
        //:BUILD QUERY
        // 1a.) filtering
        const queryObj = {
            ...req.query
        };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(ex => delete queryObj[ex]);

        // 1b.) Advanced Filtering ie adding dollar to mongo operators
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Tours.find(JSON.parse(queryStr));

        // 2) SORTING
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            console.log(sortBy)
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //: EXECUTE QUERY
        const tours = await query;

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
            message: err
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