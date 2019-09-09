const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');
const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        // user-7575739834230-53489438r.jpeg
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
});

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach(val => {
        if(allowedFields.includes(val)) newObject[val] = obj[val];
    });
    return newObject
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

//:ROUTE HANDLERS

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);

   // 1) create error if user tries to update password
   if(req.body.password || req.body.passwordConfirm) {
       return next(new AppError('This route is not for password updates, please use /updatePassword', 400));
   }

   // 2) filter fields names that shouldnt be updated
   const filteredBody = filterObj(req.body, 'name', 'email');

   //3) update user document
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
       new: true, 
       runValidators: true
    });
   res.status(200).json({
       status: 'success',
       data: {
           user: updatedUser
       }
   })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use signup instead'
    })
}

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// Only for admin, do not update password with this route
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getUserById = factory.getOne(User);