const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const db = require('./data/db-config');
const Users = require('./users/users-model');
const Protected = require('./middleware/protected');

const server = express();

server.use(helmet());
server.use(express.json());

server.get('/', (req, res) =>{
  res.send("We're connected!")
});

server.post('/api/register', (req, res) =>{
  const userData = req.body;
  const hash = bcrypt.hashSync(userData.password, 10)
  userData.password = hash;
  Users.add(userData)
    .then(user =>{
      res.status(200).json(user)
    })
    .catch(err =>{
      res.status(500).json({message: "Could not add user"})
    })
})

server.post('/api/login', (req, res) =>{
  let {username, password} = req.body;
  if (username && password){
    Users.findById({username})
      .first()
      .then(user =>{
        if (user && bcrypt.compareSync(password, user.password)){
          res.status(200).json({message: `${user.username} is logged in!`})
        } else {
          res.status(400).json({message: "Invalid username or password"})
        }
      })
      .catch(err =>{
        res.status(500).json(err)
      })
  } else {
    res.status(400).json({message: 'Please provide username and password'})
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