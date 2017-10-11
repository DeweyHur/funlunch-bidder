let _ = require('lodash');
let mongoose = require('mongoose');
let Room = require('../models/room');
let User = require('../models/user');

function serializeUser(user) {
  return { id: user._id.toString(), name: user.name };
}

exports.getRooms = (req, res) => {
  Room.find().lean().then(rooms => {
    const ids = _(rooms)
      .map(room => [ room.createdBy, ...room.members ])
      .flatten()
      .uniqWith((lhs, rhs) => lhs.equals(lhs))
      .value();
    const query = { '_id': { $in: ids } };
    User.find(query).lean()
      .then(docs => {
        const users = _(ids).map((id, index) => [id, docs[index]]).fromPairs().value();
        const body = _.mapValues(rooms, room => _.defaults({
          id: room._id.toString(),
          createdBy: serializeUser(users[room.createdBy]),
          members: _.map(room.members, serializeUser)
        }, _.pick(room, ['name', 'description', 'maximum'])));
        res.status(200).send(body);
      })
      .catch(err => {
        console.error('db error', err, ids, query);
        res.sendStatus(500);
      });
  });
}

exports.putRooms = (req, res) => {
  const { name, description, maximum } = req.body;
  if (!name || !description || maximum < 2) {
    res.status(400).send(`Some fields are missing or invalid. ${JSON.stringify(req.body)}`);
    return;
  }

  const room = new Room(_.assign(_.pick(req.body, ['name', 'description', 'maximum']), {
    _id: mongoose.Types.ObjectId(),
    createdBy: req.user._id,
    members: []
  }));
  room.save()
    .then(room => {
      res.status(200).send(room);    
    }).catch(err => {
      res.sendStatus(400);
    })
  
}

exports.deleteRooms = (req, res) => {
  Room.find().update({ members: [] })
    .then(result => {
      console.log('delete rooms success', result.result);
    }).catch(err => {
      console.error('delete rooms db error', err);
      res.sendStatus(500);
    })
}

exports.deleteRoom = (req, res) => {
  const id = req.params.id;
  if (id) {
    Room.find({ _id: mongoose.Types.ObjectId(id), createdBy: req.user._id }).remove()
      .then(result => {
        console.log('delete room success', result.result);
        res.sendStatus(200);
      })
      .catch(err => {
        console.error('delete room db error', err, id);
        res.sendStatus(401);
      });
  } else {
    res.sendStatus(400);
  }
}