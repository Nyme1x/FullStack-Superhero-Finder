require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(cors());


app.use(express.json());
require('./models/user')
require('./models/UserVerification')
const path = require('path');




const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));




const clientFolderPath = path.join(__dirname, '..', 'client');

app.use('/', express.static(clientFolderPath));

app.use(express.static(path.join(__dirname, 'views')));


const superheroRoute = require('./routes/superheroes');
app.use('/superheroes', superheroRoute);

const listsRouter = require('./routes/lists'); // adjust the path as necessary
app.use('/lists', listsRouter);

const usersRouter = require("./routes/users");
app.use('/users', usersRouter);




// Set mongoose Promise to global Promise
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect("mongodb+srv://naimbadawi:naim@lab4.awyae6a.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Could not connect to MongoDB:', err.message);
    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Not Found Error Handler
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// General Error Handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});



// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});