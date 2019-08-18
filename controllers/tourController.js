const Tours = require('../models/Tour');

//:ROUTE HANDLERS
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = async (req, res) => {
    try {
        const tours = await Tours.find();
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
            message: 'Invalid data sent'
        })
    }
}

exports.updateTour = (req, res) => {

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Updated Tour'
        }
    })
}

exports.deleteTour = (req, res) => {

    res.status(204).json({
        status: 'success',
        data: null
    });
}