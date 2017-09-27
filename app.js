let _ = require('lodash');
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let cors = require('cors');
let passport = require('passport');
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let configAuth = require('./config/auth');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(cors());
app.use(session({
  secret: 'FUNLUNCH',
  resave: false,
  saveUninitialized: true
}));

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(configAuth.googleAuth,
  (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));

/**
 * {
 *   11: {
 *     name: "7 Wonders",
 *     description: "7 Wonders with expansion",
 *     maximum: 7,
 *     creator: dewey,
 *     members: [ dewey ]
 *   }, ...
 * }
 */
const rooms = { 1: {
  name: "7 Wonders",
  description: "7 Wonders with Leaders expansion",
  maximum: 7,
  creator: "dewey",
  members: []
} };
let newId = 1;

app.all('*', (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.route('/room')
  .get((req, res) => {
    res.status(200).send(rooms);
  })
  .put((req, res) => {
    const { name, description, maximum } = req.body;
    if (!name || !description || maximum < 2) {
      res.status(400).send(`Some fields are missing or invalid. ${JSON.stringify(req.body)}`);
      return;
    }
    console.dir(req.session);
    if (!req.session.username) {
      res.status(401).send("Please login.");
      return;
    }
    rooms[++newId] = _.assign(_.pick(req.body, ['name', 'description', 'maximum']), {
      creator: req.session.username,
      members: []
    });
    res.status(200).send({ id: newId, room: rooms[newId] });
  })
  .delete((req, res) => {
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
  });

app.route('/room/:id')
  .all((req, res, next) => {
    const room = rooms[req.params.id];
    if (!room) {
      res.status(400).send(`Invalid room ${id}.`);
    } else {
      next();
    }
  })
  .get((req, res) => {
    const id = req.params.id;
    res.status(200).send(rooms[id]);
  })
  .put((req, res) => {
    const id = req.params.id;
    _.forIn(rooms, (room, id) => rooms[id].members = _.remove(room.members, req.session.username));
    rooms[id].members.push(req.session.username);
    res.status(200).send(rooms[id]);
  })
  .delete((req, res) => {
    const id = req.params.id;
    rooms[id].members = _.remove(rooms[id].members, req.session.username);
    res.status(200).send(rooms[id]);
  });

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (password != 'funlunch') { res.sendStatus(401); return; }
  req.session.username = username;
  console.log(`${username} login.`);
  res.sendStatus(200);
});

app.listen(7777, () => {
  console.log('Listening from 7777...');
});
