let _ = require('lodash');
let passport = require('passport');
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let FacebookStrategy = require('passport-facebook');
let mongoose = require('mongoose');
let config = require('../config');
let userController = require('./user');

const strategyHandler = (profileParser, accessToken, refreshToken, profile, callback) => {
  const { email, name } = profileParser(profile);
  if (email && name) {
    userController.createUser(email, name, accessToken)
      .then(user => callback(null, user))
      .catch(err => callback(err, null));
  } else {
    console.error('email or name is invalid', email, name, profile);
    callback('email or name is invalid', null);
  }
};

passport.use(new GoogleStrategy(config.googleAuth, (p1, p2, p3, p4) => strategyHandler(profile => ({
  email: _.get(profile, 'emails[0].value'),
  name: profile.displayName  
}), p1, p2, p3, p4)));
passport.use(new FacebookStrategy(_.defaults({
  profileFields: ['displayName', 'email']
}, config.facebookAuth), (p1, p2, p3, p4) => strategyHandler(profile => ({
  email: _.get(profile, 'emails[0].value') || profile.id + '@facebook.com',
  name: profile.displayName
}), p1, p2, p3, p4)));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
})

exports.googleAuth = passport.authenticate('google', { scope: [ 'profile', 'email' ]});
exports.googleAuthCallback = passport.authenticate('google', { successRedirect: '/' });
exports.facebookAuth = passport.authenticate('facebook');
exports.facebookAuthCallback = passport.authenticate('facebook', { successRedirect: '/' });
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