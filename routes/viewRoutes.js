const express = require('express');
const viewContoller = require('../controllers/viewController');

const router = express.Router();

router.get('/', viewContoller.getOverview);
router.get('/login', viewContoller.getLogin);
router.get('/tour/:slug', viewContoller.getTour);

module.exports = router