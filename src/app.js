require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('../routes/routes');

// Create the express app
const app = express();

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'secreto',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('upload'))

// Set template engine
app.set('view engine', 'ejs');

app.use('', router);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});