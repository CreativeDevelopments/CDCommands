const { Schema, model } = require("mongoose");

const ticketSystem = new Schema({
  gId: { type: String, required: true },
  uId: { type: String, required: false },
  claim: { type: String, required: false, default: false },
  claimId: { type: String, required: false, default: null },
  channelId: { type: String, required: false, default: null },
  ticketName: { type: String, required: false, default: null },
  closed: { type: Boolean, required: false },
  reason: { type: String, required: false },
});

module.exports = model("cd-tickets", ticketSystem);
