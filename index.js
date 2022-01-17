const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const dotenv = require('dotenv')

const app = express();
dotenv.config()

// Load routes
const ideas = require('./routes/ideas.js');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
// app.use(methodOverride('_method'));

const MongoDBStore = require('connect-mongodb-session')(session);

// Sessions to be stored in mongodb database
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions'
});

// Express session middleware
app.use(session({
  secret: 'app_secret',
  resave: false,
  saveUninitialized: false,
  httpOnly: true, 
  store: store, /* store session data in mongodb */ 
  cookie: { path: '/', httpOnly: true, maxAge: 36000000}
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Set media folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Use routes
app.use('/ideas', ideas);
app.use('/users', users);

app.listen(process.env.PORT || 5000, () =>{
  console.log(`Server started..`);
});