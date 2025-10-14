// shringar-backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // jwt.sign() creates a new token.
  // The first argument is the payload, which is the data we want to store in the token.
  // The second argument is the JWT secret from our environment variables.
  // The third argument is an options object, where we can set the token's expiration time.
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;
