const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const bodyParser = require('body-parser')
const User = require('./user')
const app = express()

mongoose.connect('mongodb+srv://admin:horus@cluster0.wlzv5pw.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('Mongoose is connected')
})

//Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(session({
    secret: "SECRETCODE",
    resave: true,
    saveUninitialized: true
    }))

app.use(cookieParser('SECRETCODE'))
app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)
//_____________________________END OF MIDDLEWARE_________________________-

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) throw err
        if(!user) res.send('No user exists')
        else {
            req.login(user, err => {
                if(err) throw err
                res.send('Successfully Authenticated')
                console.log(req.user)
            })
        }
    })(req, res, next)
})
app.post('/register', (req, res) => {
    User.findOne({username: req.body.username}, async (err, doc) => {
        const {username, password} = req.body
        const hashedPass = await bcrypt.hash(password, 10)
        if(err) throw err
        if(doc) res.status(200).send("User Already exists")
        if(!doc) {
            const newUser = new User({
                username: username,
                password: hashedPass
            })
            await newUser.save()
            res.status(200).send('User created')
        }
    })
})

app.get('/user', (req, res) => {
    res.send(req.user)
})


app.listen(3001, () => {
    console.log('$listening on PORT 3001 ')
})