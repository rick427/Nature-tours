const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if(req.params.tourId) filter = {tour: req.params.tourId}

  const reviews = await Review.find(filter);
  res.status(200).json({
      status: 'success',
      result: reviews.length,
      data: {
          reviews
      }
  });
});

exports.setTourUserId = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id
    next();
}

exports.createReview = catchAsync(async (req,res,next) => {
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status:' success',
        data: {newReview}
    })
})

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);