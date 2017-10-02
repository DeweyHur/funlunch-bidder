let _ = require('lodash');
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let passport = require('passport');
let mongoose = require('mongoose');
let Promise = require('bluebird');

let config = require('./config');
let authController = require('./controllers/auth');
let roomController = require('./controllers/room');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(session({
  secret: 'FUNLUNCH',
  resave: false,
  saveUninitialized: true
}));

mongoose.Promise = Promise;

let connection = `mongodb://${config.mongoose.username}:${config.mongoose.password}@cluster0-shard-00-00-gwoyf.mongodb.net:27017,cluster0-shard-00-01-gwoyf.mongodb.net:27017,cluster0-shard-00-02-gwoyf.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;
console.log(`Connecting to DB.. ${connection}`);
mongoose.connect(connection, {
  useMongoClient: true
});

let router = express.Router();

app.all('*', (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/auth/google', passport.authenticate('google', { scope: [ 'profile' ] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google' }));

router.route('/room')
  .get(roomController.getRooms)
  .put(authController.isAuthenticated, roomController.putRooms)
  .delete(authController.isAuthenticated, roomController.deleteRooms);

router.route('/room/:id')
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
  .put(isLoggedIn, (req, res) => {
    const id = req.params.id;
    _.forIn(rooms, (room, id) => rooms[id].members = _.remove(room.members, req.session.username));
    rooms[id].members.push(req.session.username);
    res.status(200).send(rooms[id]);
  })
  .delete(isLoggedIn, (req, res) => {
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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(401);
  }
}

app.use('/api', router);

app.listen(7777, () => {
  console.log('Listening from 7777...');
});
