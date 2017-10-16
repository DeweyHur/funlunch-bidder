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
let util = require('util');
let config = require('./config');
let authController = require('./controllers/auth');
let roomController = require('./controllers/room');
let userController = require('./controllers/user');

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
  console.log(`${req.method} ${req.url} ${util.inspect(req.body, { colors: true }).replace(/\n/g, '')}`);
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

app.get('/auth/google', authController.googleAuth);
app.get('/auth/google/callback',authController.googleAuthCallback);
app.get('/auth/facebook', authController.facebookAuth);
app.get('/auth/facebook/callback',authController.facebookAuthCallback);
app.get('/auth/logout', authController.logout);

router.route('/room')
  .get(roomController.getRooms)
  .put(authController.isAuthenticated, roomController.createRoom)
  .delete(authController.isAuthenticated, roomController.kickAllMembers);

router.get('/user/me', userController.getMe);

router.route('/room/:roomid')
  .put(authController.isAuthenticated, roomController.enterRoom)
  .delete(authController.isAuthenticated, roomController.deleteRoom);

router.delete('/room/:roomid/me', authController.isAuthenticated, roomController.leaveRoom)

app.use('/api', router);

