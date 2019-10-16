const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Users = require('./users/users-model');
const Protected = require('./middleware/protected');
const sessions = require('express-session');
const KnexSessionStore = require('connect-session-knex')(sessions);

const knexConfig = require('./data/db-config');

const server = express();

const sessionConfig = {
  name: "heckyes",
  secret: 'secret secret',
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    secure: false,
  },
  resave: false,
  saveUninitialized: true,
  store: new KnexSessionStore({
    knex: knexConfig,
    createtable: true,
    clearInterval: 1000 * 60 * 30,
  }),
};

server.use(sessions(sessionConfig));

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) =>{
  res.send("We're connected!")
});

server.post('/api/register', (req, res) =>{
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash;
  Users.add(user)
    .then(user =>{
      res.status(200).json(user)
    })
    .catch(err =>{
      res.status(500).json({message: "Could not add user"})
    })
})

server.post('/api/login', (req, res) =>{
  let {username, password} = req.body;
    Users.findBy({username})
      .first()
      .then(user =>{
        console.log(user);
        if (user && bcrypt.compareSync(password, user.password)){
          req.session.username = user.username;
          console.log('session', req.session);
          res.status(200).json({message: `${user.username} is logged in!`})
        } else {
          res.status(400).json({message: "Invalid username or password"})
        }
      })
      .catch(err =>{
        res.status(500).json(err)
      })
});

server.get('/api/logout', (req, res) =>{
  if (req.session){
    req.session.destroy(err =>{
      res.status(200).json({message: "Well ok then"})
    })
  } else {
    res.status(200).json({message: 'Already logged out'})
  }
});

server.get('/api/users', Protected, (req, res) =>{
  Users.find()
  .then(user =>{
    res.json(user)
  })
  .catch(err =>{
    res.json(err)
  })
});


module.exports = server;