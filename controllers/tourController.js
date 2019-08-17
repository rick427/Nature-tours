const fs = require('fs');

//:ROUTE HANDLERS
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkId = (req, res, next, val) => {
    //console.log(`Tour id is ${val}`);

    const id = JSON.parse(req.params.id);
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            Message: 'Not Found..'
        });
    }
    next();
}

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
}

exports.getTour = (req, res) => {
    const id = JSON.parse(req.params.id);
    const tour = tours.find(tour => tour.id === id);

    res.status(200).json({
        status: 'success',
        data: tour
    })
}

exports.createTour = (req, res) => {
    //console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({
        id: newId
    }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        if (err) return console.log(err);
        res.status(201).json({
            status: 'success',
            data: newTour
        })
    });
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