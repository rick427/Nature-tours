const Tour = require('../models/Tour');

//:ROUTE HANDLERS
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.getAllTours = (req, res) => {
    // res.status(200).json({
    //     status: 'success',
    //     requestAt: req.requestTime,
    //     results: tours.length,
    //     data: {
    //         tours
    //     }
    // })
}

exports.getTour = (req, res) => {
    const id = JSON.parse(req.params.id);
    // const tour = tours.find(tour => tour.id === id);

    // res.status(200).json({
    //     status: 'success',
    //     data: tour
    // })
}

exports.createTour = async (req, res) => {
    // const newTour = new Tour(req.body);
    // newTour.save();
    try {
        const newTour = await Tour.create(req.body);
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