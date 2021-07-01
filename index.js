const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const auth = require('./middleware/auth');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser')
const cors = require('cors');

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const protectedRouter = require("./routes/protected");
const refreshTokenRouter = require("./routes/refreshToken");

// Mongodb connection
// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/login'; 
const dbUrl = 'mongodb://localhost:27017/login'; 
mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Database connected");
});

const app = express();

// cookie handling
app.use(cookieParser());
// session connection
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // time period in seconds
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});
app.use(session({
    store, 
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false, // don't create session until something stored
    resave: false, 
    // saveUninitialized: true,
    cookie: { 
        // secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    } 
}));

// for json encoded body data
app.use(express.json());
// for url encoded body data
app.use(express.urlencoded({extended:true}));

app.use(cors({origin: process.env.FRONTEND_URL,credentials: true}));

// routes
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/logout', logoutRouter)
// if within 15 mins expiry time of access token and logged out old token still gives valid jwt verification  
app.use('/protected', auth, protectedRouter)
app.use('/refresh_token', refreshTokenRouter)



// Listen on port
const port = process.env.PORT || 4000
app.listen(port, ()=>{
   console.log(`Server is running on port ${port}`); 
});