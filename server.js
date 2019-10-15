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
  if (username && password){
    Users.findBy({username})
      .first()
      .then(user =>{
        console.log(user);
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