let _ = require('lodash');
let mongoose = require('mongoose');
let Room = require('../models/room');
let User = require('../models/user');

exports.getRooms = (req, res) => {
  Room.find().then(rooms => {
    const ids = _(rooms)
      .map(room => [ room.createdBy, ...room.members ])
      .flatten()
      .uniq()
      .value();
    const query = { '_id': { $in: ids } };
    User.find(query)
      .then(docs => {
        const users = _(ids).map((id, index) => [id, docs[index]]).fromPairs().value();
        const body = _.mapValues(rooms, room => _.defaults({
          createdBy: users[room.createdBy].name,
          members: _.map(room.members, user => user.name)
        }, _.pick(room, ['name', 'description', 'maximum'])));
        res.status(200).send(body);
      })
      .catch(err => {
        console.error('db error', ids, query);
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
  const { id } = req.body;
  const room = rooms[id];
  if (!room) {
    res.status(400).send(`Invalid room ${id}.`);
    return;
  } 
  if (req.session.username != room.creator) {
    res.status(401).send(`Only creator ${room.creator} can remove the room ${id}.`);
    return;
  }
  delete rooms[id];
  res.sendStatus(200);
}