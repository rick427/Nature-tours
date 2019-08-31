const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// :AUTH ROUTES
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protected, authController.updatePassword);

router.patch('/updateMe', authController.protected, userController.updateMe);
router.delete('/deleteMe', authController.protected, userController.deleteMe);

// :USER ROUTES
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router
    .route('/:tourId/reviews')
    .post(
        authController.protected, 
        authController.restrictTo('user'),
        reviewController.createReview
    )

module.exports = router;