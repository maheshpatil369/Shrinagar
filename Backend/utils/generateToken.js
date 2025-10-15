// shringar-backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // jwt.sign() creates a new token.
  // The first argument is the payload, which is the data we want to store in the token.
  // The second argument is the JWT secret from our environment variables.
  // The third argument is an options object for setting the token's expiration.
  // We use the environment variable if it's set, otherwise we default to 30 days.
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
