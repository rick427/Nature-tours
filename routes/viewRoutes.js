const express = require('express');
const viewContoller = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewContoller.getOverview);
router.get('/login', authController.isLoggedIn, viewContoller.getLogin);
router.get('/tour/:slug', authController.isLoggedIn, viewContoller.getTour);
router.get('/me', authController.protected, viewContoller.getAccount);
router.post('/submit-user-data', authController.protected, viewContoller.updateUserData);

module.exports = router;