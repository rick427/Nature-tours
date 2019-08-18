const Tours = require('../models/Tour');

//:ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
    try {
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
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 3) LIMITING
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }

        // 4) PAGINATION
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const nosOfTours = await Tours.countDocuments();
            if (skip >= nosOfTours) throw new Error('This page does not exist..')
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