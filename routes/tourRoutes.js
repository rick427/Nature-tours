const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController');
const reviewRoute = require('../routes/reviewRoute');

//:ROUTES
//router.param('id', tourController.checkId);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protected, 
    authController.restrictTo('admin', 'lead-guide', 'guide'), 
    tourController.getMonthlyplan
   );

router
    .route('/')
    .get(authController.protected, tourController.getAllTours)
    .post(
        authController.protected, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.createTour
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protected, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.updateTour
    )
    .delete( 
        authController.protected, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour
    );

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protected, 
//         authController.restrictTo('user'),
//         reviewController.createReview
//     )

router.use('/:tourId/reviews', reviewRoute);

module.exports = router;