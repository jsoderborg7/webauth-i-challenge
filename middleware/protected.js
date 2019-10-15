
const bcrypt = require('bcryptjs');
const Users = require('../users/users-model');

function protected(req, res, next){
  const {username, password} = req.body;
  if (username && password){
    Users.findBy({username})
      .first()
      .then(user =>{
        if (user && bcrypt.compareSync(password, user.password)){
          next();
        } else {
          res.status(400).json({message: 'Username or password incorrect'})
        }
      })
      .catch(err =>{
        res.status(500).json(err)
      })
  } else {
    res.status(400).json({message: "Please provide username and password"})
  }
}

module.exports = protected;