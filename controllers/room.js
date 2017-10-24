let _ = require('lodash');
let mongoose = require('mongoose');
let Room = require('../models/room');
let User = require('../models/user');

function serializeUser(user) {
  return { id: user._id, name: user.name };
}

exports.getRooms = (req, res) => {
  Room.find().lean().then(rooms => {
    const ids = _(rooms)
      .map(room => [ room.createdBy, ...room.members ])
      .flatten()
      .uniq()
      .value();
    const query = { '_id': { $in: ids } };
    User.find(query).lean()
      .then(docs => {
        const users = _(docs).map(doc => [doc._id, doc]).fromPairs().value();
        const body = _.mapValues(rooms, room => _.defaults({
          id: room._id.toString(),
          createdBy: serializeUser(users[room.createdBy]),
          members: _.map(room.members, id => serializeUser(users[id]))
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
  const { name, description = '', maximum } = req.body;
  if (!name || maximum < 2) {
    res.status(400).send(`Some fields are missing or invalid. ${JSON.stringify(req.body)}`);
    return;
  }

  const room = new Room(_.assign(_.pick(req.body, ['name', 'description', 'maximum']), {
    _id: mongoose.Types.ObjectId().toString(),
    createdBy: req.user._id,
    members: []
  }));
  room.save()
    .then(room => {
      res.status(200).send(room);    
    }).catch(err => {
      console.error('create room fail', err, room);
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
    Room.findOne({ _id: roomid, createdBy: userid }).remove()
      .then(result => {
        console.log(`delete room ${roomid} success`);
        res.sendStatus(200);
        return [ _id ];
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
  const userid = _.get(req, 'user._id');
  const body = [];
  if (roomid && userid) {
    leaveRoomIfEntered(userid)
      .then(leftRoom => {
        if (leftRoom) body.push(leftRoom);
        enterRoomImpl(roomid, userid);
      }) 
      .then(enteredRoom => {
        body.push(enteredRoom);
        res.status(200).send(body);
      })
      .catch(err => res.sendStatus(500));
  } else {
    console.error('bad request', roomid, userid);
    res.sendSatus(400);
  }
}

exports.leaveRoom = (req, res) => {
  const roomid = _.get(req, 'params.roomid');
  const userid = _.get(req, 'user._id')
  if (roomid && userid) {
    leaveRoomImpl(roomid, userid)
      .then(room => {
        res.status(200).send([room]);
        return room;
      })
      .catch(err => res.sendStatus(500));
  } else {
    console.error('bad request', roomid, userid);
    res.sendStatus(400);
  }
}

function leaveRoomIfEntered(userid) {
  return Room.findOne({ members: userid })
    .then(room => leaveRoomImpl(room.id, userid))
    .catch(err => null);
}

function enterRoomImpl(roomid, userid) {
  return Room.findOne({ _id: roomid })
    .then(room => {
      if (room) {
        room.members = [...room.members, userid];
        room.save().then(result => {
          console.log(`${userid} entered to room ${roomid}`);
          return room;
        });
      } else {
        console.error('room doesnt exist', roomid, userid);
        return Promise.reject('room doesnt exist');
      }
    })
    .catch(err => {
      console.error('enter room db error', err, roomid, userid);
      return Promise.reject(err);
    });
}

function leaveRoomImpl(roomid, userid) {
  return Room.findOne({ _id: roomid })
    .then(room => {
      if (room) {
        room.members = _.without(room.members, userid);
        room.save()
          .then(room => {
            console.log(`${userid} succeeded to leave room ${roomid}`);
            return room;
          })
          .catch(err => {
            console.error('leave room error', err, roomid, userid);
            return err;
          });
      }
    });
}