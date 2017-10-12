let _ = require('lodash');
let mongoose = require('mongoose');
let Room = require('../models/room');
let User = require('../models/user');

function serializeUser(user) {
  return { id: user._id.toString(), name: user.name };
}

function isIdEqual(lhs, rhs) {
  return lhs.equals(rhs);
}

exports.getRooms = (req, res) => {
  Room.find().lean().then(rooms => {
    const ids = _(rooms)
      .map(room => [ room.createdBy, ...room.members ])
      .flatten()
      .uniqWith(isIdEqual)
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

exports.createRoom = (req, res) => {
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

exports.kickAllMembers = (req, res) => {
  Room.find().update({ members: [] })
    .then(result => {
      console.log('delete rooms success', result.result);
    }).catch(err => {
      console.error('delete rooms db error', err);
      res.sendStatus(500);
    })
}

exports.deleteRoom = (req, res) => {
  const roomid = _.get(req, 'params.roomid');
  const userid = _.get(req, 'user._id')  
  if (roomid && userid) {
    Room.find({ _id: mongoose.Types.ObjectId(roomid), createdBy: userid }).remove()
      .then(result => {
        console.log('delete room success', result.result);
        res.sendStatus(200);
      })
      .catch(err => {
        console.error('delete room db error', err, roomid);
        res.sendStatus(401);
      });
  } else {
    console.error('bad request', roomid, userid);
    res.sendStatus(400);
  }
}

exports.enterRoom = (req, res) => {
  const roomid = _.get(req, 'params.roomid');
  const userid = _.get(req, 'user._id')
  if (roomid && userid) {
    Room.find({ members: userid }).remove()
      .then(result => {
        console.log('quit from room', result.result);
      })
      .finally(() => {
        Room.findById(roomid).update({ members: [] })
          .then(result => {
            console.log('enter to room', result.result);
            res.sendStatus(200);
          })
          .catch(err => {
            console.error('enter room db error', err, roomid);
            res.sendStatus(500);
          })
      });
  } else {
    console.error('bad request', roomid, userid);
    res.sendSatus(400);
  }
}

exports.leaveRoom = (req, res) => {
  const roomid = _.get(req, 'params.roomid');
  const userid = _.get(req, 'user._id')
  if (roomid && userid) {
    Room.findById(roomid)
      .then(room => {
        room.members = _.uniqWith([ ...room.members, userid ], isIdEqual)
        room.save()
          .then(() => res.sendStatus(200))
          .catch(err => {
            console.error('leave room error', err, roomid, userid);
          })
      });
  } else {
    console.error('bad request', roomid, userid);
    res.sendStatus(400);
  }
}