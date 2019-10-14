const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const server = express();

server.use(helmet());
server.use(express.json());


module.exports = server;