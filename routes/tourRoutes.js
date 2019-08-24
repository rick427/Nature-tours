const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController');

//:ROUTES
//router.param('id', tourController.checkId);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyplan);

router
    .route('/')
    .get(authController.protected, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;