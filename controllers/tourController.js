const fs = require('fs');

//:ROUTE HANDLERS
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

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
    //console.log(req.params.id);
    //const id = req.params.id * 1;
    /*This is because the value of :id in params is a string*/
    const id = JSON.parse(req.params.id);
    const tour = tours.find(tour => tour.id === id);

    //if (id > tours.length) {
    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            Message: 'Not Found..'
        })
    }

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
    const id = JSON.parse(req.params.id);

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            Message: 'Not Found..'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Updated Tour'
        }
    })
}

exports.deleteTour = (req, res) => {
    const id = JSON.parse(req.params.id);
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            Message: 'Not Found..'
        });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}