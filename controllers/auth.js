// Load required packages
let passport = require('passport');
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let mongoose = require('mongoose');
let config = require('../config');
let User = require('../models/user');

passport.use(new GoogleStrategy(config.googleAuth,
  (accessToken, refreshToken, profile, callback) => {
    User.find({ gid: profile.id })
      .then((users) => {
        let user = users && users.length > 0 ? users[0] : null;
        if (!user) {
          user = new User({ 
            _id: mongoose.Types.ObjectId(),
            gid: profile.id,
            name: profile.displayName, 
            accessToken 
          });
          user.save()
            .then(user => {
              console.log('user creation success.');
              console.dir(user);
              callback(null, user);
            })
            .catch(err => { 
              console.log('user creation fail.');
              console.dir(err);
              callback(err, user)
            });
        }
        callback(null, user);
      })
      .catch(err => {
        console.dir(err);
        callback(err);
      });
  }
));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
})

exports.googleAuth = passport.authenticate('google', { scope: [ 'profile' ]});
exports.googleAuthCallback = passport.authenticate('google', { successRedirect: '/' });
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(401);
  }
}