let Room = require('../models/room');
let User = require('../models/user')

exports.getRooms = (req, res) => {
  Room.find().then(rooms => {
    res.status(200).send(rooms);  
  });
}

exports.putRooms = (req, res) => {
  const { name, description, maximum } = req.body;
  if (!name || !description || maximum < 2) {
    res.status(400).send(`Some fields are missing or invalid. ${JSON.stringify(req.body)}`);
    return;
  }

  const room = new Room(_.assign(_.pick(req.body, ['name', 'description', 'maximum']), {
    creator: req.user._id,
    members: []
  }));
  room.save();
  res.status(200).send(room);
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