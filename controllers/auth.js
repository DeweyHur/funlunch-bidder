// Load required packages
let passport = require('passport');
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let config = require('../config');
let User = require('../models/user');

passport.use(new GoogleStrategy(config.googleAuth,
  (accessToken, refreshToken, profile, callback) => {
    User.findOne({ _id: profile.id })
      .then(user => callback(null, user))
      .catch(err => {
        const user = new User({ _id: profile.id, name: profile.displayName });
        user.save();
        callback(null, user);
      });
  }
));
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
})

exports.isAuthenticated = passport.authenticate('google', { scope: [ 'profile' ] });