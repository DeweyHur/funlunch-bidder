let _ = require('lodash');
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let passport = require('passport');
let mongoose = require('mongoose');
let Promise = require('bluebird');
let cons = require('consolidate');
let path = require('path');
let config = require('./config');
let authController = require('./controllers/auth');
let roomController = require('./controllers/room');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'FUNLUNCH',
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  // app.locals.session = req.session;
  next(null, req, res);
});
app.use(express.static('views'));
app.use(passport.initialize());
app.use(passport.session());

mongoose.Promise = Promise;

let connection = `mongodb://${config.mongoose.username}:${config.mongoose.password}@cluster0-shard-00-00-gwoyf.mongodb.net:27017,cluster0-shard-00-01-gwoyf.mongodb.net:27017,cluster0-shard-00-02-gwoyf.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;
console.log(`Connecting to DB.. ${connection}`);
let db = mongoose.connection;
db.on('error', (err) => {
  console.log('connection error:', err);
});
db.once('open', (callback) => {
  console.log('db open');
  app.listen(7777, () => {
    console.log('Listening from 7777...');
  });
});
mongoose.connect(connection, {
  useMongoClient: true
});

let router = express.Router();

app.get('/', (req, res) => {
  res.render('main', { user: _.get(req, 'session.passport.user') });
});
app.get('/auth/google', passport.authenticate('google', { scope: [ 'profile' ]}));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/' }), (req, res) => {
  app.locals.bearer = req.user._id;
});
app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.route('/room')
  .get(roomController.getRooms)
  .put(authController.isAuthenticated, roomController.putRooms)
  .delete(authController.isAuthenticated, roomController.deleteRooms);

router.route('/user/me')
  .get((req, res) => {
    const user = _.get(req, 'session.passport.user');
    if (user) {
      res.send(user).status(200);
    } else {
      res.sendStatus(401);
    }
  });

router.route('/room/:id')
  .delete(authController.isAuthenticated, roomController.deleteRoom);

// router.route('/room/:id')
//   .all((req, res, next) => {
//     const room = rooms[req.params.id];
//     if (!room) {
//       res.status(400).send(`Invalid room ${id}.`);
//     } else { 
//       next();
//     }
//   })
//   .get((req, res) => {
//     const id = req.params.id;
//     res.status(200).send(rooms[id]);
//   })
//   .put(isLoggedIn, (req, res) => {
//     const id = req.params.id;
//     _.forIn(rooms, (room, id) => rooms[id].members = _.remove(room.members, req.session.username));
//     rooms[id].members.push(req.session.username);
//     res.status(200).send(rooms[id]);
//   })
//   .delete(isLoggedIn, (req, res) => {
//     const id = req.params.id;
//     rooms[id].members = _.remove(rooms[id].members, req.session.username);
//     res.status(200).send(rooms[id]);
//   });

app.use('/api', router);

