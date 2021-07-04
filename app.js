const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();


const User = require('./models/User');

dotenv.config();
//connect to mongodb
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongodb connected');
    })
    .catch((err) => {
        console.log('MongoDb connection error');
    });

//EJS
app.use(expressLayouts);
app.set('view engine','ejs');
app.use(cors());
//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


//Routes
app.use('/',require('./routes/api'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,console.log(`server is running on port ${PORT}`));