const { v4: uuidv4 } = require("uuid");

function generateInviteToken() {
  return uuidv4();
}

function getExpiryDate(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

module.exports = { generateInviteToken, getExpiryDate };