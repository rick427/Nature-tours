const express = require('express');
const viewContoller = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewContoller.getOverview);
router.get('/login', viewContoller.getLogin);
router.get('/tour/:slug', viewContoller.getTour);

module.exports = router;