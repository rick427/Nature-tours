const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const app = express();

//:MIDDLEWARES
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//:ROUTE HANDLERS
const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
}

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

//:ROUTES
app.route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour)

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

//: SERVER
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));