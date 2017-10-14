let _ = require('lodash');
let User = require('../models/user');

exports.getMe = (req, res) => {
  const user = _.get(req, 'session.passport.user');
  if (user) {
    res.send(user).status(200);
  } else {
    res.sendStatus(401);
  }
};

exports.createUser = (email, name) => {
  return User.find({ _id: email })
    .then((users) => {
      let user = users && users.length > 0 ? users[0] : null;
      if (!user) {
        user = new User({ _id: email, name });
        return user.save()
          .then(user => {
            console.log(`User Created: ${user.name}(${user._id})`);
            return user;
          })
          .catch(err => { 
            console.error(`User Creation Failed: ${name}(${email})`, err);
            throw err;
          });
      } else {
        console.log(`User Signed in: ${user.name}(${user._id})`);
        return user;
      }
    })
    .catch(err => {
      console.error(`Bad email: ${email}`);
      throw err;
    });
}