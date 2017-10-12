let _ = require('lodash');

exports.getMe = (req, res) => {
  const user = _.get(req, 'session.passport.user');
  if (user) {
    res.send(user).status(200);
  } else {
    res.sendStatus(401);
  }
};