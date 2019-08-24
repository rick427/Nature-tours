const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A name is required']
    },
    email: {
        type: String,
        required: [true, 'An email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'A password is required'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on .create & .save
            validator: function(val){
                return val === this.password
            },
            message: 'Passwords are not the same'
        }
    }
});

userSchema.pre('save', async function(next){
    // only run function is password was modified
    if(!this.isModified('password')) return next();

    //hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //do not persist passwordConfirm to the database
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidPassword, userpassword){
  return await bcrypt.compare(candidPassword, userpassword);
};

const User = mongoose.model('User', userSchema)
module.exports = User;