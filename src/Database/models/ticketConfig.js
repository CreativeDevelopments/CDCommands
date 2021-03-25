const { Schema, model } = require("mongoose");

const ticketConfig = new Schema({
  gId: { type: String, required: true },
  maxTickets: { type: Number, required: false, default: 1 },
  supportRoles: { type: String, required: false, default: null },
  claim: { type: Boolean, required: false, default: true },
  category: { type: String, required: false, default: null },
  close: { type: String, required: false, default: null },
  log: { type: String, required: false, default: null },
});

module.exports = model("cd-ticketconfig", ticketConfig);
