const express = require('express');
const fs = require('fs');

const app = express();

//middlewares
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));