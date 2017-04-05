const bcrypt   = require('bcrypt-nodejs');
const crypto   = require('crypto');
const mongoose = require('mongoose');
const shortid  = require('shortid');

const userSchema = new mongoose.Schema({

    _id:      { type: String, required: true, unique: true, default: shortid.generate },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },

    contests: [{
        id:      { type: String, required: true },
        team:    [Number],
        points:  { type: Number, default: 0 },
        entered: { type: Boolean, default: false } //Has the user submitted a team and entered the contest
    }]

}, { timestamps: true });

//Password hash middleware
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, function(err, salt) {
      if (err) { return next(err); }
      bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
      });
  });
});

//Helper method for validating user's password.
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        cb(err, isMatch);
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;